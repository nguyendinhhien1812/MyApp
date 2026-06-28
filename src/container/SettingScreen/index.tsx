import {
  BottomSheet,
  Card,
  CheckBox,
  Icon,
  SocialIcon,
  Switch,
  Text,
  useTheme,
} from '@rneui/themed';
import React, { useState } from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';

const SettingScreen = () => {
  const colors = useTheme().theme.colors;

  const [isShowLanguage, setIsShowLanguage] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isNotification, setIsNotification] = useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Cài đặt</Text>
      </View>
      {/* View setting */}
      <Card
        containerStyle={{
          borderRadius: 16,
          marginHorizontal: 10,
          marginVertical: 10,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
          }}
          onPress={() => {
            setIsShowLanguage(!isShowLanguage);
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="language-outline" type="ionicon" color={'#000000'} />
            <Text style={{ fontSize: 16, marginLeft: 6 }}>Ngôn ngữ</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: 'gray', marginRight: 4 }}>
              {selectedIndex === 0 ? 'Tiếng Việt' : 'Tiếng Anh'}
            </Text>
            <Icon
              name={'chevron-right'}
              type="material-community"
              color={'#000000'}
            />
          </View>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 16,
            }}
          >
            Nhận thông báo mới
          </Text>
          <Switch
            style={{ alignItems: 'flex-end' }}
            value={isNotification}
            onValueChange={setIsNotification}
          />
        </View>
      </Card>
      <BottomSheet
        isVisible={isShowLanguage}
        onBackdropPress={() => setIsShowLanguage(false)}
        containerStyle={{
          backgroundColor: 'transparent',
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
            Chọn ngôn ngữ
          </Text>
          <CheckBox
            title="Tiếng Việt"
            checked={selectedIndex === 0}
            onPress={() => {
              setSelectedIndex(0);
              setIsShowLanguage(false);
            }}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, margin: 0, marginLeft: 0, marginRight: 0 }}
          />
          <CheckBox
            title="Tiếng Anh"
            checked={selectedIndex === 1}
            onPress={() => {
              setSelectedIndex(1);
              setIsShowLanguage(false);
            }}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, margin: 0, marginLeft: 0, marginRight: 0 }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default SettingScreen;
