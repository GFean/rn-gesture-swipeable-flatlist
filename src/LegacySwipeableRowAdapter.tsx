import React from 'react';
import { Swipeable } from 'react-native-gesture-handler';

import { SwipeableRowAdapterProps } from './types';
import { createDirectActionRenderer } from './swipeableRowAdapterUtils';

export const LegacySwipeableRowAdapter = <T,>({
  children,
  item,
  onRowClose,
  onRowOpen,
  registerRow,
  renderLeftActions,
  renderRightActions,
  swipeableProps,
}: SwipeableRowAdapterProps<T>) => {
  const leftAction = createDirectActionRenderer(renderLeftActions, item);
  const rightAction = createDirectActionRenderer(renderRightActions, item);

  return (
    <Swipeable
      {...swipeableProps}
      ref={registerRow as React.Ref<Swipeable>}
      renderLeftActions={leftAction ?? swipeableProps?.renderLeftActions}
      renderRightActions={rightAction ?? swipeableProps?.renderRightActions}
      onSwipeableClose={(direction, row) => {
        onRowClose();
        swipeableProps?.onSwipeableClose?.(direction, row);
      }}
      onSwipeableOpen={(direction, row) => {
        onRowOpen(row);
        swipeableProps?.onSwipeableOpen?.(direction, row);
      }}
    >
      {children}
    </Swipeable>
  );
};
