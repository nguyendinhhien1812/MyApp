import React, { useRef, useState, useCallback } from 'react';
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

// Safe lazy require — tránh crash khi native module chưa được link (pod install chưa chạy)
let WebView: any = null;
let webViewAvailable = false;
try {
  WebView = require('react-native-webview').WebView;
  webViewAvailable = true;
} catch (_e) {
  webViewAvailable = false;
}

const PRIMARY      = '#E89951';

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

  const webviewRef = useRef<any>(null);

  const [canGoBack,   setCanGoBack]   = useState(false);
  const [loadingPct,  setLoadingPct]  = useState(0);   // 0–100
  const [isLoading,   setIsLoading]   = useState(true);
  const [hasError,    setHasError]    = useState(false);

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
            <Icon type="ionicon" name="close" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.errorBox}>
          <Icon type="ionicon" name="construct-outline" size={44} color="#ccc" />
          <Text style={styles.errorTitle}>Cần rebuild ứng dụng</Text>
          <Text style={styles.errorSub}>
            Chạy{' '}
            <Text style={{ fontWeight: '700', color: '#555' }}>pod install</Text>
            {' '}và rebuild từ Xcode để kích hoạt WebView
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => Linking.openURL(url).catch(() => {})}>
            <Icon type="ionicon" name="open-outline" size={14} color="#fff" />
            <Text style={styles.retryText}>Mở trong Safari</Text>
          </TouchableOpacity>
        </View>
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
            color="#fff"
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
          <Icon type="ionicon" name="refresh-outline" size={18} color="#fff" />
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
          <Icon type="ionicon" name="wifi-outline" size={40} color="#ccc" />
          <Text style={styles.errorTitle}>Không thể tải trang</Text>
          <Text style={styles.errorSub}>{url}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
              webviewRef.current?.reload();
            }}>
            <Icon type="ionicon" name="refresh-outline" size={14} color="#fff" />
            <Text style={styles.retryText}>Thử lại</Text>
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
              <ActivityIndicator size="large" color={PRIMARY} />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },

  // Header
  header: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Progress bar
  progressWrap: {
    height: 3,
    backgroundColor: 'rgba(232,153,81,0.2)',
  },
  progressBar: {
    height: 3,
    backgroundColor: PRIMARY,
  },

  // WebView
  webview: { flex: 1 },

  // Loading overlay (used by renderLoading)
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  // Error state
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
    backgroundColor: '#F2F2F7',
  },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#555' },
  errorSub:   { fontSize: 11, color: '#bbb', textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
