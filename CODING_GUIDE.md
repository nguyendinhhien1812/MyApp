# 📱 MyApp — Coding Guide & Architecture Reference

> Tài liệu này mô tả toàn bộ pattern, convention và cấu trúc đã được thiết lập trong dự án.  
> Mỗi screen mới hoặc mini-app mới **phải tuân theo** hướng dẫn này để đảm bảo nhất quán.

---

## 📑 Mục lục

1. [Cấu trúc thư mục](#1-cấu-trúc-thư-mục)
2. [Design System — Brand Colors & Typography](#2-design-system)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Anatomy của một Screen](#4-anatomy-của-một-screen)
5. [Anatomy của một Mini-App](#5-anatomy-của-một-mini-app)
6. [Component Patterns tái sử dụng](#6-component-patterns)
7. [i18n — Hệ thống đa ngôn ngữ](#7-i18n)
8. [StyleSheet Convention](#8-stylesheet-convention)
9. [Data & TypeScript Patterns](#9-data--typescript-patterns)
10. [Checklist tạo Screen mới](#10-checklist-tạo-screen-mới)
11. [Checklist tạo Mini-App mới](#11-checklist-tạo-mini-app-mới)

---

## 1. Cấu trúc thư mục

```
src/
├── app.tsx                        # Root — bọc LanguageProvider + ThemeProvider
├── context/
│   └── LanguageContext.tsx        # Global language state + useLanguage() hook
├── i18n/
│   └── translations.ts            # Tất cả chuỗi dịch VI/EN
├── navigation/
│   ├── AppNavigator.tsx           # Entry point navigator
│   ├── MainNavigator.tsx          # Stack chính: HomeTabs + các mini-app navigator
│   ├── TabNavigator.tsx           # Bottom tab: Home / Notification / Setting / Profile
│   ├── HomeNavigator.tsx          # Stack con của tab Home
│   ├── BankNavigator.tsx          # Mini-app Ngân hàng
│   └── InvestmentNavigator.tsx    # Mini-app Đầu tư
├── container/                     # Tất cả screens
│   ├── Home/
│   ├── BankScreen/
│   │   ├── index.tsx              # Main screen
│   │   ├── components/            # Components nội bộ
│   │   │   ├── QuickAction.tsx
│   │   │   └── index.tsx
│   │   └── screen/                # Sub-screens của mini-app
│   │       └── TransferMoney.tsx
│   ├── QRPay/
│   ├── TopUp/
│   ├── CardManagement/
│   ├── AllContacts/
│   ├── Investment/
│   ├── NotificationScreen/
│   ├── ProfileScreen/
│   ├── SettingScreen/
│   └── Login/
└── components/                    # Global shared components
    ├── Chatbot/
    ├── Icon/
    ├── Picker/
    └── Text/
```

---

## 2. Design System

### 2.1 Brand Colors

```typescript
// LUÔN dùng các biến này — không hardcode màu khác
const PRIMARY        = '#E89951';  // Cam chủ đạo
const PRIMARY_DARK   = '#b36a1a';  // Cam đậm (text trên nền sáng)
const PRIMARY_LIGHT  = '#fdf3e7';  // Cam nhạt (nền badge, icon bg)
const PRIMARY_BORDER = '#f0c48a';  // Cam viền
```

### 2.2 Semantic Colors

```typescript
const COLOR_SUCCESS  = '#1a7a40';  // Xanh lá — tiền vào, lãi, thành công
const COLOR_DANGER   = '#c0392b';  // Đỏ — tiền ra, lỗ, nguy hiểm
const COLOR_INFO     = '#1a4a7a';  // Xanh dương — thông tin
const COLOR_PURPLE   = '#6c3fc4';  // Tím — giải trí, đặc biệt
const COLOR_BG       = '#F2F2F7';  // Nền toàn màn hình (iOS system gray)
const COLOR_WHITE    = '#fff';
const COLOR_TEXT     = '#1a1a1a';  // Text chính
const COLOR_SUBTEXT  = '#888';     // Text phụ
const COLOR_HINT     = '#aaa';     // Hint / placeholder
const COLOR_MUTED    = '#bbb';     // Rất mờ
const COLOR_BORDER   = '#e8e8e8';  // Viền card
const COLOR_DIVIDER  = '#F0F0F0';  // Divider giữa rows
```

### 2.3 Typography

```typescript
// Heading màn hình (ví dụ: "Cài đặt", "Tôi")
fontSize: 26, fontWeight: '700', color: '#1a1a1a'

// Header trong orange bar
fontSize: 16, fontWeight: '600', color: '#fff'

// Section title (có accent bar)
fontSize: 15, fontWeight: '500', color: '#1a1a1a'

// Section label (ALL CAPS, nhỏ)
fontSize: 11, color: '#aaa', letterSpacing: 0.6, fontWeight: '500'

// Row label
fontSize: 14, color: '#1a1a1a'

// Body text
fontSize: 13, color: '#1a1a1a'

// Sub text / caption
fontSize: 11-12, color: '#888' hoặc '#aaa'

// Số tiền lớn (hero)
fontSize: 26-28, fontWeight: '700', letterSpacing: -0.5

// Badge / chip text
fontSize: 10-11, fontWeight: '500'
```

### 2.4 Spacing

```
Margin ngoài:    16px (ngang) / 12px (card)
Padding card:    16px
Gap trong row:   8-12px
Border radius:   14-16px (card) / 20px (card lớn) / 8-10px (chip/badge)
Header height:   ~58px (paddingVertical: 12)
Bottom bar:      paddingBottom: 24-28px (safe area)
```

### 2.5 Elevation / Shadow

```typescript
// Card tiêu chuẩn
elevation: 2,
shadowColor: '#000',
shadowOpacity: 0.04,
shadowRadius: 6,
shadowOffset: { width: 0, height: 2 },
```

---

## 3. Navigation Architecture

### 3.1 Cây navigation

```
AppNavigator
└── MainNavigator (Stack)
    ├── HomeTabs → TabNavigator (BottomTab)
    │   ├── Home      → HomeNavigator → HomeScreen
    │   ├── Notification → NotificationScreen
    │   ├── Setting   → SettingScreen
    │   └── Profile   → ProfileScreen
    ├── BankScreen    → BankNavigator (Stack, headerShown: false)
    │   ├── BankScreen      (initialRoute)
    │   ├── TransferMoney
    │   ├── QRPay
    │   ├── TopUp
    │   ├── CardManagement
    │   └── AllContacts
    └── InvestmentScreen → InvestmentNavigator (Stack, headerShown: false)
        └── InvestmentHome  (initialRoute)
```

### 3.2 Rule quan trọng

- **Tab screens** không có back button → không cần header cam
- **Stack screens trong mini-app** có header cam riêng với back button
- **Tất cả Navigator** dùng `screenOptions={{ headerShown: false }}`
- **Navigate sang mini-app** từ Home: `navigation.navigate('BankScreen')` hoặc `'InvestmentScreen'`
- **Navigate trong mini-app**: `navigation.navigate('TransferMoney', { balance })`

### 3.3 Thêm mini-app mới (ví dụ: Chi phí)

```typescript
// 1. Tạo /src/navigation/ExpenseNavigator.tsx
// 2. Đăng ký trong MainNavigator:
{ name: 'ExpenseScreen', component: ExpenseNavigator }
// 3. Từ Home navigate:
navigation.navigate('ExpenseScreen' as never)
```

---

## 4. Anatomy của một Screen

### 4.1 Cấu trúc file chuẩn

```typescript
// ─── 1. Imports ────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@rneui/themed';
import { useLanguage } from '../../context/LanguageContext';

// ─── 2. Constants ──────────────────────────────────────────────────────────
const PRIMARY        = '#E89951';
const PRIMARY_DARK   = '#b36a1a';
const PRIMARY_LIGHT  = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';

// ─── 3. Types ──────────────────────────────────────────────────────────────
type ItemType = { id: number; name: string; /* ... */ };

// ─── 4. Helper functions ───────────────────────────────────────────────────
const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

// ─── 5. Static data ────────────────────────────────────────────────────────
const DATA: ItemType[] = [ /* mock data */ ];

// ─── 6. Sub-components (nếu cần) ──────────────────────────────────────────
const SectionTitle = ({ title }: { title: string }) => ( /* ... */ );

// ─── 7. Main screen component ─────────────────────────────────────────────
interface Props { navigation: any; route?: any; }

const MyScreen = ({ navigation }: Props) => {
  const { t } = useLanguage();
  const [state, setState] = useState(/* ... */);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header cam */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.xxx.title}</Text>
        <View style={styles.headerBtn} /> {/* placeholder để căn giữa title */}
      </View>

      {/* Nội dung */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ... */}
      </ScrollView>

      {/* Bottom CTA (nếu cần) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MyScreen;

// ─── 8. Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({ /* ... */ });
```

### 4.2 Header cam chuẩn

```typescript
// Header với back button (Stack screen)
<View style={styles.header}>
  <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
    <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>{t.xxx.title}</Text>
  <TouchableOpacity style={styles.headerBtn}>
    <Icon type="ionicon" name="ellipsis-horizontal" size={18} color="#fff" />
  </TouchableOpacity>
</View>

// Style
header: {
  backgroundColor: PRIMARY,        // LUÔN dùng PRIMARY
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  gap: 8,
},
headerBtn: {
  width: 34, height: 34, borderRadius: 17,
  backgroundColor: 'rgba(255,255,255,0.2)',   // KHÔNG dùng rgba(0,0,0,...)
  alignItems: 'center', justifyContent: 'center',
},
headerTitle: {
  flex: 1, textAlign: 'center',
  fontSize: 16, fontWeight: '600', color: '#fff',  // LUÔN trắng
},
```

### 4.3 Tab screen (không có header cam)

```typescript
// Tab screens dùng heading lớn bên trái
<View style={styles.header}>
  <Text style={styles.headerTitle}>{t.xxx.title}</Text>
</View>

headerTitle: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' }
```

### 4.4 Section title với accent bar

```typescript
const SectionTitle = ({ title }: { title: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <View style={{ width: 4, height: 18, backgroundColor: PRIMARY, borderRadius: 2 }} />
    <Text style={{ fontSize: 15, fontWeight: '500', color: '#1a1a1a' }}>{title}</Text>
  </View>
);
```

---

## 5. Anatomy của một Mini-App

Mini-app là một tính năng độc lập có Navigator riêng, được đăng ký trong MainNavigator.

### 5.1 File structure

```
src/
├── navigation/
│   └── FeatureNavigator.tsx       # Navigator của mini-app
└── container/
    └── Feature/
        ├── index.tsx              # Main screen (initialRoute)
        └── screen/                # Sub-screens
            ├── FeatureDetail.tsx
            └── FeatureForm.tsx
```

### 5.2 Navigator template

```typescript
// src/navigation/FeatureNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FeatureScreen from '../container/Feature';
import FeatureDetail from '../container/Feature/screen/FeatureDetail';

const Stack = createStackNavigator();

const FeatureNavigator = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="FeatureHome">
    <Stack.Screen name="FeatureHome"   component={FeatureScreen} />
    <Stack.Screen name="FeatureDetail" component={FeatureDetail} />
  </Stack.Navigator>
);

export default FeatureNavigator;
```

### 5.3 Đăng ký vào MainNavigator

```typescript
// src/navigation/MainNavigator.tsx
import FeatureNavigator from './FeatureNavigator';

// Thêm vào mảng navigators:
{ name: 'FeatureScreen', component: FeatureNavigator }
```

### 5.4 Navigate từ Home

```typescript
// src/container/Home/index.tsx
const quickActions = [
  { label: t.home.feature, icon: 'icon-name', screen: 'FeatureScreen' },
];
// onPress: navigation.navigate(action.screen as never)
```

---

## 6. Component Patterns

### 6.1 Card chuẩn

```typescript
<View style={styles.card}>
  {/* content */}
</View>

card: {
  backgroundColor: '#fff',
  borderRadius: 14,          // hoặc 16 cho card lớn hơn
  marginHorizontal: 16,
  overflow: 'hidden',
  borderWidth: 0.5,
  borderColor: '#e8e8e8',
}
```

### 6.2 Setting Row (icon + label + value/chevron)

```typescript
const SettingRow = ({ icon, label, value, onPress, isLast = false }) => (
  <>
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Icon type="ionicon" name={icon} size={17} color={PRIMARY_DARK} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Icon type="ionicon" name="chevron-forward" size={15} color="#ccc" />
      </View>
    </TouchableOpacity>
    {!isLast && <View style={styles.rowDivider} />}
  </>
);

// Styles
rowIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: PRIMARY_LIGHT,
               alignItems: 'center', justifyContent: 'center' }
rowDivider:  { height: 0.5, backgroundColor: '#F0F0F0', marginLeft: 60 }
```

### 6.3 Toggle Switch

```typescript
<Switch
  value={value}
  onValueChange={onToggle}
  trackColor={{ false: '#e0e0e0', true: PRIMARY_BORDER }}
  thumbColor={value ? PRIMARY : '#fff'}
  ios_backgroundColor="#e0e0e0"
/>
```

### 6.4 Filter Chip / Tab

```typescript
{filters.map((f, i) => (
  <TouchableOpacity
    key={i}
    style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
    onPress={() => setActiveFilter(i)}>
    <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>{f}</Text>
  </TouchableOpacity>
))}

filterChip:       { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20,
                    borderWidth: 0.5, borderColor: '#e0e0e0', backgroundColor: '#fff' }
filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY }
filterText:       { fontSize: 12, color: '#888' }
filterTextActive: { color: '#fff', fontWeight: '500' }
```

### 6.5 Bottom CTA Bar (1 nút)

```typescript
<View style={styles.bottomBar}>
  <View style={styles.securityRow}>
    <Icon type="ionicon" name="lock-closed-outline" size={11} color="#ccc" />
    <Text style={styles.securityText}>{t.xxx.ssl}</Text>
  </View>
  <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
    <Text style={styles.primaryBtnText}>{t.xxx.confirm}</Text>
  </TouchableOpacity>
</View>

bottomBar:    { backgroundColor: '#fff', paddingHorizontal: 16,
                paddingTop: 10, paddingBottom: 28, gap: 8,
                borderTopWidth: 0.5, borderTopColor: '#F0F0F0' }
primaryBtn:   { backgroundColor: PRIMARY, borderRadius: 12, height: 50,
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', gap: 8 }
primaryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' }
```

### 6.6 Bottom CTA Bar (2 nút Mua / Bán)

```typescript
<View style={styles.ctaRow}>
  <TouchableOpacity style={styles.btnBuy}>
    <Text style={styles.btnBuyText}>{t.investment.buyNow}</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.btnSell}>
    <Text style={styles.btnSellText}>{t.investment.sell}</Text>
  </TouchableOpacity>
</View>

btnBuy:     { flex: 2, backgroundColor: PRIMARY, borderRadius: 12, height: 50,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }
btnSell:    { flex: 1, backgroundColor: '#fff', borderRadius: 12, height: 50,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: '#c0392b' }
```

### 6.7 Badge / Pill

```typescript
// Thành công / tăng
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4,
               backgroundColor: '#e8f8f0', borderRadius: 10,
               paddingHorizontal: 8, paddingVertical: 3 }}>
  <Icon type="ionicon" name="trending-up" size={11} color="#1a7a40" />
  <Text style={{ fontSize: 11, color: '#1a7a40', fontWeight: '500' }}>+5.2%</Text>
</View>

// Cam (brand)
backgroundColor: PRIMARY_LIGHT, borderRadius: 10,
// → text color: PRIMARY_DARK
```

### 6.8 Bottom Sheet Modal

```typescript
<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
  <Pressable style={styles.modalOverlay} onPress={onClose}>
    <Pressable style={styles.bottomSheet} onPress={e => e.stopPropagation()}>
      <View style={styles.handle} />
      {/* content */}
    </Pressable>
  </Pressable>
</Modal>

modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }
bottomSheet:  { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                paddingBottom: 36, paddingHorizontal: 20, paddingTop: 12 }
handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0',
                alignSelf: 'center', marginBottom: 16 }
```

### 6.9 Confirm Modal (giữa màn)

```typescript
<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
  <Pressable style={styles.modalOverlay} onPress={onClose}>
    <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
      {/* icon, title, desc, 2 nút */}
    </Pressable>
  </Pressable>
</Modal>

modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
                alignItems: 'center', justifyContent: 'center', padding: 32 }
modalBox:     { backgroundColor: '#fff', borderRadius: 20, padding: 24,
                width: '100%', alignItems: 'center' }
```

### 6.10 SVG Sparkline (react-native-svg)

```typescript
import Svg, { Polyline } from 'react-native-svg';

const SparkLine = ({ data, color, width = 52, height = 28 }) => {
  const n = data.length;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${((i / (n - 1)) * width).toFixed(1)},${(height - ((v - min) / range) * (height - 4) - 2).toFixed(1)}`
  ).join(' ');
  return (
    <Svg width={width} height={height}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};
```

---

## 7. i18n

### 7.1 Kiến trúc

```
src/i18n/translations.ts     ← Tất cả chuỗi dịch (VI + EN)
src/context/LanguageContext.tsx ← Provider + useLanguage() hook
src/app.tsx                  ← Bọc <LanguageProvider>
```

### 7.2 Cách dùng trong screen

```typescript
import { useLanguage } from '../../context/LanguageContext';

const MyScreen = () => {
  const { t } = useLanguage();
  return <Text>{t.xxx.title}</Text>;
};
```

### 7.3 Thêm ngôn ngữ mới

```typescript
// 1. Trong translations.ts, thêm section mới vào vi và en:
export const vi = {
  // ... existing
  myFeature: {
    title: 'Tính năng mới',
    confirm: 'Xác nhận',
  },
};

export const en: Translations = {
  // ... existing
  myFeature: {
    title: 'New feature',
    confirm: 'Confirm',
  },
};

// 2. Dùng trong screen: t.myFeature.title
```

### 7.4 Thêm ngôn ngữ thứ 3 (ví dụ Japanese)

```typescript
// translations.ts
export type Lang = 'vi' | 'en' | 'ja';
export const ja: Translations = { /* ... */ };
export const translations: Record<Lang, Translations> = { vi, en, ja };

// SettingScreen — thêm vào LANG_OPTIONS:
{ code: 'ja', label: '日本語', flag: '🇯🇵', sublabel: 'Japanese' }
```

### 7.5 Đổi ngôn ngữ

```typescript
const { setLang } = useLanguage();
setLang('en'); // → toàn app re-render ngay lập tức
```

---

## 8. StyleSheet Convention

### 8.1 Thứ tự các style blocks

```typescript
const styles = StyleSheet.create({
  // 1. Container chính
  safe: { ... },

  // 2. Header
  header: { ... },
  headerBtn: { ... },
  headerTitle: { ... },

  // 3. Scroll / main content
  scroll: { ... },

  // 4. Cards & sections (theo thứ tự xuất hiện trong screen)
  card: { ... },
  sectionLabel: { ... },
  sectionHeader: { ... },

  // 5. Row components
  rowName: { ... },

  // 6. Bottom bar
  bottomBar: { ... },
  primaryBtn: { ... },

  // 7. Modal
  modalOverlay: { ... },
  bottomSheet: { ... },
});
```

### 8.2 Naming convention

| Pattern | Ví dụ |
|---------|-------|
| `xxxCard` | `portfolioCard`, `balanceCard` |
| `xxxRow` | `settingRow`, `stockRow`, `txRow` |
| `xxxBtn` / `btnXxx` | `headerBtn`, `btnBuy`, `btnSell` |
| `xxxLabel` | `portLabel`, `sectionLabel` |
| `xxxText` | `headerTitle`, `rowLabel`, `filterText` |
| `xxxWrap` | `sparkWrap`, `avatarWrap`, `searchWrap` |
| `xxxActive` suffix | `filterTabActive`, `mktTabActive` |

### 8.3 Safe area & bottom spacing

```typescript
// Screen có bottom bar cố định
<SafeAreaView style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
  <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
    {/* ... */}
    <View style={{ height: 16 }} /> {/* spacer trước bottom bar */}
  </ScrollView>
  <View style={styles.bottomBar}> {/* paddingBottom: 28 */ }
  </View>
</SafeAreaView>

// FlatList với bottom spacing
contentContainerStyle={{ paddingBottom: 100 }}
```

---

## 9. Data & TypeScript Patterns

### 9.1 Định nghĩa type cho data item

```typescript
type StockItem = {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  trend: 'up' | 'down';   // union type thay vì boolean
  sparkData: number[];
  iconBg: string;
  iconColor: string;
};
```

### 9.2 Money formatter

```typescript
const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);
// → "1.000.000 ₫"

const shortMoney = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}tỷ`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}tr`;
  return `${(n / 1_000).toFixed(0)}k`;
};
// → "8.5tr", "1.2tỷ"
```

### 9.3 Filter bằng index (không dùng string so sánh)

```typescript
// ✅ ĐÚNG — dùng index, không bị lỗi khi đổi ngôn ngữ
const [activeFilter, setActiveFilter] = useState(0);
const filtered = data.filter(item => {
  if (activeFilter === 1) return item.type === 'income';
  if (activeFilter === 2) return item.type === 'expense';
  return true;
});

// ❌ SAI — so sánh string bị lỗi khi đổi sang EN
const filtered = data.filter(item => {
  if (activeFilter === 'Tiền vào') return item.type === 'income'; // BUG khi EN
});
```

### 9.4 Navigation types

```typescript
// Dùng 'as never' khi không có type definition đầy đủ
navigation.navigate('BankScreen' as never)
navigation.navigate('TransferMoney' as never, { balance } as never)

// Hoặc dùng @ts-ignore
// @ts-ignore
navigation.navigate('TransferMoney', { balance })
```

### 9.5 Route params

```typescript
const MyScreen = ({ navigation, route }: Props) => {
  const balance = (route.params as any)?.balance ?? 0;
  // ...
};
```

---

## 10. Checklist tạo Screen mới

Khi tạo một screen con trong mini-app hiện có:

```
□ 1. Tạo file: /src/container/FeatureName/index.tsx
□ 2. Import PRIMARY, PRIMARY_DARK, PRIMARY_LIGHT, PRIMARY_BORDER
□ 3. Import useLanguage và dùng const { t } = useLanguage()
□ 4. Header cam với back button + màu trắng
□ 5. SafeAreaView với backgroundColor: '#F2F2F7'
□ 6. Tất cả text dùng t.xxx.key (KHÔNG hardcode string tiếng Việt)
□ 7. Thêm translation keys vào translations.ts (cả vi và en)
□ 8. Đăng ký trong Navigator tương ứng (BankNavigator / InvestmentNavigator)
□ 9. Thêm navigation.navigate('ScreenName') ở màn gọi
□ 10. Kiểm tra header icon dùng color="#fff"
```

---

## 11. Checklist tạo Mini-App mới

Khi tạo một tính năng lớn độc lập (ví dụ: Chi phí, Vay vốn, Bảo hiểm):

```
□ 1. Tạo /src/navigation/FeatureNavigator.tsx
□ 2. Tạo /src/container/Feature/index.tsx (main screen)
□ 3. Tạo /src/container/Feature/screen/ (sub-screens nếu cần)
□ 4. Đăng ký FeatureNavigator trong MainNavigator
       { name: 'FeatureScreen', component: FeatureNavigator }
□ 5. Thêm quickAction trong Home/index.tsx
       { label: t.home.feature, icon: '...', screen: 'FeatureScreen' }
□ 6. Thêm translation key t.home.feature vào translations.ts
□ 7. Thêm toàn bộ t.featureName.xxx vào translations.ts (vi + en)
□ 8. Test navigation: Home → FeatureScreen → back về Home ✓
□ 9. Test i18n: đổi EN → tất cả text đổi ✓
```

---

## 12. Packages đang dùng

| Package | Mục đích |
|---------|----------|
| `@react-navigation/stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Bottom tab |
| `@rneui/themed` | UI components (Icon, Avatar, Switch...) |
| `react-native-svg` | SVG sparkline charts |
| `@callstack/repack` | Module federation |

### Lệnh chạy (pnpm)

```sh
# Start Metro
pnpm start

# iOS
pnpm ios

# Android
pnpm android
```

> ⚠️ Dự án dùng `pnpm` với `shamefully-hoist=true` trong `.npmrc`.  
> Không dùng `npm install` hay `yarn add` — luôn dùng `pnpm add <package>`.

---

*Tài liệu được tổng hợp từ quá trình xây dựng dự án. Cập nhật khi có thay đổi architecture.*
