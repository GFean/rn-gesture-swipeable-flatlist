declare module 'react-native-swipable-flatlist' {
    import { FlatListProps } from 'react-native';
    import {SwipeableProps} from 'react-native-gesture-handler/lib/typescript/components/Swipeable';

  
    export interface SwipableFlatListProps<T> extends FlatListProps<T> {
      renderLeftActions?: (item: T) => React.ReactNode;
      renderRightActions?: (item: T) => React.ReactNode;
      swipableProps?: SwipeableProps;
    }
  
    export default function SwipableFlatList<T>(
      props: SwipableFlatListProps<T>,
    ): JSX.Element;
  }
  