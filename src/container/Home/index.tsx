import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTheme, Card, Colors, Avatar, Text, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import Chatbot from '../../components/Chatbot';


const HomeScreen = () => {
  const navigation = useNavigation();
  const colors = useTheme().theme.colors;

  const [listManagement, setListManagement] = useState([
    {
      id: 1,
      name: 'Ngân hàng',
      imgIcon:
        'https://i.pinimg.com/1200x/75/58/7c/75587cbb235ad84fa99b889279a23d30.jpg',
      navigation: 'BankScreen',
    },
    {
      id: 2,
      name: 'Đầu tư',
      imgIcon:
        'https://i.pinimg.com/736x/0a/bc/5d/0abc5da0e945835a96ad38da238a8617.jpg',
      navigation: 'BankScreen',
    },
    {
      id: 3,
      name: 'Tính chi phí',
      imgIcon:
        'https://i.pinimg.com/736x/a2/1d/98/a21d98d2c31b2e13299469e0011a98f5.jpg',
      navigation: 'BankScreen',
    },
  ]);

  const [listContact, setListContact] = useState([
    {
      id: 1,
      name: 'Mạng xã hội',
      imgIcon:
        'https://i.pinimg.com/736x/07/f9/70/07f970236edf44d5b8021a1dbb241982.jpg',
      navigation: 'BankScreen',
    },
    {
      id: 2,
      name: 'GitHub',
      imgIcon:
        'https://i.pinimg.com/736x/cf/5f/7d/cf5f7dca8d30d52a39f4043f3796d7f0.jpg',
      navigation: 'BankScreen',
    },
    {
      id: 3,
      name: 'Email',
      imgIcon:
        'https://i.pinimg.com/736x/71/0b/a5/710ba5f8773d6e2487301210099f4ee6.jpg',
      navigation: 'BankScreen',
    },
    {
      id: 4,
      name: 'Linking',
      imgIcon:
        'https://i.pinimg.com/736x/a9/a6/fe/a9a6fe76b8a2ac0aae7617b729c7d975.jpg',
      navigation: 'BankScreen',
    },
  ]);

  const [listData, setListData] = useState([
    {
      id: 1,
      name: 'ReactJS',
      imgIcon:
        'https://i.pinimg.com/1200x/28/b0/d1/28b0d189571e22609f0e9378da7b09a4.jpg',
    },
    {
      id: 2,
      name: 'Python',
      imgIcon:
        'https://i.pinimg.com/1200x/cd/d5/cf/cdd5cf427e1a17885f3c01d0b5ce60b7.jpg',
    },
    {
      id: 3,
      name: 'Java',
      imgIcon:
        'https://i.pinimg.com/736x/7b/25/56/7b2556503cbd9035d51831afd44bf888.jpg',
    },
    {
      id: 4,
      name: 'Design',
      imgIcon:
        'https://i.pinimg.com/736x/ee/ea/c5/eeeac546cb55a9d9090299a8217c089e.jpg',
    },
  ]);

  const ItemList = (
    item: { id: number; name: string; imgIcon: string; navigation?: string },
    index: number,
  ) => {
    return (
      <TouchableOpacity
        style={{
          width: 80,
          height: 80,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {
          if (item.navigation) {
            navigation.navigate(item.navigation as never);
          }
        }}
      >
        <Avatar
          containerStyle={{
            width: 50,
            height: 50,
          }}
          avatarStyle={{
            borderRadius: 50,
          }}
          source={{
            uri: item.imgIcon,
          }}
        />
        <Text>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 10,
        }}
      >
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
          <Text
            h4
            h4Style={{
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            Nguyễn Đình Hiến
          </Text>
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
            <Icon name="search" type="ionicon" color={'#000000'} />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          marginTop: 10,
          marginHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 12 }}>Chào mừng bạn đến với ứng dụng</Text>
        <Text style={{ fontSize: 12 }}>
          {`Ứng dụng này giúp bạn quản lý thông tin của mình! Hãy bắt đầu sử dụng ngay!`}
        </Text>
      </View>
      <Card
        containerStyle={{
          gap: 5,
          borderRadius: 16,
        }}
      >
        <Text
          style={{
            fontWeight: 'bold',
          }}
        >
          Quản lý chi tiêu
        </Text>
        <FlatList
          data={listManagement}
          numColumns={4}
          collapsable={false}
          renderItem={({ item, index }) => ItemList(item, index)}
        />
      </Card>
      <Card
        containerStyle={{
          gap: 5,
          borderRadius: 16,
        }}
      >
        <Text
          style={{
            fontWeight: 'bold',
          }}
        >
          Thông tin liên lạc
        </Text>
        <FlatList
          data={listContact}
          numColumns={4}
          collapsable={false}
          renderItem={({ item, index }) => ItemList(item, index)}
        />
      </Card>
      <Card
        containerStyle={{
          gap: 5,
          borderRadius: 16,
        }}
      >
        <Text
          style={{
            fontWeight: 'bold',
          }}
        >
          Kỹ năng cá nhân
        </Text>
        <FlatList
          data={listData}
          numColumns={4}
          collapsable={false}
          renderItem={({ item, index }) => ItemList(item, index)}
        />
      </Card>

      <Chatbot />
    </SafeAreaView >
  );
};

export default HomeScreen;
const styles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
