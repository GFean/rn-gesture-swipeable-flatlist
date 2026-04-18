import React, {
  ForwardedRef,
  ReactElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';

import { createSwipeableRowsController, SwipeableRowHandle } from './swipeableRowsController';
import {
  SwipeableFlatListProps,
  SwipeableFlatListRef,
  SwipeableRowAdapterComponent,
} from './types';

const getDefaultKey = <T,>(item: T, index: number): string => {
  if (
    item !== null &&
    typeof item === 'object' &&
    'key' in (item as Record<string, unknown>)
  ) {
    const itemKey = (item as { key?: unknown }).key;

    if (typeof itemKey === 'string' || typeof itemKey === 'number') {
      return String(itemKey);
    }
  }

  if (
    item !== null &&
    typeof item === 'object' &&
    'id' in (item as Record<string, unknown>)
  ) {
    const itemId = (item as { id?: unknown }).id;

    if (typeof itemId === 'string' || typeof itemId === 'number') {
      return String(itemId);
    }
  }

  return String(index);
};

type SwipeableFlatListComponent = <T>(
  props: SwipeableFlatListProps<T> & { ref?: ForwardedRef<SwipeableFlatListRef<T>> }
) => ReactElement | null;

export const createSwipeableFlatList = (
  RowAdapter: SwipeableRowAdapterComponent
): SwipeableFlatListComponent => {
  const SwipeableFlatListInner = <T,>(
    {
      data,
      keyExtractor,
      renderItem,
      renderLeftActions,
      renderRightActions,
      swipeableProps,
      enableOpenMultipleRows = true,
      ...rest
    }: SwipeableFlatListProps<T>,
    ref: ForwardedRef<SwipeableFlatListRef<T>>
  ) => {
    const rowsControllerRef = useRef<ReturnType<typeof createSwipeableRowsController> | null>(null);
    const flatListRef = useRef<FlatList<T> | null>(null);
    const rowRefCallbacksRef = useRef(new Map<string, (row: SwipeableRowHandle | null) => void>());

    if (rowsControllerRef.current === null) {
      rowsControllerRef.current = createSwipeableRowsController(enableOpenMultipleRows);
    }

    const rowsController = rowsControllerRef.current;

    useEffect(() => {
      rowsController.setAllowMultipleOpenRows(enableOpenMultipleRows);
    }, [enableOpenMultipleRows, rowsController]);

    const resolveRowKey = useCallback(
      (item: T, index: number) =>
        keyExtractor ? keyExtractor(item, index) : getDefaultKey(item, index),
      [keyExtractor]
    );

    const getRowRefCallback = useCallback((rowKey: string) => {
      const existingCallback = rowRefCallbacksRef.current.get(rowKey);

      if (existingCallback) {
        return existingCallback;
      }

      const callback = (row: SwipeableRowHandle | null) => {
        rowsController.registerRow(rowKey, row);

        if (row === null) {
          rowRefCallbacksRef.current.delete(rowKey);
        }
      };

      rowRefCallbacksRef.current.set(rowKey, callback);

      return callback;
    }, []);

    useImperativeHandle(
      ref,
      () =>
        new Proxy({} as SwipeableFlatListRef<T>, {
          get: (_, prop) => {
            if (prop === 'closeAnyOpenRows') {
              return () => {
                rowsController.closeAnyOpenRows();
              };
            }

            const property = flatListRef.current?.[prop as keyof FlatList<T>];

            if (typeof property === 'function') {
              return property.bind(flatListRef.current);
            }

            return property;
          },
        }),
      []
    );

    const renderSwipeableItem = useCallback(
      ({ item, index, separators }: ListRenderItemInfo<T>) => {
        if (!renderItem) {
          return null;
        }

        const rowKey = resolveRowKey(item, index);

        return (
          <RowAdapter
            item={item}
            onRowClose={() => {
              rowsController.handleClose(rowKey);
            }}
            onRowOpen={(row) => {
              rowsController.handleOpen(rowKey, row);
            }}
            registerRow={getRowRefCallback(rowKey)}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            swipeableProps={swipeableProps}
          >
            {renderItem({ item, index, separators })}
          </RowAdapter>
        );
      },
      [
        getRowRefCallback,
        renderItem,
        renderLeftActions,
        renderRightActions,
        resolveRowKey,
        rowsController,
        swipeableProps,
      ]
    );

    return (
      <FlatList
        {...rest}
        ref={flatListRef}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderSwipeableItem}
      />
    );
  };

  return forwardRef(SwipeableFlatListInner) as SwipeableFlatListComponent;
};
