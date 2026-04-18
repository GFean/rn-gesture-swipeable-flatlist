import { ReactNode } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { SwipeableProps } from 'react-native-gesture-handler';

export type SwipeableActionRenderer<T> = (item: T) => ReactNode;

export interface SwipeableFlatListProps<T> extends FlatListProps<T> {
  renderLeftActions?: SwipeableActionRenderer<T>;
  renderRightActions?: SwipeableActionRenderer<T>;
  swipeableProps?: SwipeableProps;
  enableOpenMultipleRows?: boolean;
}

export interface SwipeableFlatListRef<T> extends FlatList<T> {
  closeAnyOpenRows: () => void;
}
