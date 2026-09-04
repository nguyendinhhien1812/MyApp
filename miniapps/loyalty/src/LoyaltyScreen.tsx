// Mini-app "Tích điểm" — build và deploy ĐỘC LẬP với app host.
//
// Cố ý KHÔNG import gì từ src/ của host: bundle này tải về lúc chạy, nếu phụ
// thuộc vào nội bộ host thì mỗi lần host đổi cấu trúc là mini-app gãy. Chỉ dùng
// react-native (host chia sẻ dạng singleton) và props host truyền vào.

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Appearance,
} from 'react-native';

export type LoyaltyProps = {
  /** Host truyền vào để mini-app không tự đoán chế độ sáng/tối */
  scheme?: 'light' | 'dark';
  onBack?: () => void;
};

const PALETTE = {
  light: { bg: '#F8F6F2', card: '#FFFFFF', text: '#1A1815', sub: '#736E66',
           accent: '#855819', chip: '#F3E8D5', border: '#E8E3DB' },
  dark:  { bg: '#121212', card: '#1F1F1F', text: '#EDEDED', sub: '#A6A6A6',
           accent: '#e0b877', chip: '#34281A', border: '#2A2A2A' },
};

const REWARDS = [
  { id: 1, name: 'Giảm 20% Highlands', cost: 500 },
  { id: 2, name: 'Voucher Grab 50.000đ', cost: 1200 },
  { id: 3, name: 'Vé xem phim CGV', cost: 2000 },
  { id: 4, name: 'Miễn phí chuyển tiền 1 tháng', cost: 3500 },
];

const POINTS = 2450;

const LoyaltyScreen = ({ scheme, onBack }: LoyaltyProps) => {
  const mode = scheme ?? (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
  const c = PALETTE[mode];
  const s = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={s.safe}>
      <View style={s.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={10}>
            <Text style={s.back}>‹</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={s.title}>Tích điểm</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Text style={s.heroLabel}>ĐIỂM CỦA BẠN</Text>
          <Text style={s.heroValue}>{POINTS.toLocaleString('vi-VN')}</Text>
          <View style={s.tier}>
            <Text style={s.tierText}>Hạng Vàng</Text>
          </View>
        </View>

        <Text style={s.section}>ĐỔI THƯỞNG</Text>
        {REWARDS.map(r => {
          const enough = POINTS >= r.cost;
          return (
            <View key={r.id} style={s.row}>
              <View style={s.rowInfo}>
                <Text style={s.rowName}>{r.name}</Text>
                <Text style={s.rowCost}>{r.cost.toLocaleString('vi-VN')} điểm</Text>
              </View>
              <View style={[s.btn, !enough && s.btnOff]}>
                <Text style={[s.btnText, !enough && s.btnTextOff]}>
                  {enough ? 'Đổi' : 'Chưa đủ'}
                </Text>
              </View>
            </View>
          );
        })}

        <Text style={s.footer}>Mini-app tải từ xa · v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default LoyaltyScreen;

const makeStyles = (c: typeof PALETTE.light) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 },
    back: { fontSize: 30, color: c.accent, lineHeight: 30 },
    title: { fontSize: 20, fontWeight: '600', color: c.text },
    scroll: { paddingHorizontal: 20, paddingBottom: 120 },
    hero: { backgroundColor: '#1a1815', borderRadius: 22, padding: 20, marginBottom: 24 },
    heroLabel: { fontSize: 11, letterSpacing: 1.6, color: '#d8b783' },
    heroValue: { fontSize: 34, fontWeight: '600', color: '#fdfcfb', marginTop: 6 },
    tier: { alignSelf: 'flex-start', backgroundColor: 'rgba(216,183,131,0.18)',
            borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginTop: 10 },
    tierText: { fontSize: 12, color: '#d8b783' },
    section: { fontSize: 11, letterSpacing: 1.6, color: c.sub, marginBottom: 10 },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card,
           borderRadius: 14, padding: 14, marginBottom: 10,
           borderWidth: 1, borderColor: c.border },
    rowInfo: { flex: 1 },
    rowName: { fontSize: 14, color: c.text },
    rowCost: { fontSize: 12, color: c.sub, marginTop: 2 },
    btn: { backgroundColor: c.chip, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
    btnOff: { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border },
    btnText: { fontSize: 12, fontWeight: '600', color: c.accent },
    btnTextOff: { color: c.sub },
    footer: { fontSize: 11, color: c.sub, textAlign: 'center', marginTop: 20 },
  });
