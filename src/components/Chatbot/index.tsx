// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { Icon } from '@rneui/themed';
import { BRAND } from '../../theme/paperTheme';
import { AppButton } from '../UI';
import { useLanguage } from '../../context/LanguageContext';
import type { Translations } from '../../i18n/translations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 60;

// Model free-tier hiện hành của Google (gemini-1.5-flash đã ngừng hỗ trợ)
const GEMINI_MODEL = 'gemini-2.0-flash';
const SYSTEM_PROMPT =
  'Bạn là trợ lý AI thân thiện của MyApp — ứng dụng quản lý tài chính cá nhân gồm: ' +
  'Ngân hàng (chuyển tiền, QR Pay, nạp tiền, quản lý thẻ), Đầu tư (cổ phiếu, tỷ giá), ' +
  'Chi phí (thống kê chi tiêu). Trả lời ngắn gọn, hữu ích, bằng đúng ngôn ngữ người dùng đang dùng.';

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

// ─── 4. Gemini API — multi-turn, kèm system prompt ─────────────────────────
const askGemini = async (
  history: ChatMessage[],
  apiKey: string,
  t: Translations,
): Promise<{ text: string; isError: boolean }> => {
  try {
    let contents = history
      .filter(m => m.role !== 'error')
      .slice(-20) // giới hạn ngữ cảnh gửi đi
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));
    // Gemini yêu cầu content đầu tiên phải là role 'user' — bỏ các tin bot đứng đầu
    const firstUser = contents.findIndex(c => c.role === 'user');
    contents = firstUser > 0 ? contents.slice(firstUser) : contents;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
        }),
      },
    );
    const data = await response.json();

    if (!response.ok || data.error) {
      const code = data.error?.code ?? response.status;
      if (code === 400 || code === 401 || code === 403) {
        return { text: t.chatbot.errInvalidKey, isError: true };
      }
      return { text: `${t.chatbot.errNetwork} (${data.error?.message ?? code})`, isError: true };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {return { text: t.chatbot.errNetwork, isError: true };}
    return { text, isError: false };
  } catch {
    return { text: t.chatbot.errNetwork, isError: true };
  }
};

// ─── 5. Typing indicator (3 chấm nhấp nháy) ────────────────────────────────
const TypingDots = () => {
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

// ─── 6. Main component ─────────────────────────────────────────────────────
const Chatbot = () => {
  const { t } = useLanguage();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [apiKey, setApiKey] = useState(cachedApiKey);
  const [keyDraft, setKeyDraft] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const pushMessage = (text: string, role: ChatMessage['role']) =>
    setMessages(prev => [...prev, { id: `${Date.now()}-${role}`, text, role }]);

  const send = async (rawText?: string) => {
    const text = (rawText ?? inputText).trim();
    if (!text || isLoading) {return;}

    const userMsg: ChatMessage = { id: `${Date.now()}-user`, text, role: 'user' };
    const history = [...messages, userMsg];
    setMessages(history);
    setInputText('');
    setIsLoading(true);

    if (apiKey) {
      const { text: reply, isError } = await askGemini(history, apiKey, t);
      pushMessage(reply, isError ? 'error' : 'bot');
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
    setApiKey(k);
    setKeyDraft('');
    setShowKeyPanel(false);
    if (k) {pushMessage(t.chatbot.keyConnectedToast, 'bot');}
  };

  const removeKey = () => {
    cachedApiKey = '';
    setApiKey('');
    setKeyDraft('');
    setShowKeyPanel(false);
  };

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
                <View style={[styles.statusDot, apiKey ? styles.statusDotAi : styles.statusDotDemo]} />
                <Text style={styles.statusText}>
                  {apiKey ? t.chatbot.statusAi : t.chatbot.statusDemo}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.headerBtn}
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
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
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

            {messages.map(msg => (
              <View
                key={msg.id}
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
              </View>
            ))}

            {isLoading && <TypingDots />}
          </ScrollView>

          {/* Input bar */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder={t.chatbot.inputPlaceholder}
                placeholderTextColor={BRAND.hint}
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
                  <Icon name="key-outline" type="ionicon" color={BRAND.primaryDark} size={24} />
                </View>
                <Text style={styles.keyTitle}>{t.chatbot.keyTitle}</Text>
                <Text style={styles.keyDesc}>{t.chatbot.keyDesc}</Text>
                <TextInput
                  style={styles.keyInput}
                  placeholder={t.chatbot.keyPlaceholder}
                  placeholderTextColor={BRAND.hint}
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
const styles = StyleSheet.create({
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
    backgroundColor: BRAND.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  // Container
  safe: { flex: 1, backgroundColor: BRAND.bg },

  // Header
  header: {
    backgroundColor: BRAND.primary,
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
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusDotAi: { backgroundColor: '#7dffb0' },
  statusDotDemo: { backgroundColor: '#ffe08a' },
  statusText: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: BRAND.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: BRAND.white,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: BRAND.border,
  },
  errorBubble: {
    backgroundColor: '#fdecea',
    borderColor: '#f5c6c0',
  },
  userText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  botText: { fontSize: 14, color: BRAND.text, lineHeight: 20 },
  errorText: { fontSize: 13, color: BRAND.danger, lineHeight: 19 },

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
    backgroundColor: BRAND.hint,
  },

  // Suggestions
  suggestionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BRAND.white,
    borderWidth: 0.5,
    borderColor: BRAND.primaryBorder,
  },
  suggestionText: { fontSize: 12, color: BRAND.primaryDark, fontWeight: '500' },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: BRAND.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.divider,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 21,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 11 : 8,
    paddingBottom: Platform.OS === 'ios' ? 11 : 8,
    fontSize: 14,
    color: BRAND.text,
  },
  sendButton: {
    backgroundColor: BRAND.primary,
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
    backgroundColor: BRAND.white,
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
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  keyTitle: { fontSize: 16, fontWeight: '600', color: BRAND.text },
  keyDesc: {
    fontSize: 12,
    color: BRAND.subtext,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  keyInput: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: BRAND.text,
    marginBottom: 12,
  },
  keyBtn: { alignSelf: 'stretch', marginTop: 2 },
});
