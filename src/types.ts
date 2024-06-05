import { ReactNode } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { SwipeableProps } from 'react-native-gesture-handler';

export interface SwipeableFlatListProps<T> extends FlatListProps<T> {
  renderLeftActions?: (item: T) => ReactNode;
  renderRightActions?: (item: T) => ReactNode;
  swipeableProps?: SwipeableProps;
  enableOpenMultipleRows?: boolean;
}

export interface SwipeableFlatListRef<T> extends FlatList<T> {
  closeAnyOpenRows: () => void;
}

