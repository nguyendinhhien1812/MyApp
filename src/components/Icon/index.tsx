import React from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Zocial from 'react-native-vector-icons/Zocial';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { ICON_TYPE } from './style';
import * as Iconoir from 'iconoir-react-native';
import type { IconProps } from './type';

const getIconComponent = (type: string) => {
    switch (type) {
        case ICON_TYPE.Entypo:
            return Entypo;
        case ICON_TYPE.EvilIcons:
            return EvilIcons;
        case ICON_TYPE.Feather:
            return Feather;
        case ICON_TYPE.FontAwesome:
            return FontAwesome;
        case ICON_TYPE.Foundation:
            return Foundation;
        case ICON_TYPE.Ionicons:
            return Ionicons;
        case ICON_TYPE.MaterialIcons:
            return MaterialIcons;
        case ICON_TYPE.MaterialCommunityIcons:
            return MaterialCommunityIcons;
        case ICON_TYPE.Octicons:
            return Octicons;
        case ICON_TYPE.Zocial:
            return Zocial;
        case ICON_TYPE.SimpleLineIcons:
            return SimpleLineIcons;
        default:
            return MaterialIcons;
    }
};

const Icon = ({ type, name, color, size }: IconProps) => {
    if (type == ICON_TYPE.Iconoir) {
        const componentName = getComponentName(name);
        //@ts-ignore
        const IconComponent = Iconoir[componentName] ?? Iconoir.QuestionMark;
        return (
            <IconComponent
                color={color}
                height={size}
                width={size}
            />
        );
    }

    const VectorIcon = getIconComponent(type);
    return (
        //@ts-ignore
        <VectorIcon
            name={name}
            color={color}
            size={size}
        />
    );
};

export default Icon;

const getComponentName = (name: string): string =>
(name)
        ? name
              .split('-')
              .map((word: string) => {
                  //@ts-ignore
                  return word[0].toUpperCase() + word.substring(1);
              })
              .join('')
        : '';
