import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { Icon } from '@rneui/themed';
import Svg, { Rect, Line } from 'react-native-svg';

const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';

/** Simple QR-like SVG pattern */
const QRCode = () => (
  <Svg width={160} height={160} viewBox="0 0 42 42">
    {/* Top-left finder */}
    <Rect x="1" y="1" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="3" y="3" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    {/* Top-right finder */}
    <Rect x="29" y="1" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="31" y="3" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    {/* Bottom-left finder */}
    <Rect x="1" y="29" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="3" y="31" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    {/* Center orange logo */}
    <Rect x="17" y="17" width="8" height="8" fill={PRIMARY} rx="1.5" />
    {/* Data dots scattered */}
    <Rect x="15" y="1" width="2" height="2" fill="#1a1a1a" />
    <Rect x="19" y="1" width="2" height="2" fill="#1a1a1a" />
    <Rect x="23" y="1" width="2" height="2" fill="#1a1a1a" />
    <Rect x="15" y="4" width="3" height="2" fill="#1a1a1a" />
    <Rect x="21" y="4" width="2" height="3" fill="#1a1a1a" />
    <Rect x="15" y="8" width="2" height="4" fill="#1a1a1a" />
    <Rect x="19" y="7" width="4" height="2" fill="#1a1a1a" />
    <Rect x="29" y="15" width="4" height="2" fill="#1a1a1a" />
    <Rect x="35" y="15" width="6" height="2" fill="#1a1a1a" />
    <Rect x="29" y="19" width="3" height="2" fill="#1a1a1a" />
    <Rect x="34" y="19" width="7" height="3" fill="#1a1a1a" />
    <Rect x="29" y="24" width="5" height="2" fill="#1a1a1a" />
    <Rect x="37" y="24" width="4" height="2" fill="#1a1a1a" />
    <Rect x="1" y="15" width="3" height="2" fill="#1a1a1a" />
    <Rect x="6" y="15" width="5" height="2" fill="#1a1a1a" />
    <Rect x="1" y="19" width="2" height="3" fill="#1a1a1a" />
    <Rect x="5" y="19" width="6" height="2" fill="#1a1a1a" />
    <Rect x="1" y="24" width="4" height="2" fill="#1a1a1a" />
    <Rect x="15" y="29" width="2" height="4" fill="#1a1a1a" />
    <Rect x="19" y="29" width="4" height="2" fill="#1a1a1a" />
    <Rect x="25" y="29" width="6" height="3" fill="#1a1a1a" />
    <Rect x="35" y="29" width="2" height="4" fill="#1a1a1a" />
    <Rect x="19" y="33" width="2" height="4" fill="#1a1a1a" />
    <Rect x="23" y="35" width="5" height="2" fill="#1a1a1a" />
    <Rect x="30" y="33" width="3" height="2" fill="#1a1a1a" />
    <Rect x="35" y="35" width="6" height="6" fill="#1a1a1a" rx="0.5" />
  </Svg>
);

/** Small QR for bottom sheet */
const QRCodeSmall = () => (
  <Svg width={52} height={52} viewBox="0 0 42 42">
    <Rect x="1" y="1" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="3" y="3" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    <Rect x="29" y="1" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="31" y="3" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    <Rect x="1" y="29" width="12" height="12" stroke="#1a1a1a" strokeWidth="1.2" fill="none" rx="1" />
    <Rect x="3" y="31" width="8" height="8" fill="#1a1a1a" rx="0.5" />
    <Rect x="17" y="17" width="8" height="8" fill={PRIMARY} rx="1.5" />
  </Svg>
);

interface Props {
  navigation: any;
}

