import React, {useCallback} from 'react';
import {FlatList} from 'react-native';
import {GestureHandlerRootView, Swipeable} from 'react-native-gesture-handler';
import {SwipeableFlatListProps} from './types';

const SwipeableFlatList = <T,>({
   data,
   keyExtractor,
   renderItem,
   renderLeftActions,
   renderRightActions,
   swipeableProps,
   ...rest
}: SwipeableFlatListProps<T>) => {
   const renderSwipeableItem = useCallback(
      ({item, index}: {item: T; index: number}) => {
         const leftAction = renderLeftActions
            ? () => renderLeftActions(item)
            : undefined;
         const rightAction = renderRightActions
            ? () => renderRightActions(item)
            : undefined;

         const separators = {
            highlight: () => {},
            unhighlight: () => {},
            updateProps: () => {},
         };

         if (!renderItem) {
            return null;
         }

         return (
            <Swipeable
               {...swipeableProps}
               renderRightActions={rightAction}
               renderLeftActions={leftAction}>
               {renderItem({item, index, separators})}
            </Swipeable>
         );
      },
      [renderItem, renderLeftActions, renderRightActions, swipeableProps],
   );

   return (
   <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
         {...rest}
         data={data}
         keyExtractor={keyExtractor}
         renderItem={renderSwipeableItem}
      />
      </GestureHandlerRootView>
   );
};

export default SwipeableFlatList;
