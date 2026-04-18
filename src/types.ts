import { ReactElement, ReactNode } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { SwipeableProps } from 'react-native-gesture-handler';

import { SwipeableRowHandle } from './swipeableRowsController';

export type SwipeableActionRenderer<T> = (item: T) => ReactNode;
export type SwipeableActionsRenderer = (...args: unknown[]) => ReactNode;
export type SwipeableFlatListSwipeableProps = Omit<
  SwipeableProps,
  'renderLeftActions' | 'renderRightActions'
> & {
  renderLeftActions?: SwipeableActionsRenderer;
  renderRightActions?: SwipeableActionsRenderer;
} & Record<string, unknown>;

export interface SwipeableFlatListProps<T> extends FlatListProps<T> {
  renderLeftActions?: SwipeableActionRenderer<T>;
  renderRightActions?: SwipeableActionRenderer<T>;
  swipeableProps?: SwipeableFlatListSwipeableProps;
  enableOpenMultipleRows?: boolean;
}

export interface SwipeableFlatListRef<T> extends FlatList<T> {
  closeAnyOpenRows: () => void;
}

export interface SwipeableRowAdapterProps<T> {
  children: ReactNode;
  item: T;
  onRowClose: () => void;
  onRowOpen: (row: SwipeableRowHandle) => void;
  registerRow: (row: SwipeableRowHandle | null) => void;
  renderLeftActions?: SwipeableActionRenderer<T>;
  renderRightActions?: SwipeableActionRenderer<T>;
  swipeableProps?: SwipeableFlatListSwipeableProps;
}

export type SwipeableRowAdapterComponent = <T>(
  props: SwipeableRowAdapterProps<T>
) => ReactElement | null;
