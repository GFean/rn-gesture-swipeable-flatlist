import Module from 'node:module';

import React, { useImperativeHandle, useMemo } from 'react';

type LoadFunction = (request: string, parent?: unknown, isMain?: boolean) => unknown;

export const mockEvents = {
  closedRows: [] as string[],
  flatListMethods: [] as string[],
  separatorCalls: [] as string[],
};

export const resetMockEvents = () => {
  mockEvents.closedRows = [];
  mockEvents.flatListMethods = [];
  mockEvents.separatorCalls = [];
  swipeableId = 0;
};

const getDefaultFlatListKey = (item: unknown, index: number): string => {
  if (item !== null && typeof item === 'object') {
    if ('key' in (item as Record<string, unknown>)) {
      const itemKey = (item as { key?: unknown }).key;

      if (typeof itemKey === 'string' || typeof itemKey === 'number') {
        return String(itemKey);
      }
    }

    if ('id' in (item as Record<string, unknown>)) {
      const itemId = (item as { id?: unknown }).id;

      if (typeof itemId === 'string' || typeof itemId === 'number') {
        return String(itemId);
      }
    }
  }

  return String(index);
};

const MockFlatList = React.forwardRef(function MockFlatList(
  props: {
    data?: ArrayLike<unknown> | null;
    keyExtractor?: (item: unknown, index: number) => string;
    renderItem?: (info: {
      index: number;
      item: unknown;
      separators: {
        highlight: () => void;
        unhighlight: () => void;
        updateProps: (select: 'leading' | 'trailing', newProps: unknown) => void;
      };
    }) => React.ReactNode;
  } & Record<string, unknown>,
  ref: React.ForwardedRef<{
    listTag: string;
    scrollToEnd: () => void;
    scrollToOffset: () => void;
  }>
) {
  const { data, keyExtractor, renderItem, ...rest } = props;

  useImperativeHandle(
    ref,
    () => ({
      listTag: 'mock-flatlist',
      scrollToEnd() {
        mockEvents.flatListMethods.push('scrollToEnd');
      },
      scrollToOffset() {
        mockEvents.flatListMethods.push('scrollToOffset');
      },
    }),
    []
  );

  const items = Array.from(data ?? []).map((item, index) => {
    const rowKey = keyExtractor ? keyExtractor(item, index) : getDefaultFlatListKey(item, index);
    const separators = {
      highlight: () => {
        mockEvents.separatorCalls.push(`highlight:${rowKey}`);
      },
      unhighlight: () => {
        mockEvents.separatorCalls.push(`unhighlight:${rowKey}`);
      },
      updateProps: (select: 'leading' | 'trailing', newProps: unknown) => {
        mockEvents.separatorCalls.push(`update:${rowKey}:${select}:${JSON.stringify(newProps)}`);
      },
    };

    return React.createElement(
      React.Fragment,
      { key: rowKey },
      renderItem?.({ item, index, separators }) ?? null
    );
  });

  return React.createElement('MockFlatList', rest, items);
});

let swipeableId = 0;

const MockSwipeable = React.forwardRef(function MockSwipeable(
  props: Record<string, unknown> & { children?: React.ReactNode },
  ref: React.ForwardedRef<{ close: () => void; openLeft: () => void; openRight: () => void; reset: () => void }>
) {
  const { children, ...rest } = props;
  const handle = useMemo(() => {
    const rowId = `row-${swipeableId}`;

    swipeableId += 1;

    return {
      close() {
        mockEvents.closedRows.push(rowId);
      },
      openLeft() {},
      openRight() {},
      reset() {},
    };
  }, []);

  useImperativeHandle(ref, () => handle, [handle]);

  return React.createElement('MockSwipeable', { ...rest, swipeableHandle: handle }, children);
});

export const mockReactNativeModule = {
  FlatList: MockFlatList,
};

export const mockGestureHandlerModule = {
  Swipeable: MockSwipeable,
};

export const withMockedModules = <T,>(loadModule: () => T): T => {
  const nodeModule = Module as typeof Module & { _load: LoadFunction };
  const originalLoad = nodeModule._load;

  nodeModule._load = ((request: string, parent?: unknown, isMain?: boolean) => {
    if (request === 'react-native') {
      return mockReactNativeModule;
    }

    if (request === 'react-native-gesture-handler') {
      return mockGestureHandlerModule;
    }

    return originalLoad.call(nodeModule, request, parent, isMain);
  }) as LoadFunction;

  try {
    return loadModule();
  } finally {
    nodeModule._load = originalLoad;
  }
};
