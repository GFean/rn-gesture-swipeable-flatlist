import React, {useCallback} from 'react';
import {FlatList} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {SwipableFlatListProps} from './types';

const SwipableFlatList = <T,>({
   data,
   keyExtractor,
   renderItem,
   renderLeftActions,
   renderRightActions,
   swipableProps,
   ...rest
}: SwipableFlatListProps<T>) => {
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
               {...swipableProps}
               renderRightActions={rightAction}
               renderLeftActions={leftAction}>
               {renderItem({item, index, separators})}
            </Swipeable>
         );
      },
      [renderItem, renderLeftActions, renderRightActions, swipableProps],
   );

   return (
      <FlatList
         {...rest}
         data={data}
         keyExtractor={keyExtractor}
         renderItem={renderSwipeableItem}
      />
   );
};

export default SwipableFlatList;
