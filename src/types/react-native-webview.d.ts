// Temporary type stubs for react-native-webview.
// Run `npm install` to install the real package and replace these.
declare module 'react-native-webview' {
  import * as React from 'react';
  import { StyleProp, ViewStyle } from 'react-native';

  export interface WebViewNavigation {
    canGoBack: boolean;
    canGoForward: boolean;
    loading: boolean;
    url: string;
    title: string;
  }

  export interface WebViewProgressEvent {
    nativeEvent: { progress: number };
  }

  export interface WebViewHttpErrorEvent {
    nativeEvent: { statusCode: number; url: string };
  }

  export interface WebViewProps {
    source?: { uri: string } | { html: string };
    style?: StyleProp<ViewStyle>;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    thirdPartyCookiesEnabled?: boolean;
    sharedCookiesEnabled?: boolean;
    allowsInlineMediaPlayback?: boolean;
    applicationNameForUserAgent?: string;
    startInLoadingState?: boolean;
    onNavigationStateChange?: (event: WebViewNavigation) => void;
    onLoadStart?: () => void;
    onLoadProgress?: (event: WebViewProgressEvent) => void;
    onLoadEnd?: () => void;
    onError?: () => void;
    onHttpError?: (event: WebViewHttpErrorEvent) => void;
    renderLoading?: () => React.ReactElement;
    goBack?: () => void;
    reload?: () => void;
  }

  export class WebView extends React.Component<WebViewProps> {
    goBack(): void;
    goForward(): void;
    reload(): void;
    stopLoading(): void;
  }

  export default WebView;
}
