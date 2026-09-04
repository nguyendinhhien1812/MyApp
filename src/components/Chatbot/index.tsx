// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
  Clipboard,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { ThemeColors } from '../../theme/paperTheme';
import { logger } from '../../utils/logger';
import { askDirect } from '../../services/directAi';
import { TOOL_DECLARATIONS } from '../../services/toolDeclarations';
import { RADII, TYPE, FONT } from '../../theme/tokens';
import { AppButton } from '../UI';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeColors } from '../../context/ThemeContext';
import type { Translations } from '../../i18n/translations';
import { loadHistory, saveHistory, clearHistory, loadApiKey, saveApiKey } from '../../services/chatService';
import { runTool, NavIntent } from '../../services/toolRunner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 60;

const SYSTEM_PROMPT =
  'Bạn là trợ lý AI thân thiện của MyApp — ứng dụng quản lý tài chính cá nhân gồm: ' +
  'Ngân hàng (chuyển tiền, QR Pay, nạp tiền, quản lý thẻ), Đầu tư (cổ phiếu, tỷ giá), ' +
  'Chi phí (thống kê chi tiêu). Trả lời ngắn gọn, hữu ích, bằng đúng ngôn ngữ người dùng đang dùng.';

// Proxy giữ API key phía server (xem server/README.md). Để rỗng thì bỏ qua proxy.
// Đây chỉ là URL, không phải bí mật — nằm trong bundle là bình thường.
const AI_PROXY_URL = '';

// Giữ key trong bộ nhớ phiên — không mất khi đóng/mở lại chat
let cachedApiKey = '';

// ─── 2. Types ──────────────────────────────────────────────────────────────
type ChatMessage = {
  id: string;
  text: string;
  role: 'user' | 'bot' | 'error';
};

// ─── 3. Demo mode — trả lời tự động không cần API key ──────────────────────
const demoReply = (input: string, t: Translations): string => {
  const s = input.toLowerCase();
  if (/(chuyển tiền|chuyen tien|transfer)/.test(s)) {return t.chatbot.demoTransfer;}
  if (/(tiết kiệm|tiet kiem|chi tiêu|chi tieu|saving|save|expense)/.test(s)) {return t.chatbot.demoSaving;}
  if (/(tính năng|tinh nang|làm được|lam duoc|feature|what can|có gì|co gi)/.test(s)) {return t.chatbot.demoFeatures;}
  if (/(xin chào|chào|hello|hi|hey)/.test(s)) {return t.chatbot.demoGreeting;}
  return t.chatbot.demoFallback;
};


// fetch của RN 0.74 không có response.body nên không đọc stream được.
// XMLHttpRequest thì responseText lớn dần theo onprogress — cắt phần mới ra là có delta.
const askProxyStream = (
  messages: unknown[],
  t: Translations,
  onDelta: (chunk: string) => void,
): Promise<{ text: string; isError: boolean }> =>
  new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    let consumed = 0; // đã xử lý tới đâu trong responseText
    let pending = ''; // phần đuôi chưa trọn dòng
    let full = '';
    let failed = false;

    const drain = () => {
      pending += xhr.responseText.slice(consumed);
      consumed = xhr.responseText.length;

      const lines = pending.split('\n');
      pending = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data:')) {
          continue;
        }
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') {
          continue;
        }
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) {
            failed = true;
          } else if (parsed.t) {
            full += parsed.t;
            onDelta(parsed.t);
          }
        } catch {
          // Dòng vỡ do cắt giữa chừng — bỏ qua, lần sau sẽ đủ
        }
      }
    };

    xhr.onprogress = drain;
    xhr.onload = () => {
      drain();
      if (xhr.status === 429) {
        resolve({ text: t.chatbot.errRateLimit, isError: true });
        return;
      }
      if (failed || xhr.status < 200 || xhr.status >= 300 || !full) {
        logger.error('chatbot', `stream lỗi ${xhr.status}`);
        resolve({ text: t.chatbot.errNetwork, isError: true });
        return;
      }
      resolve({ text: full, isError: false });
    };
    xhr.onerror = () => {
      logger.error('chatbot', 'không gọi được stream');
      resolve({ text: t.chatbot.errNetwork, isError: true });
    };

    xhr.open('POST', `${AI_PROXY_URL}/chat/stream`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ messages }));
  });

// Chặng 1 của vòng tool calling: hỏi model xem có cần gọi hàm nào không.
// Không stream được ở chặng này vì thứ trả về là lệnh gọi hàm chứ không phải chữ.
type ToolTurn =
  | { kind: 'text'; text: string }
  // id do Claude sinh ra; phải gửi lại nguyên vẹn trong tool_result thì model
  // mới ghép được kết quả với lời gọi.
  | { kind: 'call'; id: string; name: string; input: Record<string, unknown> }
  | { kind: 'error' };

