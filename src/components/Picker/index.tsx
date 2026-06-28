import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { BottomSheet, SheetFlatList } from '../../bottom-sheet';
import { Text, TextInputOutlined, Divider } from '../../ui';
import { formatter, validator } from '@mwg-app-sdk/utility';
import type { PickerProps } from '../type';
import Animated, { FadeIn } from 'react-native-reanimated';
import InputButton from '../InputButton';
import { SkeletonView, SkeletonWrapperView } from '../../loading-skeleton';
import { LoadingView, StateView } from '../../wrapper';
import { useTheme } from '@rneui/themed';

const Picker = ({
  data,
  width,
  valueSelected,
  label = 'label',
  value = 'value',
  isRequired,
  height,
  onOpenPicker,
  onClosePicker,
  onChange,
  inputTitle,
  title = '',
  customItem,
  defaultLabel = '',
  isDisabled = false,
  isAllowedSearch = false,
  loadingState,
  searchPlaceholder = 'Nhập từ khóa để tìm kiếm...',
  isEnabledFocusSearch = false,
  onChangeSearchKeyword,
  isFilterEnabled = true,
  isSearchByValue = false,
  onPressTryAgain = () => {},
  errorDescription,
}: PickerProps) => {
  const { colors } = useTheme().theme;
  const styles = createStyles(colors);

  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [keyword, setKeyword] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const isCustom = typeof customItem === 'function';
  const isHasLoadingState = useMemo(
    () => validator.isNonEmptyObject(loadingState),
    [loadingState],
  );

  const onOpenSheet = () => {
    setIsVisible(true);
    onOpenPicker?.();
  };

  const onClose = () => {
    Keyboard.dismiss();
    setKeyword('');
    setTimeout(() => {
      setIsVisible(false);
      onClosePicker?.();
    }, 100);
  };

  const onPressItem = (item: any, isCheck: boolean) => () => {
    Keyboard.dismiss();
    if (!isCheck) {
      onChange(item);

      setTimeout(() => {
        onClose();
      }, 50);

      setKeyword('');
    }
  };

  const onChangeKeyword = (keyword: string) => {
    setKeyword(keyword);
    if (isHasLoadingState) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        onChangeSearchKeyword?.(keyword);
      }, 500);
    } else {
      onChangeSearchKeyword?.(keyword);
    }
  };

  const dataRender = useMemo(() => {
    if (!isFilterEnabled) return data;

    if (validator.isEmptyString(keyword)) return data;

    return data.filter(item => {
      const labelMatch = formatter
        .removeAccent(item[label])
        .toUpperCase()
        .includes(formatter.removeAccent(keyword).toUpperCase());

      if (isSearchByValue) {
        const valueMatch = formatter
          .removeAccent(String(item[value]))
          .toUpperCase()
          .includes(formatter.removeAccent(keyword).toUpperCase());

        return labelMatch || valueMatch;
      }

      return labelMatch;
    });
  }, [data, keyword, label, value, isFilterEnabled, isSearchByValue]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isCheck = item[value] == valueSelected[value];
    return (
      <Animated.View entering={FadeIn.delay(index * 10)}>
        {isCustom ? (
          customItem(item, index, onClose)
        ) : (
          <TouchableOpacity
            style={styles.item}
            onPress={onPressItem(item, isCheck)}
            activeOpacity={0.6}
          >
            <Text
              variant="regularBody1"
              style={{
                color: isCheck ? colors.textBrand : colors.textPrimary,
              }}
              text={item[label]}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderContent = () => {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <SheetFlatList
          data={dataRender}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index}`}
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <StateView state="empty" onPressTryAgain={onPressTryAgain} />
          }
          bounces={false}
          contentContainerStyle={styles.contentContainerStyle}
          ItemSeparatorComponent={() => <Divider />}
        />
      </View>
    );
  };

  const didUpdate = () => {
    if (isVisible && isEnabledFocusSearch) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(didUpdate, [isVisible]);

  return (
    <>
      <InputButton
        placeholder={defaultLabel}
        value={valueSelected[label]}
        isRequired={isRequired}
        label={inputTitle}
        onPress={onOpenSheet}
        isDisabled={isDisabled}
        icon={{
          type: ICON_TYPE.Entypo,
          name: 'chevron-thin-down',
        }}
        style={{ width }}
        errorDescription={errorDescription}
      />
      <BottomSheet
        isVisible={isVisible}
        height={height}
        onClose={onClose}
        title={title}
      >
        <View style={styles.container}>
          {isAllowedSearch && (
            <TextInputOutlined
              inputRef={inputRef}
              value={keyword}
              onChangeText={onChangeKeyword}
              placeholder={searchPlaceholder}
              onClearText={() => onChangeKeyword('')}
              isRenderedInBottomSheet={true}
              leadingIconSource={{
                name: 'magnify',
                type: ICON_TYPE.MaterialCommunityIcons,
              }}
              style={styles.searchInput}
            />
          )}

          {isHasLoadingState ? (
            <LoadingView
              loadingState={loadingState!}
              content={renderContent()}
              onPressTryAgain={onPressTryAgain}
              loadingSkeleton={
                <SkeletonWrapperView>
                  <View style={styles.loadingContainer}>
                    {[...Array(15).keys()].map((_, index: number) => (
                      <SkeletonView key={index} height={40} borderRadius={12} />
                    ))}
                  </View>
                </SkeletonWrapperView>
              }
            />
          ) : (
            renderContent()
          )}
        </View>
      </BottomSheet>
    </>
  );
};

export default Picker;

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 12,
      gap: 8,
    },
    item: {
      paddingVertical: 16,
    },
    contentContainerStyle: {
      paddingVertical: 0,
      paddingHorizontal: 4,
    },
    loadingContainer: {
      paddingHorizontal: 4,
      gap: 10,
    },
    searchInput: {
      backgroundColor: colors.bgNeutralsSecondary,
    },
  });
