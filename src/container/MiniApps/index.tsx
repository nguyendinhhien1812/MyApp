// Danh sách mini-app do registry quyết định.
//
// Đây là chỗ duy nhất chứng minh cả chuỗi chạy thật:
//   registry (server) -> manifest -> ScriptManager resolver -> tải bundle -> render.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { version as hostVersion } from '../../../package.json';
import SubHeader from '../../components/UI/SubHeader';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';
import { logger } from '../../utils/logger';
import {
  ensureManifest,
  reloadManifest,
  getManifest,
  REGISTRY_URL,
  DEV_VERSION,
  MiniAppEntry,
} from '../../services/miniAppService';
import { isLoadable, getLoaded, loadMiniApp } from './loaders';

type RowState = 'idle' | 'loading' | 'ready' | 'error';

/** Tên mini-app do server đặt, không nằm trong translations.ts. */
const entryName = (entry: MiniAppEntry, lang: string): string =>
  entry.name?.[lang] ?? entry.name?.vi ?? entry.name?.en ?? entry.id;

interface Props { navigation: any; }

const MiniAppsScreen = ({ navigation }: Props) => {
  const { t, lang } = useLanguage();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [entries, setEntries] = useState<MiniAppEntry[]>(() => getManifest());
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState(false);
  // Trạng thái tải riêng từng dòng — một mini-app hỏng không làm hỏng dòng khác
  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  const apply = useCallback((next: MiniAppEntry[]) => {
    setEntries(next);
    setRowState(Object.fromEntries(next.map(e => [e.id, getLoaded(e.id) ? 'ready' : 'idle'])));
  }, []);

  const fetchList = useCallback(
    async (force: boolean) => {
      setRefreshing(true);
      setListError(false);
      try {
        apply(await (force ? reloadManifest(hostVersion) : ensureManifest(hostVersion)));
      } catch (err) {
        // loadManifest tự nuốt lỗi mạng, tới đây là lỗi bất thường
        logger.error('miniapp', 'không lấy được danh sách mini-app', err);
        setListError(true);
      } finally {
        setRefreshing(false);
      }
    },
    [apply],
  );

  // Lúc khởi động, manifest còn đang chờ AsyncStorage nên getManifest() có thể
  // rỗng. Chờ đúng promise mà index.js đã tạo, không gọi tải thêm lần nữa.
  useEffect(() => { fetchList(false); }, [fetchList]);

  const refresh = useCallback(() => fetchList(true), [fetchList]);


  const open = useCallback(
    async (entry: MiniAppEntry) => {
      if (getLoaded(entry.id)) {
        navigation.navigate('MiniAppHostScreen', { id: entry.id });
        return;
      }
      setRowState(s => ({ ...s, [entry.id]: 'loading' }));
      try {
        await loadMiniApp(entry.id);
        setRowState(s => ({ ...s, [entry.id]: 'ready' }));
        navigation.navigate('MiniAppHostScreen', { id: entry.id });
      } catch (err) {
        logger.error('miniapp', `không tải được "${entry.id}"`, err);
        setRowState(s => ({ ...s, [entry.id]: 'error' }));
      }
    },
    [navigation],
  );

  const renderRow = (entry: MiniAppEntry) => {
    const supported = isLoadable(entry.id);
    const state = rowState[entry.id] ?? 'idle';
    const busy = state === 'loading';

    const statusText = !supported
      ? t.miniApp.stateUnsupported
      : busy
        ? t.miniApp.stateLoading
        : state === 'ready'
          ? t.miniApp.stateReady
          : state === 'error'
            ? t.miniApp.loadFailed
            : t.miniApp.stateIdle;

    return (
      <TouchableOpacity
        key={entry.id}
        style={[styles.card, !supported && styles.cardMuted]}
        activeOpacity={supported ? 0.85 : 1}
        disabled={!supported || busy}
        onPress={() => open(entry)}
      >
        <View style={styles.iconWrap}>
          <Icon
            type="ionicon"
            name={entry.icon || 'cube-outline'}
            size={20}
            color={supported ? c.accent700 : c.muted}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{entryName(entry, lang)}</Text>
            <View style={styles.versionChip}>
              <Text style={styles.versionText}>
                {entry.version === DEV_VERSION ? DEV_VERSION : `v${entry.version}`}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.status,
              state === 'error' && styles.statusError,
              state === 'ready' && styles.statusReady,
            ]}
            numberOfLines={2}
          >
            {statusText}
          </Text>
          {!supported && <Text style={styles.hint}>{t.miniApp.unsupportedHint}</Text>}
          {state === 'error' && <Text style={styles.hint}>{t.miniApp.loadFailedHint}</Text>}
        </View>

        {busy ? (
          <ActivityIndicator size="small" color={c.accent700} />
        ) : supported ? (
          <Icon
            type="ionicon"
            name={state === 'error' ? 'refresh' : 'chevron-forward'}
            size={18}
            color={c.accent700}
          />
        ) : (
          // Không mũi tên cho dòng bấm không được — mũi tên là lời hứa sẽ mở ra
          <Icon type="ionicon" name="lock-closed-outline" size={16} color={c.muted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <SubHeader
        title={t.miniApp.title}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={refresh} disabled={refreshing} hitSlop={8}>
            {refreshing
              ? <ActivityIndicator size="small" color={c.accent700} />
              : <Icon type="ionicon" name="refresh" size={20} color={c.text} />}
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lede}>{t.miniApp.lede}</Text>

        <View style={styles.sourceRow}>
          <View style={[styles.sourceDot, !REGISTRY_URL && styles.sourceDotDev]} />
          <Text style={styles.sourceText}>
            {REGISTRY_URL ? t.miniApp.sourceRegistry : t.miniApp.sourceDev}
          </Text>
          <Text style={styles.hostText}>{t.miniApp.hostVersion} v{hostVersion}</Text>
        </View>

        {listError && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{t.miniApp.listFailed}</Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={styles.bannerAction}>{t.miniApp.reload}</Text>
            </TouchableOpacity>
          </View>
        )}

        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Icon type="ionicon" name="cube-outline" size={30} color={c.muted} />
            <Text style={styles.emptyTitle}>{t.miniApp.empty}</Text>
            <Text style={styles.emptyHint}>{t.miniApp.emptyHint}</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={refresh} disabled={refreshing}>
              <Text style={styles.emptyBtnText}>{t.miniApp.reload}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map(renderRow)
        )}

        <View style={{ height: SPACING.s5 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MiniAppsScreen;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: SPACING.screenX, paddingTop: SPACING.s3, paddingBottom: 100 },

    lede: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      color: c.subtext,
      lineHeight: 18,
    },

    sourceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: SPACING.s3,
      marginBottom: SPACING.s3,
    },
    sourceDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.success },
    sourceDotDev: { backgroundColor: c.muted },
    sourceText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext, flex: 1 },
    hostText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },

    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.s3,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: RADII.item,
      paddingHorizontal: SPACING.s3,
      paddingVertical: SPACING.s2,
      marginBottom: SPACING.s3,
    },
    bannerText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.danger, flex: 1 },
    bannerAction: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700 },

    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.s3,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: RADII.card,
      padding: SPACING.s3,
      marginBottom: SPACING.s2,
    },
    cardMuted: { opacity: 0.7 },

    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: RADII.item,
      backgroundColor: c.accent100,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    info: { flex: 1, minWidth: 0, gap: 2 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s2 },
    name: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.text, flexShrink: 1 },
    versionChip: {
      backgroundColor: c.accent100,
      borderRadius: RADII.chip,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    versionText: { fontFamily: FONT.medium, fontSize: 11, color: c.accent700 },

    status: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted },
    statusReady: { color: c.success },
    statusError: { color: c.danger },
    hint: { fontFamily: FONT.regular, fontSize: 11, color: c.muted, lineHeight: 15 },

    empty: {
      alignItems: 'center',
      gap: SPACING.s2,
      paddingVertical: SPACING.s5,
      paddingHorizontal: SPACING.s4,
    },
    emptyTitle: {
      fontFamily: FONT.medium,
      fontSize: TYPE.body,
      color: c.text,
      textAlign: 'center',
    },
    emptyHint: {
      fontFamily: FONT.regular,
      fontSize: TYPE.caption,
      color: c.muted,
      textAlign: 'center',
      lineHeight: 18,
    },
    emptyBtn: {
      marginTop: SPACING.s2,
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: RADII.chip,
      paddingHorizontal: SPACING.s4,
      paddingVertical: 7,
    },
    emptyBtnText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700 },
  });
