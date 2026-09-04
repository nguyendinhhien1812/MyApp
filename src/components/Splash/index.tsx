import React, { useEffect, useRef, useState } from 'react';
import { Animated, Appearance, Dimensions, Easing, StyleSheet } from 'react-native';
import { FONT } from '../../theme/tokens';

// Bảng màu phải khớp 1-1 với các colorset trong Images.xcassets mà
// LaunchScreen.storyboard đang dùng. Sửa một bên thì sửa cả bên kia.
const PALETTE = {
  light: {
    bg: '#F8F6F2',
    plate1: '#f0c48a',
    plate2: '#c98f3a',
    plate3: '#8a5e1c',
    text: '#1a1a1a',
    rule: '#8a5e1c',
    sub: '#888888',
  },
  dark: {
    bg: '#121212',
    plate1: '#6b4f22',
    plate2: '#96682c',
    plate3: '#d8b783',
    text: '#d8b783',
    rule: '#b68235',
    sub: '#8a7a63',
  },
};

// Đọc đồng bộ ngay lúc dựng: theme lưu trong AsyncStorage là bất đồng bộ,
// dùng nó sẽ nháy một khung sai màu trước khi kịp áp.
const scheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
const C = PALETTE[scheme];

const HOLD_MS = 520;

const Splash = () => {
  const [done, setDone] = useState(false);
  const exit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(HOLD_MS),
      Animated.timing(exit, {
        toValue: 1,
        duration: 620,
        easing: Easing.bezier(0.3, 0.85, 0.35, 1),
        useNativeDriver: true,
      }),
    ]);
    anim.start(({ finished }) => {
      // Bị ngắt giữa chừng thì giữ nguyên, tránh lộ màn dưới khi đang dở dang
      if (finished) {
        setDone(true);
      }
    });
    return () => anim.stop();
  }, [exit]);

  if (done) {
    return null;
  }

  // Ba lớp xoè theo hướng khác nhau rồi phóng to vượt khung
  const plate = (dy: number, deg: string, scale: number) => ({
    transform: [
      { translateY: exit.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, dy, dy * 5] }) },
      { rotate: exit.interpolate({ inputRange: [0, 0.45, 1], outputRange: ['0deg', deg, deg] }) },
      { scale: exit.interpolate({ inputRange: [0, 0.45, 1], outputRange: [1, 1, scale] }) },
    ],
    opacity: exit.interpolate({ inputRange: [0, 0.55, 0.9], outputRange: [1, 1, 0] }),
  });

  const textOut = {
    opacity: exit.interpolate({ inputRange: [0, 0.25, 0.7], outputRange: [1, 1, 0] }),
    transform: [
      { translateY: exit.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: exit.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }) },
      ]}>
      <Animated.View style={[styles.plate, styles.plate3, plate(-7, '5deg', 1.7)]} />
      <Animated.View style={[styles.plate, styles.plate2, plate(0, '1deg', 1.6)]} />
      <Animated.View style={[styles.plate, styles.plate1, plate(7, '-4deg', 1.5)]} />

      <Animated.Text style={[styles.wordmark, textOut]}>MyApp</Animated.Text>
      <Animated.View style={[styles.rule, textOut]} />
      <Animated.Text style={[styles.sub, textOut]}>PORTFOLIO · RN ENGINEER</Animated.Text>
    </Animated.View>
  );
};

export default Splash;

// Ảnh SplashMark cao 164, storyboard neo tâm ảnh ở centerY - 15.
// Mọi toạ độ dưới đây tính từ mép trên ảnh để hai lớp chồng khít nhau.
const PLATE_H = 14;
const MARK_H = 164;
const STACK_TOP = Dimensions.get('window').height / 2 - (MARK_H / 2 + 15);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    alignItems: 'center',
  },
  plate: { position: 'absolute', height: PLATE_H, borderRadius: PLATE_H / 2 },
  plate3: { width: 168, top: STACK_TOP, backgroundColor: C.plate3 },
  plate2: { width: 152, top: STACK_TOP + 24, backgroundColor: C.plate2 },
  plate1: { width: 134, top: STACK_TOP + 48, backgroundColor: C.plate1 },
  wordmark: {
    position: 'absolute',
    top: STACK_TOP + 90,
    // lineHeight cố định để gạch đồng bên dưới luôn rơi đúng chỗ như storyboard
    height: 36,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: FONT.bold,
    fontSize: 28,
    letterSpacing: 0.5,
    color: C.text,
  },
  rule: {
    position: 'absolute',
    top: STACK_TOP + 134,
    width: 84,
    height: 2,
    backgroundColor: C.rule,
  },
  sub: {
    position: 'absolute',
    top: STACK_TOP + 150,
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 1.4,
    color: C.sub,
  },
});
