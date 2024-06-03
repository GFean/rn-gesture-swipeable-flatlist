import React, { forwardRef, useCallback, useRef } from 'react';
import { FlatList } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SwipeableFlatListProps,  } from './types';

const SwipeableFlatList = forwardRef<FlatList<any>, SwipeableFlatListProps<any>>(({
   data,
   keyExtractor,
   renderItem,
   renderLeftActions,
   renderRightActions,
   swipeableProps,
   enableOpenMultipleRows = true,
   ...rest
}: SwipeableFlatListProps<any>, ref) => {

   const openedRowIndex = useRef<number | null>(null);
   const swipeableRefs = useRef<(Swipeable | null)[]>([]);
 

   const onSwipeableOpen = useCallback((directions: "left" | "right", swipeable: Swipeable, index: number) => {
      if (!enableOpenMultipleRows) {
         if (typeof openedRowIndex.current === 'number') {
            const previousSwipeable = swipeableRefs.current[openedRowIndex.current];
            if (previousSwipeable && previousSwipeable !== swipeable) {
               previousSwipeable.close();
            }
         }
         openedRowIndex.current = index;
      }
      swipeableProps?.onSwipeableOpen?.(directions, swipeable);
   }, [enableOpenMultipleRows, swipeableProps]);

   const renderSwipeableItem = useCallback(({ item, index }: { item: any; index: number }) => {
      const leftAction = renderLeftActions ? () => renderLeftActions(item) : undefined;
      const rightAction = renderRightActions ? () => renderRightActions(item) : undefined;

      if (!renderItem) {
         return null;
      }

      const separators = {
         highlight: () => {},
         unhighlight: () => {},
         updateProps: (select: "leading" | "trailing", newProps: any) => {}
      };

      return (
         <Swipeable
            {...swipeableProps}
            ref={(ref) => {
               swipeableRefs.current[index] = ref;
            }}
            renderRightActions={rightAction}
            renderLeftActions={leftAction}
            onSwipeableOpen={(directions, swipeable) => onSwipeableOpen(directions, swipeable, index)}
         >
            {renderItem({ item, index, separators })}
         </Swipeable>
      );
   }, [renderItem, renderLeftActions, renderRightActions, swipeableProps, onSwipeableOpen]);

   return (
         <FlatList
            {...rest}
            ref={ref}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderSwipeableItem}
         />
   );
});

export default SwipeableFlatList;



