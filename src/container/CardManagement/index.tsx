import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Icon } from '@rneui/themed';

const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';

interface ToggleProps {
  value: boolean;
  onToggle: () => void;
}

const Toggle = ({ value, onToggle }: ToggleProps) => (
  <TouchableOpacity
    style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
    onPress={onToggle}
    activeOpacity={0.8}>
    <View style={[styles.toggleThumb, value ? styles.thumbOn : styles.thumbOff]} />
  </TouchableOpacity>
);

interface Props {
  navigation: any;
}

const CardManagementScreen = ({ navigation }: Props) => {
  const [onlinePayment, setOnlinePayment] = useState(true);
  const [intlPayment, setIntlPayment] = useState(false);
  const [notification, setNotification] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thẻ của tôi</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon type="ionicon" name="add-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Card visual */}
        <View style={styles.cardVisual}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.chip} />
          <Text style={styles.cardNumber}>••••  ••••  ••••  8842</Text>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardFieldLabel}>CHỦ THẺ</Text>
              <Text style={styles.cardFieldValue}>N. DINH HIEN</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.cardFieldLabel}>HẾT HẠN</Text>
              <Text style={styles.cardFieldValue}>12/28</Text>
            </View>
            <Text style={styles.visaText}>VISA</Text>
          </View>
        </View>

        {/* Status + Quick Actions */}
        <View style={styles.card}>
          {/* Status */}
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Đang hoạt động</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Visa Debit</Text>
            </View>
          </View>
          <View style={styles.divider} />
          {/* 4 actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon type="ionicon" name="lock-closed-outline" size={16} color="#dc2626" />
              </View>
              <Text style={styles.actionLabel}>Khóa thẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
                <Icon type="ionicon" name="eye-outline" size={16} color="#2563eb" />
              </View>
              <Text style={styles.actionLabel}>Số thẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#f3e8ff' }]}>
                <Icon type="ionicon" name="document-text-outline" size={16} color="#7c3aed" />
              </View>
              <Text style={styles.actionLabel}>Sao kê</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: PRIMARY_LIGHT }]}>
                <Icon type="ionicon" name="settings-outline" size={16} color={PRIMARY} />
              </View>
              <Text style={styles.actionLabel}>Cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hạn mức */}
        <View style={styles.card}>
          <View style={styles.limitHeader}>
            <Text style={styles.limitTitle}>HẠN MỨC THÁNG NÀY</Text>
            <Text style={styles.limitPercent}>25% đã dùng</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitUsed}>12.500.000 đ</Text>
            <Text style={styles.limitTotal}>/ 50.000.000 đ</Text>
          </View>
        </View>

        {/* Toggle list */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Thanh toán online</Text>
              <Text style={styles.toggleSub}>Website, ứng dụng</Text>
            </View>
            <Toggle value={onlinePayment} onToggle={() => setOnlinePayment(v => !v)} />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Thanh toán quốc tế</Text>
              <Text style={styles.toggleSub}>Ngoài Việt Nam</Text>
            </View>
            <Toggle value={intlPayment} onToggle={() => setIntlPayment(v => !v)} />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Thông báo giao dịch</Text>
              <Text style={styles.toggleSub}>Push + SMS</Text>
            </View>
            <Toggle value={notification} onToggle={() => setNotification(v => !v)} />
          </View>
        </View>

        {/* Danger zone */}
        <TouchableOpacity style={styles.dangerBtn}>
          <Icon type="ionicon" name="trash-outline" size={16} color="#dc2626" />
          <Text style={styles.dangerText}>Hủy thẻ</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CardManagementScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },

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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#fff' },

  scroll: { padding: 16, gap: 14, paddingBottom: 32 },

  // Card visual
  cardVisual: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -30,
    right: -30,
  },
  decoCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: '40%',
  },
  chip: {
    width: 28,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 14,
  },
  cardNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    marginBottom: 14,
    fontWeight: '500',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardFieldLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginBottom: 3 },
  cardFieldValue: { fontSize: 11, color: '#fff', fontWeight: '600', letterSpacing: 0.3 },
  visaText: { fontSize: 18, color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', fontWeight: '700' },

  // Card wrapper
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  divider: { height: 0.5, backgroundColor: '#F0F0F0', marginHorizontal: 16 },

  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  statusText: { flex: 1, fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  statusBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: { fontSize: 11, color: '#888', fontWeight: '500' },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 14,
    gap: 4,
  },
  actionItem: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 10, color: '#555', textAlign: 'center', fontWeight: '500' },

  // Limit
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 10,
  },
  limitTitle: { fontSize: 10, color: '#aaa', letterSpacing: 0.6, fontWeight: '500' },
  limitPercent: { fontSize: 12, color: PRIMARY, fontWeight: '600' },
  progressBg: {
    marginHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    height: 8,
  },
  progressFill: {
    width: '25%',
    height: 8,
    backgroundColor: PRIMARY,
    borderRadius: 6,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  limitUsed: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  limitTotal: { fontSize: 13, color: '#aaa' },

  // Toggles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: '#1a1a1a' },
  toggleSub: { fontSize: 11, color: '#aaa', marginTop: 2 },
  toggle: { width: 46, height: 26, borderRadius: 13 },
  toggleOn: { backgroundColor: PRIMARY },
  toggleOff: { backgroundColor: '#E0E0E0' },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  thumbOn: { right: 2 },
  thumbOff: { left: 2 },

  // Danger
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#fee2e2',
  },
  dangerText: { fontSize: 14, color: '#dc2626', fontWeight: '500' },
});
