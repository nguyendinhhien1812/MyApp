import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { Icon } from '@rneui/themed';
import Svg, { Rect } from 'react-native-svg';
import AppIcon from '../../components/Icon';
import { ICON_TYPE } from '../../components/Icon/style';
import SubHeader from '../../components/UI/SubHeader';
import { AppSnackbar } from '../../components/UI';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';

const PRIMARY = '#b68235'; // đồng — dùng cho logo giữa QR
const USER_NAME = 'Nguyễn Đình Hiến'; // tên riêng — không dịch

/** Simple QR-like SVG pattern */
const QRCode = () => (
  <Svg width={160} height={160} viewBox="0 0 42 42">
    {/* Top-left finder */}
    <Rect x="1" y="1" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="3" y="3" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    {/* Top-right finder */}
    <Rect x="29" y="1" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="31" y="3" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    {/* Bottom-left finder */}
    <Rect x="1" y="29" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="3" y="31" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    {/* Center orange logo */}
    <Rect x="17" y="17" width="8" height="8" fill={PRIMARY} rx="1.5" />
    {/* Data dots scattered */}
    <Rect x="15" y="1" width="2" height="2" fill="#1a1a1a" />
    <Rect x="19" y="1" width="2" height="2" fill="#1a1a1a" />
    <Rect x="23" y="1" width="2" height="2" fill="#1a1a1a" />
    <Rect x="15" y="4" width="3" height="2" fill="#1a1a1a" />
    <Rect x="21" y="4" width="2" height="3" fill="#1a1a1a" />
    <Rect x="15" y="8" width="2" height="4" fill="#1a1a1a" />
    <Rect x="19" y="7" width="4" height="2" fill="#1a1a1a" />
    <Rect x="29" y="15" width="4" height="2" fill="#1a1a1a" />
    <Rect x="35" y="15" width="6" height="2" fill="#1a1a1a" />
    <Rect x="29" y="19" width="3" height="2" fill="#1a1a1a" />
    <Rect x="34" y="19" width="7" height="3" fill="#1a1a1a" />
    <Rect x="29" y="24" width="5" height="2" fill="#1a1a1a" />
    <Rect x="37" y="24" width="4" height="2" fill="#1a1a1a" />
    <Rect x="1" y="15" width="3" height="2" fill="#1a1a1a" />
    <Rect x="6" y="15" width="5" height="2" fill="#1a1a1a" />
    <Rect x="1" y="19" width="2" height="3" fill="#1a1a1a" />
    <Rect x="5" y="19" width="6" height="2" fill="#1a1a1a" />
    <Rect x="1" y="24" width="4" height="2" fill="#1a1a1a" />
    <Rect x="15" y="29" width="2" height="4" fill="#1a1a1a" />
    <Rect x="19" y="29" width="4" height="2" fill="#1a1a1a" />
    <Rect x="25" y="29" width="6" height="3" fill="#1a1a1a" />
    <Rect x="35" y="29" width="2" height="4" fill="#1a1a1a" />
    <Rect x="19" y="33" width="2" height="4" fill="#1a1a1a" />
    <Rect x="23" y="35" width="5" height="2" fill="#1a1a1a" />
    <Rect x="30" y="33" width="3" height="2" fill="#1a1a1a" />
    <Rect x="35" y="35" width="6" height="6" fill="#1a1a1a" rx="0.5" />
  </Svg>
);

/** Small QR for bottom sheet */
const QRCodeSmall = () => (
  <Svg width={52} height={52} viewBox="0 0 42 42">
    <Rect x="1" y="1" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="3" y="3" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    <Rect x="29" y="1" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="31" y="3" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    <Rect x="1" y="29" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="3" y="31" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    <Rect x="17" y="17" width="8" height="8" fill={PRIMARY} rx="1.5" />
  </Svg>
);

interface Props {
  navigation: any;
}

const QRPayScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<'myqr' | 'scan'>('myqr');
  const [amountEnabled, setAmountEnabled] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [toast, setToast] = useState('');

  const handleShare = async () => {
    try {
      await Share.share({ message: 'Mã QR chuyển tiền: Nguyễn Đình Hiến - Vietcombank 9876 5432 10' });
    } catch {
      // Share bị user huỷ — hành vi bình thường, không phải lỗi cần báo
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <SubHeader
        title={t.qrpay.title}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setToast(t.common.demoFeature)} hitSlop={8}>
            <AppIcon type={ICON_TYPE.Iconoir} name="more-horiz" size={20} color={colors.accent700} />
          </TouchableOpacity>
        }
      />

      {/* Tab segmented control */}
      <View style={styles.tabArea}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myqr' && styles.tabActive]}
            onPress={() => setActiveTab('myqr')}>
            <Text style={[styles.tabText, activeTab === 'myqr' && styles.tabTextActive]}>
              {t.qrpay.tabMyQr}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scan' && styles.tabActive]}
            onPress={() => setActiveTab('scan')}>
            <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>
              {t.qrpay.tabScan}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'myqr' ? (
        /* ── MÃ CỦA TÔI ── */
        <>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}>

            {/* QR Card */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>{t.qrpay.myQrLabel}</Text>
              <View style={styles.qrWrapper}>
                <QRCode />
              </View>
              <Text style={styles.qrName}>{USER_NAME}</Text>
              <Text style={styles.qrAccount}>Vietcombank · 9876 5432 10</Text>
              <View style={styles.qrPill}>
                <Icon type="ionicon" name="scan-outline" size={12} color={colors.accent700} />
                <Text style={styles.qrPillText}>{t.qrpay.scanToTransfer}</Text>
              </View>
              <View style={{ height: 16 }} />
            </View>

            {/* Nhập số tiền */}
            <View style={styles.card}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>{t.qrpay.requestAmount}</Text>
                  <Text style={styles.toggleSub}>{t.qrpay.requestAmountSub}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, amountEnabled ? styles.toggleOn : styles.toggleOff]}
                  onPress={() => setAmountEnabled(v => !v)}>
                  <View style={[styles.toggleThumb, amountEnabled ? styles.thumbOn : styles.thumbOff]} />
                </TouchableOpacity>
              </View>
              {amountEnabled && (
                <View style={styles.amountInput}>
                  <Text style={styles.amountPlaceholder}>{t.qrpay.amountPlaceholder}</Text>
                </View>
              )}
            </View>

          </ScrollView>

          {/* Bottom actions */}
          <View style={styles.bottomActions}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => setToast(t.qrpay.qrSaved)}>
                <Icon type="ionicon" name="download-outline" size={16} color={colors.accent700} />
                <Text style={styles.btnOutlineText}>{t.qrpay.saveImage}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSolid} onPress={handleShare}>
                <Icon type="ionicon" name="share-outline" size={16} color="#fff" />
                <Text style={styles.btnSolidText}>{t.qrpay.share}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.btnOutlineFull}
              onPress={() => setActiveTab('scan')}>
              <Icon type="ionicon" name="qr-code-outline" size={16} color={colors.accent700} />
              <Text style={styles.btnOutlineText}>{t.qrpay.scanOther}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /* ── QUÉT MÃ QR ── */
        <View style={styles.scanContainer}>
          {/* Fake camera grid */}
          <View style={styles.cameraGrid}>
            <View style={[styles.gridLine, styles.gridV1]} />
            <View style={[styles.gridLine, styles.gridV2]} />
            <View style={[styles.gridH1]} />
            <View style={[styles.gridH2]} />
          </View>

          {/* Scan frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.scanLine} />
          </View>

          <Text style={styles.scanHint}>{t.qrpay.scanHint}</Text>

          {/* Controls */}
          <View style={styles.scanControls}>
            <View style={styles.controlItem}>
              <TouchableOpacity
                style={[styles.controlBtn, flashOn && styles.controlBtnActive]}
                onPress={() => setFlashOn(v => !v)}>
                <Icon
                  type="ionicon"
                  name={flashOn ? 'flashlight' : 'flashlight-outline'}
                  size={20}
                  color={flashOn ? colors.accent700 : '#fff'}
                />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>{t.qrpay.flash}</Text>
            </View>
            <View style={styles.controlItem}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => setToast(t.common.demoFeature)}>
                <Icon type="ionicon" name="images-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>{t.qrpay.gallery}</Text>
            </View>
          </View>

          {/* Bottom sheet */}
          <View style={styles.scanSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetRow}>
              <View style={styles.sheetQR}>
                <QRCodeSmall />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetName}>{t.qrpay.sheetMyQr}</Text>
                <Text style={styles.sheetBank}>{USER_NAME} · VCB</Text>
              </View>
              <TouchableOpacity style={styles.sheetShare} onPress={handleShare}>
                <Text style={styles.sheetShareText}>{t.qrpay.share}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <AppSnackbar
        visible={!!toast}
        onDismiss={() => setToast('')}
        message={toast}
        tone={toast === t.qrpay.qrSaved ? 'success' : 'default'}
        duration={1800}
      />
    </SafeAreaView>
  );
};

