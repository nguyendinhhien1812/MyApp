import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Linking,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import type { WebViewNavigation } from 'react-native-webview';
import { AppSnackbar } from '../../components/UI';
import { logger } from '../../utils/logger';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/paperTheme';
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';

// Safe lazy require — tránh crash khi native module chưa được link (pod install chưa chạy)
let WebView: any = null;
let webViewAvailable = false;
try {
  WebView = require('react-native-webview').WebView;
  webViewAvailable = true;
} catch (_e) {
  webViewAvailable = false;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteParams {
  url: string;
  title: string;
}

interface Props {
  navigation: any;
  route: { params: RouteParams };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const WebViewScreen = ({ navigation, route }: Props) => {
  const { url, title } = route.params;

  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const webviewRef = useRef<any>(null);

  const [canGoBack,   setCanGoBack]   = useState(false);
  const [loadingPct,  setLoadingPct]  = useState(0);   // 0–100
  const [isLoading,   setIsLoading]   = useState(true);
  const [hasError,    setHasError]    = useState(false);
  const [toast,       setToast]       = useState('');

  // ── Android hardware back → go back inside WebView first ──
  useFocusEffect(
    useCallback(() => {
      const handler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBack) {
          webviewRef.current?.goBack();
          return true; // consumed — don't pop the screen
        }
        return false; // let React Navigation pop the screen
      });
      return () => handler.remove();
    }, [canGoBack]),
  );

  const handleBack = () => {
    if (canGoBack) {
      webviewRef.current?.goBack();
    } else {
      navigation.goBack();
    }
  };

  const handleNavChange = (state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
  };

  // ── Native module chưa link → hiện fallback, không crash ──
  if (!webViewAvailable) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Icon type="ionicon" name="close" size={18} color={colors.accent700} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.errorBox}>
          <Icon type="ionicon" name="construct-outline" size={44} color={colors.muted} />
          <Text style={styles.errorTitle}>{t.webview.needRebuild}</Text>
          <Text style={styles.errorSub}>
            <Text style={{ fontWeight: '700', color: colors.text }}>pod install</Text>
            {' '}{t.webview.needRebuildDesc}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() =>
              Linking.openURL(url).catch(err => {
                logger.warn('webview', `không mở được link ngoài: ${url}`, err);
                setToast(t.common.linkOpenFailed);
              })
            }>
            <Icon type="ionicon" name="open-outline" size={14} color={colors.offWhite} />
            <Text style={styles.retryText}>{t.webview.openSafari}</Text>
          </TouchableOpacity>
        </View>

        <AppSnackbar
          visible={!!toast}
          onDismiss={() => setToast('')}
          message={toast}
          tone="default"
          duration={2200}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
          <Icon
            type="ionicon"
            name={canGoBack ? 'arrow-back' : 'close'}
            size={18}
            color={colors.accent700}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>

        {/* Reload button */}
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            setHasError(false);
            webviewRef.current?.reload();
          }}>
          <Icon type="ionicon" name="refresh-outline" size={18} color={colors.accent700} />
        </TouchableOpacity>
      </View>

      {/* ── Progress bar ── */}
      {isLoading && !hasError && (
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${loadingPct}%` }]} />
        </View>
      )}

      {/* ── Error state ── */}
      {hasError && (
        <View style={styles.errorBox}>
          <Icon type="ionicon" name="wifi-outline" size={40} color={colors.muted} />
          <Text style={styles.errorTitle}>{t.webview.loadFailed}</Text>
          <Text style={styles.errorSub}>{url}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
              webviewRef.current?.reload();
            }}>
            <Icon type="ionicon" name="refresh-outline" size={14} color={colors.offWhite} />
            <Text style={styles.retryText}>{t.webview.retry}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── WebView ── */}
      {!hasError && (
        <WebView
          ref={webviewRef}
          source={{ uri: url }}
          style={styles.webview}
          onNavigationStateChange={handleNavChange}
          onLoadStart={() => {
            setIsLoading(true);
            setLoadingPct(10);
          }}
          onLoadProgress={({ nativeEvent }: { nativeEvent: { progress: number } }) => {
            setLoadingPct(Math.round(nativeEvent.progress * 100));
          }}
          onLoadEnd={() => {
            setIsLoading(false);
            setLoadingPct(100);
          }}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onHttpError={({ nativeEvent }: { nativeEvent: { statusCode: number } }) => {
            // Only treat 4xx/5xx as errors
            if (nativeEvent.statusCode >= 400) {
              setHasError(true);
              setIsLoading(false);
            }
          }}
          // Allow mixed content + JS for sites like Gmail / LinkedIn
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          allowsInlineMediaPlayback
          // User-agent: desktop to avoid mobile paywalls / login loops
          applicationNameForUserAgent="MyAppPortfolio/1.0"
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          )}
          startInLoadingState
        />
      )}
    </SafeAreaView>
  );
};

export default WebViewScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },

  // Header
  header: {
    backgroundColor: c.bg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.s4,
    paddingVertical: SPACING.s3,
    gap: SPACING.s2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: c.accent100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT.semibold,
    fontSize: TYPE.itemTitle,
    color: c.text,
  },

  // Progress bar
  progressWrap: {
    height: 3,
    backgroundColor: c.divider,
  },
  progressBar: {
    height: 3,
    backgroundColor: c.accent,
  },

  // WebView
  webview: { flex: 1 },

  // Loading overlay (used by renderLoading)
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.white,
  },

  // Error state
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
    backgroundColor: c.bg,
  },
  errorTitle: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
  errorSub:   { fontFamily: FONT.regular, fontSize: TYPE.caption, color: c.muted, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.heroDark,
    borderRadius: RADII.item,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  retryText: { fontFamily: FONT.semibold, fontSize: TYPE.itemTitle, color: c.offWhite },
});
