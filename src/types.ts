import {ReactNode} from 'react';
import {FlatListProps} from 'react-native';
import {SwipeableProps} from 'react-native-gesture-handler/lib/typescript/components/Swipeable';

export interface SwipableFlatListProps<T> extends FlatListProps<T> {
   renderLeftActions?: (item: T) => ReactNode;
   renderRightActions?: (item: T) => ReactNode;
   swipableProps?: SwipeableProps;
}