export default QRPayScreen;

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  // Tab segmented control (nền sáng)
  tabArea: {
    paddingHorizontal: SPACING.screenX,
    paddingTop: SPACING.s2,
    paddingBottom: SPACING.s3,
  },
  tabBar: {
    backgroundColor: c.divider,
    borderRadius: RADII.item,
    padding: 3,
    flexDirection: 'row',
    gap: 3,
  },
  tab: { flex: 1, height: 34, borderRadius: RADII.chip, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: c.white },
  tabText: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.subtext },
  tabTextActive: { fontFamily: FONT.semibold, color: c.accent700 },

  // My QR
  scroll: { padding: SPACING.screenX, gap: SPACING.s3, paddingBottom: 20 },
  card: { backgroundColor: c.white, borderRadius: RADII.card, overflow: 'hidden', alignItems: 'center' },
  sectionLabel: {
    fontFamily: FONT.regular,
    fontSize: TYPE.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.muted,
    marginTop: SPACING.s4,
    marginBottom: SPACING.s3,
  },
  qrWrapper: {
    padding: 14,
    backgroundColor: c.white,
    borderRadius: RADII.item,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  qrName: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text, marginTop: 12 },
  qrAccount: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext, marginTop: 4 },
  qrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: c.accent100,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  qrPillText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700 },

  // Amount toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.s4,
    gap: SPACING.s3,
    alignSelf: 'stretch',
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.text },
  toggleSub: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext, marginTop: 2 },
  toggle: { width: 40, height: 22, borderRadius: 11, justifyContent: 'center', borderWidth: 1 },
  toggleOn: { backgroundColor: c.accent, borderColor: c.accent },
  toggleOff: { backgroundColor: 'transparent', borderColor: c.border },
  toggleThumb: { width: 16, height: 16, borderRadius: 8, position: 'absolute' },
  thumbOn: { right: 2, backgroundColor: c.offWhite },
  thumbOff: { left: 2, backgroundColor: c.muted },
  amountInput: {
    marginHorizontal: SPACING.s4,
    marginBottom: SPACING.s4,
    backgroundColor: c.accent100,
    borderRadius: RADII.item,
    padding: 12,
    alignSelf: 'stretch',
  },
  amountPlaceholder: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.muted, fontStyle: 'italic' },

  // Bottom actions
  bottomActions: { padding: SPACING.screenX, gap: SPACING.s2, backgroundColor: c.bg },
  actionRow: { flexDirection: 'row', gap: SPACING.s2 },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: RADII.item,
    borderWidth: 1,
    borderColor: c.accent,
  },
  btnOutlineText: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.accent700 },
  btnSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: RADII.item,
    backgroundColor: c.heroDark,
  },
  btnSolidText: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.offWhite },
  btnOutlineFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: RADII.item,
    borderWidth: 1,
    borderColor: c.accent,
  },

  // Scanner
  scanContainer: {
    flex: 1,
    backgroundColor: c.heroDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  cameraGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04 },
  gridLine: { position: 'absolute', backgroundColor: '#fff' },
  gridV1: { left: '33%', top: 0, bottom: 0, width: 0.5 },
  gridV2: { left: '66%', top: 0, bottom: 0, width: 0.5 },
  gridH1: { position: 'absolute', top: '33%', left: 0, right: 0, height: 0.5, backgroundColor: '#fff' },
  gridH2: { position: 'absolute', top: '66%', left: 0, right: 0, height: 0.5, backgroundColor: '#fff' },

  scanFrame: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: c.accent,
    borderStyle: 'solid',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  scanLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: 'rgba(216,183,131,0.85)',
    borderRadius: 1,
  },
  scanHint: { fontFamily: FONT.regular, fontSize: TYPE.body, color: 'rgba(253,252,251,0.55)', textAlign: 'center' },

  scanControls: { flexDirection: 'row', gap: 36 },
  controlItem: { alignItems: 'center', gap: 6 },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#fff',
  },
  controlLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },

  // Scan bottom sheet
  scanSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: c.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetQR: {
    backgroundColor: c.divider,
    borderRadius: 10,
    padding: 4,
    borderWidth: 0.5,
    borderColor: c.border,
  },
  sheetName: { fontFamily: FONT.semibold, fontSize: TYPE.body, color: c.text },
  sheetBank: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.subtext, marginTop: 2 },
  sheetShare: {
    backgroundColor: c.accent100,
    borderRadius: RADII.chip,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sheetShareText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700 },
});
