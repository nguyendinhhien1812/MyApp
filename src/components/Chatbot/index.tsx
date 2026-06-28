import React, { useState, useRef } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useTheme, Colors, Text, Icon } from '@rneui/themed';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 60;

const Chatbot = () => {
  const colors = useTheme().theme.colors;

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<{ id: string; text: string; isUser: boolean }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Draggable states
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - BUTTON_SIZE - 20, y: SCREEN_HEIGHT - 200 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        // Chỉ bắt đầu kéo nếu người dùng di chuyển tay đủ xa (ví dụ > 5px) để phân biệt với thao tác bấm
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();

        // Tính toán để hút về mép màn hình
        const currentX = (pan.x as any)._value;
        const center = SCREEN_WIDTH / 2;
        const targetX = currentX > center - BUTTON_SIZE / 2 ? SCREEN_WIDTH - BUTTON_SIZE - 10 : 10;
        
        let targetY = (pan.y as any)._value;
        // Giới hạn y không bị trôi ra ngoài màn hình
        if (targetY < 50) targetY = 50;
        if (targetY > SCREEN_HEIGHT - BUTTON_SIZE - 100) targetY = SCREEN_HEIGHT - BUTTON_SIZE - 100;

        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
        }).start();
      }
    })
  ).current;

  const sendMessage = async () => {
    if (!inputText.trim() || !apiKey.trim()) return;

    const userMessage = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage.text }] }],
          }),
        }
      );
      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `Lỗi: ${data.error.message}`, isUser: false }]);
      } else if (data.candidates && data.candidates.length > 0) {
        const aiText = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { id: Date.now().toString(), text: aiText, isUser: false }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: `Lỗi kết nối: ${error.message}`, isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Animated.View
        style={[
          styles(colors).fabContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles(colors).fabButton}
          onPress={() => setIsChatOpen(true)}
          activeOpacity={0.8}
        >
          <Icon name="chatbubbles" type="ionicon" color="white" size={28} />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsChatOpen(false)}
      >
        <SafeAreaView style={styles(colors).chatContainer}>
          <View style={styles(colors).chatHeader}>
            <Text h4 style={styles(colors).chatTitle}>Trợ lý AI</Text>
            <TouchableOpacity onPress={() => setIsChatOpen(false)}>
              <Icon name="close" type="ionicon" size={28} />
            </TouchableOpacity>
          </View>
          
          <View style={styles(colors).apiKeyContainer}>
            <TextInput
              style={styles(colors).apiKeyInput}
              placeholder="Nhập Google Gemini API Key tại đây..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />
          </View>

          <ScrollView 
            style={styles(colors).messageList}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles(colors).messageBubble,
                  msg.isUser ? styles(colors).userMessage : styles(colors).aiMessage
                ]}
              >
                <Text style={{ color: msg.isUser ? 'white' : 'black' }}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {isLoading && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
            )}
          </ScrollView>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles(colors).inputContainer}>
              <TextInput
                style={styles(colors).textInput}
                placeholder={apiKey ? "Nhập tin nhắn..." : "Vui lòng nhập API Key trước"}
                value={inputText}
                onChangeText={setInputText}
                editable={!!apiKey}
                multiline
              />
              <TouchableOpacity 
                style={[styles(colors).sendButton, { opacity: (inputText && apiKey) ? 1 : 0.5 }]}
                onPress={sendMessage}
                disabled={!inputText || !apiKey || isLoading}
              >
                <Icon name="send" type="ionicon" color="white" size={20} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default Chatbot;

const styles = (colors: Colors) =>
  StyleSheet.create({
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
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    chatContainer: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      backgroundColor: 'white',
    },
    chatTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    apiKeyContainer: {
      padding: 10,
      backgroundColor: 'white',
    },
    apiKeyInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
    },
    messageList: {
      flex: 1,
      padding: 15,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    aiMessage: {
      alignSelf: 'flex-start',
      backgroundColor: 'white',
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: '#eee',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#ddd',
      alignItems: 'center',
    },
    textInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10,
    },
    sendButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