const QRPayScreen = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<'myqr' | 'scan'>('myqr');
  const [amountEnabled, setAmountEnabled] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({ message: 'Mã QR chuyển tiền: Nguyễn Đình Hiến - Vietcombank 9876 5432 10' });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Pay</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon type="ionicon" name="ellipsis-horizontal" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tab bar (still in orange area) */}
      <View style={styles.tabArea}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myqr' && styles.tabActive]}
            onPress={() => setActiveTab('myqr')}>
            <Text style={[styles.tabText, activeTab === 'myqr' && styles.tabTextActive]}>
              Mã của tôi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scan' && styles.tabActive]}
            onPress={() => setActiveTab('scan')}>
            <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>
              Quét mã QR
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'myqr' ? (
        /* ── MÃ CỦA TÔI ── */
        <>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}>

            {/* QR Card */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>MÃ QR CỦA TÔI</Text>
              <View style={styles.qrWrapper}>
                <QRCode />
              </View>
              <Text style={styles.qrName}>Nguyễn Đình Hiến</Text>
              <Text style={styles.qrAccount}>Vietcombank · 9876 5432 10</Text>
              <View style={styles.qrPill}>
                <Icon type="ionicon" name="scan-outline" size={12} color={PRIMARY_DARK} />
                <Text style={styles.qrPillText}>Scan để chuyển tiền</Text>
              </View>
              <View style={{ height: 16 }} />
            </View>

            {/* Nhập số tiền */}
            <View style={styles.card}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Yêu cầu số tiền cụ thể</Text>
                  <Text style={styles.toggleSub}>Người gửi thấy số tiền bạn muốn nhận</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, amountEnabled ? styles.toggleOn : styles.toggleOff]}
                  onPress={() => setAmountEnabled(v => !v)}>
                  <View style={[styles.toggleThumb, amountEnabled ? styles.thumbOn : styles.thumbOff]} />
                </TouchableOpacity>
              </View>
              {amountEnabled && (
                <View style={styles.amountInput}>
                  <Text style={styles.amountPlaceholder}>Nhập số tiền...</Text>
                </View>
              )}
            </View>

          </ScrollView>

          {/* Bottom actions */}
          <View style={styles.bottomActions}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnOutline}>
                <Icon type="ionicon" name="download-outline" size={16} color={PRIMARY_DARK} />
                <Text style={styles.btnOutlineText}>Lưu ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSolid} onPress={handleShare}>
                <Icon type="ionicon" name="share-outline" size={16} color="#fff" />
                <Text style={styles.btnSolidText}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.btnOutlineFull}
              onPress={() => setActiveTab('scan')}>
              <Icon type="ionicon" name="qr-code-outline" size={16} color={PRIMARY_DARK} />
              <Text style={styles.btnOutlineText}>Quét mã QR người khác</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /* ── QUÉT MÃ QR ── */
        <View style={styles.scanContainer}>
          {/* Fake camera grid */}
          <View style={styles.cameraGrid}>
            <View style={[styles.gridLine, styles.gridV1]} />
            <View style={[styles.gridLine, styles.gridV2]} />
            <View style={[styles.gridH1]} />
            <View style={[styles.gridH2]} />
          </View>

          {/* Scan frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.scanLine} />
          </View>

          <Text style={styles.scanHint}>Đưa mã QR vào khung để quét</Text>

          {/* Controls */}
          <View style={styles.scanControls}>
            <View style={styles.controlItem}>
              <TouchableOpacity style={styles.controlBtn}>
                <Icon type="ionicon" name="flashlight-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>Đèn pin</Text>
            </View>
            <View style={styles.controlItem}>
              <TouchableOpacity style={styles.controlBtn}>
                <Icon type="ionicon" name="images-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>Thư viện</Text>
            </View>
          </View>

          {/* Bottom sheet */}
          <View style={styles.scanSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetRow}>
              <View style={styles.sheetQR}>
                <QRCodeSmall />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetName}>Mã QR của tôi</Text>
                <Text style={styles.sheetBank}>Nguyễn Đình Hiến · VCB</Text>
              </View>
              <TouchableOpacity style={styles.sheetShare} onPress={handleShare}>
                <Text style={styles.sheetShareText}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default QRPayScreen;

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

  // Tab
  tabArea: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabBar: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 10,
    padding: 3,
    flexDirection: 'row',
    gap: 3,
  },
  tab: { flex: 1, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  tabTextActive: { color: PRIMARY_DARK, fontWeight: '600' },

  // My QR
  scroll: { padding: 16, gap: 12, paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', alignItems: 'center' },
  sectionLabel: {
    fontSize: 10,
    color: '#aaa',
    letterSpacing: 0.6,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 12,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  qrName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginTop: 12 },
  qrAccount: { fontSize: 12, color: '#888', marginTop: 4 },
  qrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
  },
  qrPillText: { fontSize: 11, color: PRIMARY_DARK, fontWeight: '500' },

  // Amount toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    alignSelf: 'stretch',
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
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  thumbOn: { right: 2 },
  thumbOff: { left: 2 },
  amountInput: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 12,
    alignSelf: 'stretch',
  },
  amountPlaceholder: { fontSize: 14, color: '#ccc', fontStyle: 'italic' },

  // Bottom actions
  bottomActions: { padding: 16, gap: 10, backgroundColor: '#F2F2F7' },
  actionRow: { flexDirection: 'row', gap: 10 },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  btnOutlineText: { fontSize: 13, fontWeight: '500', color: PRIMARY_DARK },
  btnSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 12,
    backgroundColor: PRIMARY,
  },
  btnSolidText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  btnOutlineFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY,
  },

  // Scanner
  scanContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  cameraGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04 },
  gridLine: { position: 'absolute', backgroundColor: '#fff' },
  gridV1: { left: '33%', top: 0, bottom: 0, width: 0.5 },
  gridV2: { left: '66%', top: 0, bottom: 0, width: 0.5 },
  gridH1: { position: 'absolute', top: '33%', left: 0, right: 0, height: 0.5, backgroundColor: '#fff' },
  gridH2: { position: 'absolute', top: '66%', left: 0, right: 0, height: 0.5, backgroundColor: '#fff' },

  scanFrame: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: PRIMARY,
    borderStyle: 'solid',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  scanLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: 'rgba(232,153,81,0.7)',
    borderRadius: 1,
  },
  scanHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

  scanControls: { flexDirection: 'row', gap: 36 },
  controlItem: { alignItems: 'center', gap: 6 },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },

  // Scan bottom sheet
  scanSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetQR: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 4,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  sheetName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  sheetBank: { fontSize: 11, color: '#888', marginTop: 2 },
  sheetShare: {
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sheetShareText: { fontSize: 12, color: PRIMARY_DARK, fontWeight: '500' },
});
