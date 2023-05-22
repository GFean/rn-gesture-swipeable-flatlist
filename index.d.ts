declare module 'rn-gesture-swipeable-flatlist' {
    import { FlatListProps } from 'react-native';
    import {SwipeableProps} from 'react-native-gesture-handler/lib/typescript/components/Swipeable';

  
    export interface SwipeableFlatListProps<T> extends FlatListProps<T> {
      renderLeftActions?: (item: T) => React.ReactNode;
      renderRightActions?: (item: T) => React.ReactNode;
      swipeableProps?: SwipeableProps;
    }
  
    export default function SwipeableFlatList<T>(
      props: SwipeableFlatListProps<T>,
    ): JSX.Element;
  }
  