import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useLanguage } from '../../context/LanguageContext';

const PRIMARY = '#E89951';
const PRIMARY_DARK = '#b36a1a';
const PRIMARY_LIGHT = '#fdf3e7';
const PRIMARY_BORDER = '#f0c48a';

const AVATAR_URL =
  'https://i.pinimg.com/736x/d3/9d/85/d39d854ad761552a841304300c779f53.jpg';

// ─── Row component ────────────────────────────────────────────────────────────

const ProfileRow = ({
  icon,
  label,
  value,
  iconBg,
  iconColor,
  isLast = false,
  danger = false,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  iconBg?: string;
  iconColor?: string;
  isLast?: boolean;
  danger?: boolean;
  onPress?: () => void;
}) => (
  <>
    <TouchableOpacity style={styles.profileRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIconWrap, { backgroundColor: iconBg ?? PRIMARY_LIGHT }]}>
          <Icon
            type="ionicon"
            name={icon}
            size={17}
            color={danger ? '#ef4444' : (iconColor ?? PRIMARY_DARK)}
          />
        </View>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      </View>
      {!danger && (
        <View style={styles.rowRight}>
          {value ? <Text style={styles.rowValue}>{value}</Text> : null}
          <Icon type="ionicon" name="chevron-forward" size={15} color="#ccc" />
        </View>
      )}
    </TouchableOpacity>
    {!isLast && <View style={styles.rowDivider} />}
  </>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

const ProfileScreen = () => {
  const { t } = useLanguage();
  const [logoutModal, setLogoutModal] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.profile.title}</Text>
      </View>

      {/* Avatar + Name card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.nameText}>Nguyễn Đình Hiến</Text>
          <Text style={styles.emailText}>nguyenhien@gmail.com</Text>
          <View style={styles.levelBadge}>
            <Icon type="ionicon" name="star" size={11} color={PRIMARY_DARK} />
            <Text style={styles.levelText}>{t.profile.level}: {t.profile.levelValue}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Icon type="ionicon" name="create-outline" size={18} color={PRIMARY_DARK} />
          <Text style={styles.editText}>{t.profile.editProfile}</Text>
        </TouchableOpacity>
      </View>

      {/* ── HOẠT ĐỘNG ── */}
      <Text style={styles.sectionLabel}>{t.profile.sectionActivity}</Text>
      <View style={styles.card}>
        <ProfileRow
          icon="time-outline"
          label={t.profile.history}
          iconBg="#e8f0f8"
          iconColor="#1a4a7a"
        />
        <ProfileRow
          icon="card-outline"
          label={t.profile.personalAccount}
          iconBg="#e8f8f0"
          iconColor="#1a7a40"
          isLast
        />
      </View>

      {/* ── TÀI KHOẢN ── */}
      <Text style={styles.sectionLabel}>{t.profile.sectionAccount}</Text>
      <View style={styles.card}>
        <ProfileRow
          icon="shield-checkmark-outline"
          label={t.profile.security}
          iconBg="#fff4e8"
          iconColor={PRIMARY_DARK}
        />
        <ProfileRow
          icon="document-text-outline"
          label={t.profile.terms}
          iconBg="#f5f0ff"
          iconColor="#6c3fc4"
          isLast
        />
      </View>

      {/* ── Đăng xuất ── */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <ProfileRow
          icon="exit-outline"
          label={t.profile.logout}
          danger
          isLast
          onPress={() => setLogoutModal(true)}
        />
      </View>

      {/* Logout confirm modal */}
      <Modal
        visible={logoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLogoutModal(false)}>
          <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
            <View style={styles.modalIconWrap}>
              <Icon type="ionicon" name="exit-outline" size={28} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>{t.profile.logout}</Text>
            <Text style={styles.modalDesc}>{t.profile.logoutConfirm}</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setLogoutModal(false)}>
                <Text style={styles.modalBtnCancelText}>{t.setting.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm}>
                <Text style={styles.modalBtnConfirmText}>{t.profile.logout}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },

  // Avatar card
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 4,
    padding: 16,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
    gap: 14,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: PRIMARY_BORDER,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1a7a40',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameBlock: { flex: 1 },
  nameText: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  emailText: { fontSize: 12, color: '#aaa', marginTop: 2 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  levelText: { fontSize: 10, color: PRIMARY_DARK, fontWeight: '500' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: PRIMARY_BORDER,
  },
  editText: { fontSize: 11, color: PRIMARY_DARK, fontWeight: '500' },

  sectionLabel: {
    fontSize: 11,
    color: '#aaa',
    letterSpacing: 0.6,
    fontWeight: '500',
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 14, color: '#1a1a1a' },
  rowLabelDanger: { color: '#ef4444', fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 13, color: '#aaa' },
  rowDivider: { height: 0.5, backgroundColor: '#F0F0F0', marginLeft: 60 },

  // Logout modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffeaea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  modalDesc: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 18 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: '500', color: '#888' },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalBtnConfirmText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