const askForTool = async (messages: unknown[]): Promise<ToolTurn> => {
  try {
    const res = await fetch(`${AI_PROXY_URL}/chat/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    if (!res.ok) {
      logger.error('chatbot', `chặng tool lỗi ${res.status}`, data?.error);
      return { kind: 'error' };
    }
    if (data.toolUse?.id && data.toolUse?.name) {
      return { kind: 'call', id: data.toolUse.id, name: data.toolUse.name, input: data.toolUse.input ?? {} };
    }
    if (typeof data.text === 'string') {
      return { kind: 'text', text: data.text };
    }
    return { kind: 'error' };
  } catch (err) {
    logger.error('chatbot', 'không gọi được chặng tool', err);
    return { kind: 'error' };
  }
};

// Hình dạng của Anthropic: { role: 'user' | 'assistant', content }.
// Server vẫn cắt lại lượt và độ dài — đây chỉ là lớp lọc đầu tiên.
const toMessages = (history: ChatMessage[]) =>
  history
    .filter(m => m.role !== 'error')
    .slice(-20)
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

// ─── 6. Main component ─────────────────────────────────────────────────────
const Chatbot = () => {
  const { t } = useLanguage();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Typing indicator (3 chấm nhấp nháy) — inner component để dùng `styles` theo theme

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [apiKey, setApiKey] = useState(cachedApiKey);
  const [keyDraft, setKeyDraft] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Chờ đọc xong AsyncStorage rồi mới cho phép ghi, nếu không lần ghi đầu
  // (mảng rỗng) sẽ xoá mất lịch sử vừa nạp.
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const navigation = useNavigation<any>();
  // Model có thể yêu cầu mở màn; chỉ mở SAU khi nó nói xong, để người dùng
  // đọc được lời giải thích trước khi bị chuyển đi.
  const pendingNavRef = useRef<NavIntent | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  // Câu hỏi cuối để nút "Thử lại" gửi lại đúng nội dung đó
  const lastSentRef = useRef('');
  // Chỉ tự cuộn khi người dùng đang ở gần đáy, tránh giật khi họ đọc lại
  const nearBottomRef = useRef(true);

  // FAB kéo thả, hút về mép màn hình
  const pan = useRef(
    new Animated.ValueXY({ x: SCREEN_WIDTH - BUTTON_SIZE - 20, y: SCREEN_HEIGHT - 200 }),
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const currentX = (pan.x as any)._value;
        const targetX =
          currentX > SCREEN_WIDTH / 2 - BUTTON_SIZE / 2 ? SCREEN_WIDTH - BUTTON_SIZE - 10 : 10;
        let targetY = (pan.y as any)._value;
        if (targetY < 50) {targetY = 50;}
        if (targetY > SCREEN_HEIGHT - BUTTON_SIZE - 100) {targetY = SCREEN_HEIGHT - BUTTON_SIZE - 100;}
        Animated.spring(pan, { toValue: { x: targetX, y: targetY }, useNativeDriver: false }).start();
      },
    }),
  ).current;

  useEffect(() => {
    // Dán key một lần là xong — lần mở app sau tự nạp lại
    loadApiKey().then(k => {
      if (k) { cachedApiKey = k; setApiKey(k); }
    });

    loadHistory().then(saved => {
      if (saved.length) { setMessages(saved); }
      setHistoryLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (historyLoaded) { saveHistory(messages); }
  }, [messages, historyLoaded]);

  const pushMessage = (text: string, role: ChatMessage['role']) =>
    setMessages(prev => [...prev, { id: `${Date.now()}-${role}`, text, role }]);

  const streamInto = async (convo: unknown[]) => {
    const streamId = `${Date.now()}-stream`;
    let opened = false;

    const { text: reply, isError } = await askProxyStream(convo, t, chunk => {
      setMessages(prev => {
        if (!opened) {
          opened = true;
          return [...prev, { id: streamId, text: chunk, role: 'bot' }];
        }
        return prev.map(m => (m.id === streamId ? { ...m, text: m.text + chunk } : m));
      });
    });

    if (isError) {
      // Bỏ phần đã bồi dở rồi thay bằng bong bóng lỗi có nút thử lại
      setMessages(prev => prev.filter(m => m.id !== streamId));
      pushMessage(reply, 'error');
      pendingNavRef.current = null;
      return;
    }
    if (!opened) { pushMessage(reply, 'bot'); }

    const nav = pendingNavRef.current;
    pendingNavRef.current = null;
    if (nav) {
      setIsChatOpen(false);
      navigation.navigate(nav.screen, {
        ...(nav.contactName ? { contact: { name: nav.contactName } } : {}),
        ...(nav.amount ? { amount: nav.amount } : {}),
      });
    }
  };

  const newChat = () => {
    clearHistory();
    setMessages([]);
    setInputText('');
    lastSentRef.current = '';
  };

  const retryLast = () => {
    if (!lastSentRef.current) {return;}
    // Gỡ bong bóng lỗi và câu hỏi hỏng ở cuối, rồi gửi lại từ đầu
    setMessages(prev => {
      const trimmed = [...prev];
      while (trimmed.length && trimmed[trimmed.length - 1].role !== 'user') {
        trimmed.pop();
      }
      trimmed.pop();
      return trimmed;
    });
    const again = lastSentRef.current;
    setTimeout(() => send(again), 0);
  };

  const copyMessage = (text: string) => {
    // Clipboard của core RN đã deprecated nhưng vẫn chạy ở 0.74; đổi sang
    // @react-native-clipboard/clipboard khi nào cần đụng lại phần native.
    Clipboard.setString(text);
    setToast(t.chatbot.copied);
    setTimeout(() => setToast(''), 1600);
  };

  const send = async (rawText?: string) => {
    const text = (rawText ?? inputText).trim();
    if (!text || isLoading) {return;}
    lastSentRef.current = text;

    const userMsg: ChatMessage = { id: `${Date.now()}-user`, text, role: 'user' };
    const history = [...messages, userMsg];
    setMessages(history);
    setInputText('');
    setIsLoading(true);

    // Key người dùng tự nhập được ưu tiên; không có thì đi qua proxy;
    // không cấu hình proxy thì rơi về demo.
    if (apiKey) {
      const turns = history
        .filter(m => m.role !== 'error')
        .slice(-20)
        .map(m => ({ role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', text: m.text }));
      // Model gọi tool -> app tự chạy -> trả dữ liệu để model diễn giải.
      // `nav` gom lại đây rồi mới điều hướng sau khi có câu trả lời, để người
      // dùng đọc xong mới bị chuyển màn.
      const { text: reply, error } = await askDirect(turns, apiKey, SYSTEM_PROMPT, {
        tools: TOOL_DECLARATIONS,
        runTool: async (name, input) => {
          const { data, nav } = await runTool(name, input);
          if (nav) { pendingNavRef.current = nav; }
          return data;
        },
      });
      const msg =
        error === 'invalidKey' ? t.chatbot.errInvalidKey
        : error === 'rateLimit' ? t.chatbot.errRateLimit
        : error ? t.chatbot.errNetwork
        : reply;
      pushMessage(msg, error ? 'error' : 'bot');
    } else if (AI_PROXY_URL) {
      // Vòng tool calling 2 chặng: hỏi model cần hàm gì -> app tự chạy hàm ->
      // gửi kết quả lên -> model diễn giải. Chỉ chặng cuối mới stream được.
      let convo: any[] = toMessages(history);
      const turn = await askForTool(convo);

      if (turn.kind === 'error') {
        pushMessage(t.chatbot.errNetwork, 'error');
      } else if (turn.kind === 'call') {
        const { data, nav } = await runTool(turn.name, turn.input).catch(err => {
          logger.error('chatbot', `chạy tool ${turn.name} thất bại`, err);
          return { data: { ok: false, reason: 'không lấy được dữ liệu' }, nav: undefined };
        });

        if (nav) { pendingNavRef.current = nav; }

        // Lượt gọi tool và kết quả phải khớp nhau qua tool_use_id
        convo = [
          ...convo,
          { role: 'assistant', content: [{ type: 'tool_use', id: turn.id, name: turn.name, input: turn.input }] },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: turn.id, content: JSON.stringify(data) }] },
        ];
        await streamInto(convo);
      } else {
        // Model trả lời thẳng, không cần hàm nào
        pushMessage(turn.text, 'bot');
      }
    } else {
      // Demo mode: giả lập độ trễ suy nghĩ
      await new Promise(r => setTimeout(r, 700));
      pushMessage(demoReply(text, t), 'bot');
    }
    setIsLoading(false);
  };

  const saveKey = () => {
    const k = keyDraft.trim();
    cachedApiKey = k;
    saveApiKey(k);
    setApiKey(k);
    setKeyDraft('');
    setShowKeyPanel(false);
    if (k) {pushMessage(t.chatbot.keyConnectedToast, 'bot');}
  };

  const removeKey = () => {
    cachedApiKey = '';
    saveApiKey('');
    setApiKey('');
    setKeyDraft('');
    setShowKeyPanel(false);
  };

  // Trả lời bằng AI thật khi có key riêng hoặc đã cấu hình proxy
  const isLive = !!apiKey || !!AI_PROXY_URL;

  const suggestions = [t.chatbot.suggestion1, t.chatbot.suggestion2, t.chatbot.suggestion3];

  return (
    <>
      {/* FAB */}
      <Animated.View
        style={[styles.fabContainer, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setIsChatOpen(true)}
          activeOpacity={0.8}>
          <Icon name="chatbubbles" type="ionicon" color="#fff" size={26} />
        </TouchableOpacity>
      </Animated.View>

      {/* Chat sheet */}
      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsChatOpen(false)}>
        <SafeAreaView style={styles.safe}>
          {/* Header cam */}
          <View style={styles.header}>
            <View style={styles.headerAvatar}>
              <Icon name="sparkles" type="ionicon" color="#fff" size={18} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{t.chatbot.title}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, isLive ? styles.statusDotAi : styles.statusDotDemo]} />
                <Text style={styles.statusText}>
                  {isLive ? t.chatbot.statusAi : t.chatbot.statusDemo}
                </Text>
              </View>
            </View>
            {messages.length > 0 && (
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={newChat}
                accessibilityRole="button"
                accessibilityLabel={t.chatbot.newChat}>
                <Icon name="create-outline" type="ionicon" color="#fff" size={17} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerBtn}
              accessibilityRole="button"
              accessibilityLabel={t.chatbot.keyTitle}
              onPress={() => {
                setKeyDraft('');
                setShowKeyPanel(true);
              }}>
              <Icon name="settings-outline" type="ionicon" color="#fff" size={17} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsChatOpen(false)}>
              <Icon name="close" type="ionicon" color="#fff" size={18} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            style={styles.messageList}
            contentContainerStyle={styles.messageContent}
            ref={scrollViewRef}
            scrollEventThrottle={80}
            onScroll={e => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              const distance = contentSize.height - layoutMeasurement.height - contentOffset.y;
              nearBottomRef.current = distance < 60;
            }}
            onContentSizeChange={() => {
              if (nearBottomRef.current) {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }
            }}>
            {/* Tin nhắn chào — luôn hiện, đổi theo ngôn ngữ */}
            <View style={[styles.bubble, styles.botBubble]}>
              <Text style={styles.botText}>{t.chatbot.welcome}</Text>
            </View>

            {/* Gợi ý câu hỏi khi chưa chat */}
            {messages.length === 0 && (
              <View style={styles.suggestionWrap}>
                {suggestions.map(sg => (
                  <TouchableOpacity
                    key={sg}
                    style={styles.suggestionChip}
                    activeOpacity={0.7}
                    onPress={() => send(sg)}>
                    <Text style={styles.suggestionText}>{sg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {messages.map((msg, i) => (
              <View key={msg.id}>
                <TouchableOpacity
                  activeOpacity={1}
                  onLongPress={() => copyMessage(msg.text)}
                  delayLongPress={350}
                  style={[
                    styles.bubble,
                    msg.role === 'user' ? styles.userBubble : styles.botBubble,
                    msg.role === 'error' && styles.errorBubble,
                  ]}>
                  <Text
                    style={
                      msg.role === 'user'
                        ? styles.userText
                        : msg.role === 'error'
                          ? styles.errorText
                          : styles.botText
                    }>
                    {msg.text}
                  </Text>
                </TouchableOpacity>

                {/* Chỉ bong bóng lỗi cuối cùng mới cho thử lại */}
                {msg.role === 'error' && i === messages.length - 1 && (
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={retryLast}
                    accessibilityRole="button">
                    <Icon name="refresh" type="ionicon" size={13} color={colors.accent700} />
                    <Text style={styles.retryText}>{t.chatbot.retry}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {isLoading && <TypingDots styles={styles} />}
          </ScrollView>

          {toast ? (
            <View style={styles.copyToast} pointerEvents="none">
              <Text style={styles.copyToastText}>{toast}</Text>
            </View>
          ) : null}

          {/* Input bar */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder={t.chatbot.inputPlaceholder}
                placeholderTextColor={colors.hint}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendDisabled]}
                onPress={() => send()}
                disabled={!inputText.trim() || isLoading}>
                <Icon name="send" type="ionicon" color="#fff" size={18} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>

          {/* Panel cài đặt API key (overlay) */}
          {showKeyPanel && (
            <Pressable style={styles.keyOverlay} onPress={() => setShowKeyPanel(false)}>
              <Pressable style={styles.keySheet} onPress={e => e.stopPropagation()}>
                <View style={styles.keyHandle} />
                <View style={styles.keyIconWrap}>
                  <Icon name="key-outline" type="ionicon" color={colors.accent700} size={24} />
                </View>
                <Text style={styles.keyTitle}>{t.chatbot.keyTitle}</Text>
                <Text style={styles.keyDesc}>{t.chatbot.keyDesc}</Text>
                <TextInput
                  style={styles.keyInput}
                  placeholder={t.chatbot.keyPlaceholder}
                  placeholderTextColor={colors.hint}
                  value={keyDraft}
                  onChangeText={setKeyDraft}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />
                <AppButton
                  title={t.chatbot.keySave}
                  onPress={saveKey}
                  disabled={!keyDraft.trim()}
                  style={styles.keyBtn}
                />
                {apiKey ? (
                  <AppButton
                    title={t.chatbot.keyRemove}
                    variant="ghost"
                    onPress={removeKey}
                    style={styles.keyBtn}
                  />
                ) : null}
              </Pressable>
            </Pressable>
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default Chatbot;

// ─── 7. Styles ─────────────────────────────────────────────────────────────
/** Kiểu bảng style, để component tách ra ngoài vẫn đúng kiểu. */
type Styles = ReturnType<typeof makeStyles>;

// Đặt NGOÀI component cha. Riêng component này thì bắt buộc: nó có useRef và
// useEffect bên trong, mà mỗi lần cha vẽ lại React sẽ huỷ rồi dựng lại nó —
// animation ba chấm giật về đầu và vòng lặp bị dựng lại liên tục.
const TypingDots = ({ styles }: { styles: Styles }) => {
  const dots = [useRef(new Animated.Value(0.3)).current,
                useRef(new Animated.Value(0.3)).current,
                useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const anims = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(v, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
      ),
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
      {dots.map((v, i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity: v }]} />
      ))}
    </View>
  );
};

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  // FAB
  fabContainer: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 9999,
    elevation: 5,
  },
  fabButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: c.heroDark,
    justifyContent: 'center',
    alignItems: 'center',
    // Viền đồng mờ để nút vẫn tách khỏi nền ở chế độ Tối
    borderWidth: 1,
    borderColor: 'rgba(216,183,131,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  // Container
  safe: { flex: 1, backgroundColor: c.bg },

  // Header
  header: {
    backgroundColor: c.heroDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(253,252,251,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.offWhite },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusDotAi: { backgroundColor: '#7dffb0' },
  statusDotDemo: { backgroundColor: '#ffe08a' },
  statusText: { fontFamily: FONT.regular, fontSize: TYPE.caption, color: 'rgba(253,252,251,0.75)' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginLeft: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  retryText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.accent700 },
  copyToast: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
    backgroundColor: c.heroDark,
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  copyToastText: { fontFamily: FONT.medium, fontSize: TYPE.caption, color: c.offWhite },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(253,252,251,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 10 },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADII.item,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: c.accent100,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 4,
    paddingHorizontal: 2,
  },
  errorBubble: {
    // Trước đây hardcode '#fdecea' -> chế độ Tối thành khối hồng chói
    backgroundColor: c.dangerBg,
    paddingHorizontal: 14,
  },
  userText: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.accent700, lineHeight: 20 },
  botText: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.text, lineHeight: 20 },
  errorText: { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.danger, lineHeight: 19 },

  // Typing indicator
  typingBubble: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 14,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: c.accent,
  },

  // Suggestions
  suggestionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: c.accent100,
  },
  suggestionText: { fontFamily: FONT.medium, fontSize: TYPE.body, color: c.accent700 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: c.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.divider,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 21,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 11 : 8,
    paddingBottom: Platform.OS === 'ios' ? 11 : 8,
    fontFamily: FONT.regular,
    fontSize: TYPE.body,
    color: c.text,
  },
  sendButton: {
    backgroundColor: c.heroDark,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.45 },

  // Key panel
  keyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  keySheet: {
    backgroundColor: c.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
  },
  keyHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  keyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.accent100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  keyTitle: { fontFamily: FONT.semibold, fontSize: TYPE.title, color: c.text },
  keyDesc: {
    fontSize: 12,
    color: c.subtext,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  keyInput: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: c.text,
    marginBottom: 12,
  },
  keyBtn: { alignSelf: 'stretch', marginTop: 2 },
});
