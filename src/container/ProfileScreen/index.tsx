import { Avatar, Card, Text, useTheme, Icon } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, TouchableOpacity, View } from 'react-native';

const ProfileScreen = () => {
  const colors = useTheme().theme.colors;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
      }}
    >
      <Card
        containerStyle={{
          width: '90%',
          borderRadius: 16,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Avatar
            containerStyle={{
              width: 50,
              height: 50,
            }}
            avatarStyle={{
              borderRadius: 50,
            }}
            source={{
              uri: 'https://i.pinimg.com/736x/d3/9d/85/d39d854ad761552a841304300c779f53.jpg',
            }}
          />
          <View style={{ flex: 3, marginLeft: 8 }}>
            <Text h4>Nguyễn Đình Hiến</Text>
            <Text>nguyenhien@gmail.com</Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
            }}
          >
            <TouchableOpacity>
              <Icon
                name="account-edit-outline"
                type="material-community"
                color={'#000000'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
      <Card
        containerStyle={{
          width: '90%',
          borderRadius: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 0.2,
            borderColor: colors.outline,
            paddingVertical: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="timer-outline" type="ionicon" color={'#000000'} />
            <Text style={{ marginLeft: 6 }}>Lịch sử</Text>
          </View>
          <Icon
            name="chevron-right"
            type="material-community"
            color={'#000000'}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 0.2,
            borderColor: colors.outline,
            paddingVertical: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="card-outline" type="ionicon" color={'#000000'} />
            <Text style={{ marginLeft: 6 }}>Tài khoản cá nhân</Text>
          </View>
          <Icon
            name="chevron-right"
            type="material-community"
            color={'#000000'}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="newspaper-outline" type="ionicon" color={'#000000'} />
            <Text style={{ marginLeft: 6 }}>Điều khoản</Text>
          </View>
          <Icon
            name="chevron-right"
            type="material-community"
            color={'#000000'}
          />
        </View>
      </Card>
      <Card
        containerStyle={{
          width: '90%',
          borderRadius: 16,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="exit-outline" type="ionicon" color={'#f12020ff'} />
            <Text style={{ marginLeft: 6, color: colors.error }}>
              Đăng xuất
            </Text>
          </View>
        </TouchableOpacity>
      </Card>
    </SafeAreaView>
  );
};

export default ProfileScreen;
