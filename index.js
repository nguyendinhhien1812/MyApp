/**
 * @format
 */
import './gesture-handler.native';
import { AppRegistry, Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { ScriptManager, Script } from '@callstack/repack/client';
import { name as appName } from './app.json';
import App from './src/app';

enableScreens(); // Enable screens for better performance

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  let url;
  if (caller === 'main') {
    url = Script.getDevServerURL(scriptId);
  } else {
    // Resolve chunks from miniApp running on port 9000
    url = `http://localhost:9000/${scriptId}.chunk.bundle`;
  }
  
  if (!url) {
    return undefined;
  }
  
  return {
    url,
    cache: false,
    query: {
      platform: Platform.OS,
    },
  };
});

AppRegistry.registerComponent(appName, () => App);
