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
10. [Xử lý lỗi & Logging](#10-xử-lý-lỗi--logging)
11. [Checklist tạo Screen mới](#11-checklist-tạo-screen-mới)
12. [Checklist tạo Mini-App mới](#12-checklist-tạo-mini-app-mới)

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

### 2.1 Brand Colors — design "Classical" (vàng đồng)

> ⚠️ **KHÔNG hardcode màu.** Lấy màu qua `useThemeColors()` để tự đảo theo Sáng/Tối.
> Bảng màu cam `primary*` chỉ còn cho tương thích ngược — màn mới dùng `accent*`.

```typescript
const c = useThemeColors();

c.accent      // #b68235 — vàng đồng chính (progress, dot, viền avatar)
c.accent100   // nền đồng nhạt (ô icon, chip active, badge)
c.accent300   // đồng SÁNG — chữ/icon trên nền tối (cố định 2 mode)
c.accent700   // đồng ĐẬM — chữ/icon trên nền sáng (đảo theo mode)
c.heroCopper  // nền hero đồng ấm (Home) — cố định đậm ở cả 2 mode
c.heroDark    // #1a1815 — nền hero/header mini-app, nút chính, tab bar
c.offWhite    // #fdfcfb — chữ/nút trên nền tối
```

Thang bo góc / chữ / spacing: import từ `src/theme/tokens.ts`

```typescript
import { RADII, TYPE, SPACING, FONT } from '../../theme/tokens';

RADII.card / item / chip / pill      // 22 / 16 / 10 / 100
TYPE.display / title / itemTitle / body / caption   // 24 / 18 / 15 / 13 / 11
SPACING.screenX                       // padding ngang chuẩn mỗi màn
FONT.regular / medium / semibold / bold  // Be Vietnam Pro
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

- **Tab screens** không có back button → tiêu đề lớn 26px, không dùng SubHeader
- **Stack screens trong mini-app** dùng `<SubHeader>` (back + tiêu đề + action tuỳ chọn)
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
// KHÔNG khai báo màu brand ở đây — lấy từ useThemeColors() để hỗ trợ Sáng/Tối.
// Chỉ đặt hằng số không phụ thuộc theme (URL, tên riêng, mệnh giá...).
const USER_NAME = 'Nguyễn Đình Hiến'; // tên riêng — không dịch

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
      {/* SubHeader */}
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

### 4.2 SubHeader chuẩn (màn con)

Mọi màn "con" (không phải tab gốc) dùng component dùng chung — **không tự dựng header**:

```typescript
import SubHeader from '../../components/UI/SubHeader';

// Chỉ back + tiêu đề
<SubHeader title={t.xxx.title} onBack={() => navigation.goBack()} />

// Có thêm 1 action bên phải
<SubHeader
  title={t.xxx.title}
  onBack={() => navigation.goBack()}
  right={
    <TouchableOpacity onPress={...} hitSlop={8}>
      <AppIcon type={ICON_TYPE.Iconoir} name="more-horiz" size={20} color={c.accent700} />
    </TouchableOpacity>
  }
/>
```

SubHeader: nền trong suốt theo `c.bg`, nút back Iconoir `nav-arrow-left`, tiêu đề 18px/600,
gạch chân `c.divider`. Icon action dùng `c.accent700` (KHÔNG dùng `#fff`).

### 4.3 Tab screen (không có SubHeader)

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
    <View style={{ width: 3, height: 16, backgroundColor: c.accent, borderRadius: 2 }} />
    <Text style={{ fontSize: 15, fontWeight: '500', color: '#1a1a1a' }}>{title}</Text>
  </View>
);
```

---

### 4.5 Tab bar pill nổi

Bottom tab dùng custom bar `src/navigation/PillTabBar.tsx` — **không dùng style mặc định**:
nền tối `#1a1815`, bo tròn 100, viền đồng mờ (để tách nền ở chế độ Tối),
tab đang chọn = pill trắng ngà + icon/nhãn tối, tab còn lại chỉ icon mờ.

```typescript
<Tabs.Navigator
  screenOptions={{ headerShown: false }}
  tabBar={props => <PillTabBar {...props} />}
  initialRouteName="Home"
>
```

Thêm tab mới → khai báo icon Iconoir trong `TAB_ICON` của PillTabBar.

### 4.6 Dark mode — bắt buộc kiểm tra

Mọi màu **phải** lấy từ `useThemeColors()`. Màu hardcode chỉ dùng cho:
- màu semantic cố định (xanh lãi `#1a7a40`, đỏ lỗ `#c0392b`)
- màu pastel của **data tĩnh** (icon danh mục / mã cổ phiếu)
- lớp phủ trên nền tối: `rgba(253,252,251,0.12)` thay vì `#fff`

Khi làm màn mới: đổi Cài đặt → Giao diện → **Tối**, kiểm tra không có khối nào
bị "tàng hình" (nền tối trên nền tối) hoặc chữ tối trên nền tối.

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
          <Icon type="ionicon" name={icon} size={17} color={c.accent700} />
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
rowIconWrap: { width: 32, height: 32, borderRadius: RADII.chip, backgroundColor: c.accent100,
               alignItems: 'center', justifyContent: 'center' }
rowDivider:  { height: StyleSheet.hairlineWidth, backgroundColor: c.divider, marginLeft: 60 }
```

### 6.3 Toggle Switch

```typescript
<Switch
  value={value}
  onValueChange={onToggle}
  trackColor={{ false: c.border, true: c.accent }}
  thumbColor="#fff"
  ios_backgroundColor={c.border}
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

filterChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADII.pill,
                    borderWidth: StyleSheet.hairlineWidth, borderColor: c.border, backgroundColor: c.white }
filterChipActive: { backgroundColor: c.accent100, borderColor: c.accent100 }
filterText:       { fontFamily: FONT.regular, fontSize: TYPE.body, color: c.subtext }
filterTextActive: { fontFamily: FONT.medium, color: c.accent700 }
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
primaryBtn:   { backgroundColor: c.heroDark, borderRadius: RADII.item, height: 50,   // nút chính = khối tối
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

btnBuy:     { flex: 2, backgroundColor: c.heroDark, borderRadius: RADII.item, height: 50,
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
backgroundColor: c.accent100, borderRadius: RADII.chip,
// → text color: c.accent700
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

### 6.11 UI Kit (`src/components/UI/` — nền react-native-paper)

Bộ component dùng chung đã theme sẵn theo brand — **ưu tiên dùng chúng thay vì
viết lại TouchableOpacity/Modal thủ công** cho các pattern bên dưới.
Màu brand lấy từ `BRAND` trong `src/theme/paperTheme.ts` (không hardcode lại).
`PaperProvider` đã được bọc sẵn trong `src/app.tsx`.

| Component | Thay cho pattern | Props chính |
|---|---|---|
| `AppButton` | Bottom CTA (6.5) | `title`, `variant: primary\|danger\|outline\|ghost`, `loading`, `icon` |
| `AppCard` | Card chuẩn (6.1) | `onPress?`, `padded`, `inset` |
| `AppChip` | Filter chip (6.4) | `label`, `selected`, `onPress` |
| `AppDialog` | Confirm modal (6.9) | `visible`, `tone`, `icon`, `cancelText?`, `confirmText`, `onConfirm` |
| `AppSnackbar` | Toast/thông báo nhanh | `visible`, `message`, `tone: success\|danger\|info` |
| `AppSwitch` | Toggle (6.3) | `value`, `onValueChange` |
| `SectionTitle` | Section title (4.4) | `title`, `actionText?`, `onAction?` |

```typescript
import { AppButton, AppDialog } from '../../components/UI';

<AppButton title={t.xxx.confirm} loading={submitting} onPress={handleSubmit(onSubmit)} />

<AppDialog
  visible={show} onDismiss={() => setShow(false)}
  icon="exit-outline" tone="danger"
  title={t.profile.logout} description={t.profile.logoutConfirm}
  cancelText={t.setting.cancel} confirmText={t.profile.logout}
  onConfirm={doLogout}
/>
```

Ví dụ thật: nút submit ở `src/container/Login/index.tsx`, dialog đăng xuất ở
`src/container/ProfileScreen/index.tsx`.

> ⚠️ **Bẫy z-order**: `AppDialog`/`AppSnackbar` render qua Portal của Paper (nằm ở root),
> còn `<Modal>` của React Native là modal native — **luôn đè lên Portal**.
> Nếu cần mở dialog từ trong bottom sheet (Modal), phải **đóng Modal trước** rồi mới
> set state mở dialog (xem `placeOrder` trong `src/container/Investment/index.tsx`).

### 6.12 Form (react-hook-form + zod)

Component form dùng chung nằm ở `src/components/Form/` (`FormTextInput`, `FormCheckbox`).
Mỗi component tự bọc `Controller` và tự render label + error — screen chỉ cần khai báo schema.
Ví dụ đầy đủ: `src/container/Login/index.tsx`.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormTextInput, FormCheckbox } from '../../components/Form';

// Schema nhận t để error message theo i18n
const makeSchema = (t: Translations) =>
  z.object({
    phone: z.string().min(1, t.login.errPhoneRequired).regex(/^(0|\+84)\d{9}$/, t.login.errPhoneInvalid),
    password: z.string().min(1, t.login.errPasswordRequired).min(6, t.login.errPasswordMin),
    remember: z.boolean(),
  });
type LoginForm = z.infer<ReturnType<typeof makeSchema>>;

// Trong component
const schema = useMemo(() => makeSchema(t), [t]);
const { control, handleSubmit } = useForm<LoginForm>({
  resolver: zodResolver(schema),
  defaultValues: { phone: '', password: '', remember: true },
  mode: 'onTouched',
});

// JSX — truyền control + name, mọi thứ còn lại tự động
<FormTextInput control={control} name="phone" label={t.login.phone} icon="call-outline" keyboardType="phone-pad" />
<FormTextInput control={control} name="password" label={t.login.password} icon="lock-closed-outline" secure />
<FormCheckbox  control={control} name="remember" label={t.login.remember} />
<TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit(onSubmit)} />
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

## 10. Xử lý lỗi & Logging

### 10.1 Ba nguyên tắc

1. **Bắt tại chỗ.** try/catch ngay nơi có thể xử lý lỗi một cách có nghĩa. Không để lỗi
   bubble lên rồi bắt tập trung — dự án **không dùng** ErrorBoundary.
2. **Không nuốt lỗi im lặng.** `catch {}` rỗng là không chấp nhận được.
3. **Không trả về `{ data, error }`.** Hàm xử lý xong thì trả kết quả, lỗi thì log + xử lý
   tại chỗ.

### 10.2 Phân loại lỗi → cách xử lý

Quyết định theo một câu hỏi: **user có cần biết không?**

| Loại | Xử lý | Ví dụ trong dự án |
|---|---|---|
| User **không** cần biết (app vẫn dùng được) | `logger.warn` + fallback im lặng | `ThemeContext` — AsyncStorage lỗi thì dùng theme hệ thống |
| User **phải** biết (bấm mà không có gì xảy ra) | `logger.warn` + **snackbar tiếng Việt** | `About` / `WebView` — `Linking.openURL` thất bại |
| Lỗi mạng có UI riêng | `logger.error` + set state lỗi → banner + nút "Thử lại" | `Investment` — `fetchRates` / `fetchStocks` |

```typescript
// ── Loại 1: chỉ log, fallback im lặng ──
AsyncStorage.setItem(STORAGE_KEY, next).catch(err =>
  logger.warn('theme', 'không lưu được theme, chỉ áp dụng cho phiên này', err),
);

// ── Loại 2: log + báo user ──
const openLink = (url: string) =>
  Linking.openURL(url).catch(err => {
    logger.warn('about', `không mở được link: ${url}`, err);
    setToast(t.common.linkOpenFailed);   // thông báo qua i18n
  });

// ── Loại 3: log + state lỗi cho UI retry ──
} catch (err) {
  logger.error('invest', 'không tải được tỷ giá', err);
  setRatesError(true);
}
```

### 10.3 Khi nào `catch` rỗng là hợp lệ

Chỉ khi lỗi **là hành vi bình thường**, và **phải ghi comment nói rõ lý do**:

```typescript
try {
  await Share.share({ message: '...' });
} catch {
  // Share bị user huỷ — hành vi bình thường, không phải lỗi cần báo
}
```

Hai chỗ duy nhất đang được miễn trừ: `QRPay` (user huỷ share) và `WebView`
(lazy require native module chưa link).

### 10.4 Logger

Dùng `src/utils/logger.ts` — **không `console.log` trực tiếp** trong code chính thức.
Logger chỉ in khi `__DEV__`, nên bản release không cần `transform-remove-console`.

```typescript
import { logger } from '../../utils/logger';

logger.warn(scope, message, detail?)   // lỗi có fallback, app vẫn chạy
logger.error(scope, message, detail?)  // lỗi làm mất chức năng
```

`scope` là prefix module để dễ lọc log. Các scope đang dùng:
`theme` · `about` · `webview` · `chatbot` · `invest`

### 10.5 Hai điều tuyệt đối không làm

**Không log dữ liệu nhạy cảm.** Object form đăng nhập chứa `password`:

```typescript
// ✗ SAI — in cả password ra log
console.log('Login payload:', data);

// ✓ ĐÚNG — không log payload; nếu cần thì chỉ log field an toàn
```

**Không đưa chi tiết kỹ thuật ra UI.** User cuối không đọc HTTP code hay message của API:

```typescript
// ✗ SAI — nối message thô của Gemini vào bong bóng chat
return { text: `${t.chatbot.errNetwork} (${data.error?.message})`, isError: true };

// ✓ ĐÚNG — chi tiết vào log, user thấy thông báo thân thiện
logger.error('chatbot', `Gemini trả lỗi ${code}`, data.error?.message);
return { text: t.chatbot.errNetwork, isError: true };
```

Mọi thông báo lỗi hiển thị đều lấy từ `translations.ts` (có cả bản EN), viết bằng
tiếng Việt thân thiện — xem `t.chatbot.errNetwork`, `t.common.linkOpenFailed`.

---

## 11. Checklist tạo Screen mới

Khi tạo một screen con trong mini-app hiện có:

```
□ 1. Tạo file: /src/container/FeatureName/index.tsx
□ 2. Lấy màu bằng useThemeColors() + import { RADII, TYPE, SPACING, FONT } từ theme/tokens
□ 3. Import useLanguage và dùng const { t } = useLanguage()
□ 4. Dùng <SubHeader title={t.xxx.title} onBack={...} /> — KHÔNG tự dựng header
□ 5. SafeAreaView với backgroundColor: c.bg
□ 6. Tất cả text dùng t.xxx.key (KHÔNG hardcode string tiếng Việt)
        → tên riêng (vd 'Nguyễn Đình Hiến') tách thành const USER_NAME, không dịch
        → mảng data cần dịch: build TRONG component để lấy được `t`
□ 7. Thêm translation keys vào translations.ts (cả vi và en)
□ 8. Đăng ký trong Navigator tương ứng (BankNavigator / ExpenseNavigator / ...)
□ 9. Thêm navigation.navigate('ScreenName') ở màn gọi
□ 10. Test đổi EN → toàn bộ text đổi; test chế độ Tối → không có màu cứng lọt
□ 11. Mọi thao tác có thể lỗi (fetch, AsyncStorage, Linking, Share) đều có xử lý:
        log qua logger + fallback/snackbar — KHÔNG catch rỗng (xem chương 10)
□ 12. Không log dữ liệu nhạy cảm, không đưa chi tiết kỹ thuật ra UI
```

---

## 12. Checklist tạo Mini-App mới

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
□ 10. Test Sáng/Tối: không còn màu hardcode làm lệch giao diện ✓
□ 11. Test đường lỗi: tắt mạng → mini-app hiện thông báo/retry, không crash, không im lặng ✓
```

---

## 13. Packages đang dùng

| Package | Mục đích |
|---------|----------|
| `@react-navigation/stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Bottom tab |
| `@rneui/themed` | UI components (Icon, Avatar, Switch...) |
| `react-native-svg` | SVG sparkline charts |
| `@callstack/repack` | Module federation |
| `react-hook-form` | Quản lý state/validation của form |
| `zod` | Schema validation, type-safe |
| `@hookform/resolvers` | Nối zod vào react-hook-form |
| `react-native-paper` | Nền cho UI kit `src/components/UI/` (đã theme theo brand) |

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
