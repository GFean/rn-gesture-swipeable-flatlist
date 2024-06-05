import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
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
   const flatListRef = useRef<FlatList>(null);

   useImperativeHandle(ref, () => new Proxy({} as FlatList<any>, {
      get: (_, prop) => {
        if (prop === 'closeAnyOpenRows') {
          return () => {
            // Close all open swipeables if multiple rows are enabled
            if (enableOpenMultipleRows) {
              swipeableRefs.current.forEach(swipeable => {
                if (swipeable) swipeable.close();
              });
            } else {
              // Close the currently open swipeable row
              const currentIndex = swipeableRefs.current.findIndex(swipeable => swipeable === swipeableRefs.current[openedRowIndex.current as number]);
              if (currentIndex !== -1) {
                swipeableRefs.current[currentIndex]?.close();
                openedRowIndex.current = null; // Reset the index after closing
              }
            }
          };
        }
        // Safely delegate other property accesses to the FlatList ref
        const property = flatListRef.current?.[prop as keyof FlatList<any>];
        if (typeof property === 'function') {
          return property.bind(flatListRef.current);
        }
        return property;
      }
   }), [enableOpenMultipleRows]);
 

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
            ref={flatListRef}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderSwipeableItem}
         />
   );
});

export default SwipeableFlatList;



