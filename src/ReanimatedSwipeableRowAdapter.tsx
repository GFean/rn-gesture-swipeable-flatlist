import React from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { SwipeableRowHandle } from './swipeableRowsController';
import { SwipeableRowAdapterProps } from './types';
import { createDirectActionRenderer } from './swipeableRowAdapterUtils';

export const ReanimatedSwipeableRowAdapter = <T,>({
  children,
  item,
  onRowClose,
  onRowOpen,
  registerRow,
  renderLeftActions,
  renderRightActions,
  swipeableProps,
}: SwipeableRowAdapterProps<T>) => {
  const {
    onSwipeableClose,
    onSwipeableLeftOpen,
    onSwipeableLeftWillOpen,
    onSwipeableOpen,
    onSwipeableRightOpen,
    onSwipeableRightWillOpen,
    onSwipeableWillOpen,
    renderLeftActions: swipeablePropsLeftActions,
    renderRightActions: swipeablePropsRightActions,
    useNativeAnimations: _useNativeAnimations,
    ...reanimatedCompatibleProps
  } = swipeableProps ?? {};

  const leftAction = createDirectActionRenderer(renderLeftActions, item);
  const rightAction = createDirectActionRenderer(renderRightActions, item);

  return (
    <ReanimatedSwipeable
      {...reanimatedCompatibleProps}
      ref={registerRow as React.Ref<SwipeableRowHandle>}
      renderLeftActions={leftAction ?? swipeablePropsLeftActions}
      renderRightActions={rightAction ?? swipeablePropsRightActions}
      onSwipeableClose={(direction: 'left' | 'right', row: SwipeableRowHandle) => {
        onRowClose();
        onSwipeableClose?.(direction, row as unknown as Swipeable);
      }}
      onSwipeableOpen={(direction: 'left' | 'right', row: SwipeableRowHandle) => {
        onRowOpen(row);

        if (direction === 'left') {
          onSwipeableLeftOpen?.();
        } else {
          onSwipeableRightOpen?.();
        }

        onSwipeableOpen?.(direction, row as unknown as Swipeable);
      }}
      onSwipeableWillOpen={(direction: 'left' | 'right') => {
        if (direction === 'left') {
          onSwipeableLeftWillOpen?.();
        } else {
          onSwipeableRightWillOpen?.();
        }

        onSwipeableWillOpen?.(direction);
      }}
    >
      {children}
    </ReanimatedSwipeable>
  );
};
