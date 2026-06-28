import { Button, Icon, Text, useTheme } from '@rneui/themed';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';

const NotificationScreen = () => {
  const colors = useTheme().theme.colors;

  const [selectedFilter, setSelectedFilter] = useState<number | null>(1);

  const dataView = [
    { id: 1, name: 'Tất cả', filterKey: 'all' },
    { id: 2, name: 'Đã xem', filterKey: 'read' },
    { id: 3, name: 'Chưa xem', filterKey: 'unread' },
  ];

  const [notification] = useState([
    {
      id: 1,
      title: 'Thông báo 1',
      content: 'Nội dung thông báo 1',
      isRead: true,
    },
    {
      id: 2,
      title: 'Thông báo 2',
      content: 'Nội dung thông báo 2',
      isRead: false,
    },
    {
      id: 3,
      title: 'Thông báo 3',
      content: 'Nội dung thông báo 3',
      isRead: false,
    },
    {
      id: 4,
      title: 'Thông báo 4',
      content: 'Nội dung thông báo 4',
      isRead: false,
    },
    {
      id: 5,
      title: 'Thông báo 5',
      content: 'Nội dung thông báo 5',
      isRead: true,
    },
    {
      id: 6,
      title: 'Thông báo 6',
      content: 'Nội dung thông báo 6',
      isRead: true,
    },
  ]);

  // Lọc dữ liệu theo filter
  const filteredNotifications = notification.filter(item => {
    if (selectedFilter === 2) return item.isRead;
    if (selectedFilter === 3) return !item.isRead;
    return true;
  });

  const renderItem = ({ item }: { item: (typeof notification)[0] }) => (
    <View
      style={{
        gap: 5,
        margin: 12,
        borderRadius: 12,
        borderBottomColor: '#c4c4c4ff',
        borderBottomWidth: 1,
        padding: 5,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
        {item.isRead && (
          <Icon
            name="ellipse-sharp"
            type="ionicon"
            color={colors.primary}
            size={10}
          />
        )}
      </View>
      <Text>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Thông báo</Text>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <Icon
            name="checkmark-done"
            type="ionicon"
            color={colors.black}
            size={24}
          />
          <Icon
            name="settings-outline"
            type="ionicon"
            color={colors.black}
            size={24}
          />
        </View>
      </View>

      {/* Filter buttons */}
      <View
        style={{
          marginTop: 8,
          marginHorizontal: 10,
          flexDirection: 'row',
          gap: 5,
        }}
      >
        {dataView.map(item => (
          <Button
            key={item.id}
            onPress={() => setSelectedFilter(item.id)}
            buttonStyle={{
              height: 30,
              borderRadius: 8,
              backgroundColor:
                selectedFilter === item.id ? colors.primary : colors.surfaceVariant,
            }}
            titleStyle={{
              fontSize: 12,
              color:
                selectedFilter === item.id ? colors.background : colors.outline,
            }}
          >
            {item.name}
          </Button>
        ))}
      </View>
      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;
