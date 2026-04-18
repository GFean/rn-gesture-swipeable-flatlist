import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import {
  mockEvents,
  resetMockEvents,
  withMockedModules,
} from './mockModules';

import type { SwipeableFlatListProps, SwipeableFlatListRef } from '../src';

type SwipeableFlatListModule = typeof import('../src/index');
type ReanimatedSwipeableFlatListModule = typeof import('../src/reanimated');
type RowItem = { id: string };
type KeyedRowItem = { id: string; key: string };
type TypedSwipeableFlatList = (
  props: SwipeableFlatListProps<RowItem> & { ref?: React.Ref<SwipeableFlatListRef<RowItem>> }
) => React.ReactElement | null;

const clearPackageCache = () => {
  [
    '../src/index',
    '../src/reanimated',
    '../src/SwipeableFlatList',
    '../src/ReanimatedSwipeableFlatList',
    '../src/createSwipeableFlatList',
    '../src/LegacySwipeableRowAdapter',
    '../src/ReanimatedSwipeableRowAdapter',
    '../src/swipeableRowAdapterUtils',
  ].forEach((modulePath) => {
    try {
      delete require.cache[require.resolve(modulePath)];
    } catch {}
  });
};

const withCapturedConsoleWarn = <T,>(callback: (warnings: string[]) => T): T => {
  const originalConsoleWarn = console.warn;
  const warnings: string[] = [];
  console.warn = (message?: unknown) => {
    warnings.push(String(message));
  };

  try {
    return callback(warnings);
  } finally {
    console.warn = originalConsoleWarn;
  }
};

const loadSwipeableFlatList = () =>
  withMockedModules(() => {
    clearPackageCache();

    return require('../src/index').default;
  }) as TypedSwipeableFlatList;

const loadPackageExports = () =>
  withMockedModules(() => {
    clearPackageCache();

    return require('../src/index');
  }) as SwipeableFlatListModule;

const loadReanimatedSwipeableFlatList = () =>
  withMockedModules(() => {
    clearPackageCache();

    return require('../src/reanimated').default;
  }) as TypedSwipeableFlatList;

const loadReanimatedPackageExports = () =>
  withMockedModules(() => {
    clearPackageCache();

    return require('../src/reanimated');
  }) as ReanimatedSwipeableFlatListModule;

const SwipeableFlatList = loadSwipeableFlatList();

const hasHostType =
  (expectedType: string) =>
  (node: TestRenderer.ReactTestInstance): boolean =>
    node.type === expectedType;

test('package index exports the expected public API', () => {
  const packageExports = loadPackageExports();

  assert.equal(typeof packageExports.default, 'object');
});

test('package reanimated entrypoint exports the expected public API', () => {
  const packageExports = loadReanimatedPackageExports();

  assert.equal(typeof packageExports.default, 'object');
});

test('SwipeableFlatList forwards working separators to renderItem', () => {
  resetMockEvents();

  act(() => {
    TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        data: [{ id: 'first' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ separators }: Parameters<NonNullable<SwipeableFlatListProps<RowItem>['renderItem']>>[0]) => {
          separators.highlight();
          separators.unhighlight();
          separators.updateProps('leading', { active: true });

          return React.createElement('RowHost');
        },
      })
    );
  });

  assert.deepEqual(mockEvents.separatorCalls, [
    'highlight:first',
    'unhighlight:first',
    'update:first:leading:{"active":true}',
  ]);
});

test('SwipeableFlatList ref exposes closeAnyOpenRows and FlatList methods', () => {
  resetMockEvents();

  const listRef = React.createRef<SwipeableFlatListRef<RowItem>>();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        ref: listRef,
        data: [{ id: 'first' }, { id: 'second' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  const swipeables = renderer!.root.findAll(hasHostType('MockSwipeable'));

  act(() => {
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
    swipeables[1].props.onSwipeableOpen('left', swipeables[1].props.swipeableHandle);
    listRef.current?.scrollToEnd();
    listRef.current?.closeAnyOpenRows();
  });

  assert.equal((listRef.current as SwipeableFlatListRef<RowItem> & { listTag?: string } | null)?.listTag, 'mock-flatlist');
  assert.deepEqual(mockEvents.flatListMethods, ['scrollToEnd']);
  assert.deepEqual(mockEvents.closedRows, ['row-0', 'row-1']);
});

test('SwipeableFlatList closes the previous row when only one row can stay open', () => {
  resetMockEvents();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        data: [{ id: 'first' }, { id: 'second' }],
        enableOpenMultipleRows: false,
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  const swipeables = renderer!.root.findAll(hasHostType('MockSwipeable'));

  act(() => {
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
    swipeables[1].props.onSwipeableOpen('right', swipeables[1].props.swipeableHandle);
  });

  assert.deepEqual(mockEvents.closedRows, ['row-0']);
});

test('SwipeableFlatList updates row bookkeeping when a swipeable closes', () => {
  resetMockEvents();

  const listRef = React.createRef<SwipeableFlatListRef<RowItem>>();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        ref: listRef,
        data: [{ id: 'first' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  const swipeable = renderer!.root.find(hasHostType('MockSwipeable'));

  act(() => {
    swipeable.props.onSwipeableOpen('right', swipeable.props.swipeableHandle);
    swipeable.props.onSwipeableClose('right', swipeable.props.swipeableHandle);
    listRef.current?.closeAnyOpenRows();
  });

  assert.deepEqual(mockEvents.closedRows, []);
});

test('SwipeableFlatList closes open rows when multiple mode is disabled at runtime', () => {
  resetMockEvents();

  const data = [{ id: 'first' }, { id: 'second' }];

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        data,
        enableOpenMultipleRows: true,
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  const getSwipeables = () => renderer!.root.findAll(hasHostType('MockSwipeable'));

  act(() => {
    const swipeables = getSwipeables();
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
    swipeables[1].props.onSwipeableOpen('left', swipeables[1].props.swipeableHandle);
  });

  act(() => {
    renderer!.update(
      React.createElement(SwipeableFlatList, {
        data,
        enableOpenMultipleRows: false,
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  assert.deepEqual(mockEvents.closedRows, ['row-0', 'row-1']);
});

test('SwipeableFlatList closes existing single-open rows across false -> true -> false mode changes', () => {
  resetMockEvents();

  const data = [{ id: 'first' }, { id: 'second' }];

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        data,
        enableOpenMultipleRows: false,
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  const getSwipeables = () => renderer!.root.findAll(hasHostType('MockSwipeable'));

  act(() => {
    const swipeables = getSwipeables();
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
  });

  act(() => {
    renderer!.update(
      React.createElement(SwipeableFlatList, {
        data,
        enableOpenMultipleRows: true,
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  act(() => {
    const swipeables = getSwipeables();
    swipeables[1].props.onSwipeableOpen('left', swipeables[1].props.swipeableHandle);
  });

  act(() => {
    renderer!.update(
      React.createElement(SwipeableFlatList, {
        data,
        enableOpenMultipleRows: false,
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  assert.deepEqual(mockEvents.closedRows, ['row-0', 'row-1']);
});

test('SwipeableFlatList clears removed rows from controller state', () => {
  resetMockEvents();

  const listRef = React.createRef<SwipeableFlatListRef<RowItem>>();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        ref: listRef,
        data: [{ id: 'first' }, { id: 'second' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  act(() => {
    const swipeables = renderer!.root.findAll(hasHostType('MockSwipeable'));
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
  });

  act(() => {
    renderer!.update(
      React.createElement(SwipeableFlatList, {
        ref: listRef,
        data: [{ id: 'second' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  act(() => {
    listRef.current?.closeAnyOpenRows();
  });

  assert.deepEqual(mockEvents.closedRows, []);
});

test('SwipeableFlatList preserves open-row bookkeeping across rerenders', () => {
  resetMockEvents();

  const listRef = React.createRef<SwipeableFlatListRef<RowItem>>();

  let renderer: TestRenderer.ReactTestRenderer;

  const renderList = (headerTitle: string) =>
    React.createElement(SwipeableFlatList, {
      ref: listRef,
      data: [{ id: 'first' }],
      keyExtractor: (item: RowItem) => item.id,
      ListHeaderComponent: React.createElement('HeaderHost', { title: headerTitle }),
      renderItem: ({ item }: { item: RowItem }) =>
        React.createElement('RowHost', { rowId: item.id }),
    });

  act(() => {
    renderer = TestRenderer.create(renderList('before'));
  });

  act(() => {
    const swipeable = renderer!.root.find(hasHostType('MockSwipeable'));
    swipeable.props.onSwipeableOpen('right', swipeable.props.swipeableHandle);
  });

  act(() => {
    renderer!.update(renderList('after'));
    listRef.current?.closeAnyOpenRows();
  });

  assert.deepEqual(mockEvents.closedRows, ['row-0']);
});

test('SwipeableFlatList keeps row ownership stable across custom keyExtractor reorders', () => {
  resetMockEvents();

  const renderList = (data: RowItem[]) =>
    React.createElement(SwipeableFlatList, {
      data,
      enableOpenMultipleRows: false,
      keyExtractor: (item: RowItem) => item.id,
      renderItem: ({ item }: { item: RowItem }) =>
        React.createElement('RowHost', { rowId: item.id }),
    });

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(renderList([{ id: 'first' }, { id: 'second' }]));
  });

  act(() => {
    const swipeables = renderer!.root.findAll(hasHostType('MockSwipeable'));
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
  });

  act(() => {
    renderer!.update(renderList([{ id: 'second' }, { id: 'first' }]));
  });

  act(() => {
    const swipeables = renderer!.root.findAll(hasHostType('MockSwipeable'));
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
  });

  assert.deepEqual(mockEvents.closedRows, ['row-0']);
});

test('SwipeableFlatList uses item.id as the default row key when keyExtractor is omitted', () => {
  resetMockEvents();

  const renderList = (data: RowItem[]) =>
    React.createElement(SwipeableFlatList, {
      data,
      enableOpenMultipleRows: false,
      renderItem: ({ item }: { item: RowItem }) =>
        React.createElement('RowHost', { rowId: item.id }),
    });

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(renderList([{ id: 'first' }, { id: 'second' }]));
  });

  act(() => {
    const swipeables = renderer!.root.findAll(hasHostType('MockSwipeable'));
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
  });

  act(() => {
    renderer!.update(renderList([{ id: 'second' }, { id: 'first' }]));
  });

  act(() => {
    const swipeables = renderer!.root.findAll(hasHostType('MockSwipeable'));
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
  });

  assert.deepEqual(mockEvents.closedRows, ['row-0']);
});

test('SwipeableFlatList uses item.key before item.id when no keyExtractor is provided', () => {
  resetMockEvents();

  const KeyedSwipeableFlatList = SwipeableFlatList as unknown as (
    props: SwipeableFlatListProps<KeyedRowItem>
  ) => React.ReactElement | null;

  act(() => {
    TestRenderer.create(
      React.createElement(KeyedSwipeableFlatList, {
        data: [{ id: 'first-id', key: 'first-key' }],
        renderItem: ({
          separators,
        }: Parameters<NonNullable<SwipeableFlatListProps<KeyedRowItem>['renderItem']>>[0]) => {
          separators.highlight();
          return React.createElement('RowHost');
        },
      })
    );
  });

  assert.deepEqual(mockEvents.separatorCalls, ['highlight:first-key']);
});

test('SwipeableFlatList passes direct action renderers and swipe callbacks through to Swipeable', () => {
  resetMockEvents();

  const swipeEvents: string[] = [];
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        data: [{ id: 'first' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
        renderLeftActions: (item: RowItem) => React.createElement('LeftAction', { rowId: item.id }),
        renderRightActions: (item: RowItem) => React.createElement('RightAction', { rowId: item.id }),
        swipeableProps: {
          onSwipeableClose: (direction) => {
            swipeEvents.push(`close:${direction}`);
          },
          onSwipeableOpen: (direction) => {
            swipeEvents.push(`open:${direction}`);
          },
        },
      })
    );
  });

  const swipeable = renderer!.root.find(hasHostType('MockSwipeable'));

  assert.equal(swipeable.props.renderLeftActions().props.rowId, 'first');
  assert.equal(swipeable.props.renderRightActions().props.rowId, 'first');

  act(() => {
    swipeable.props.onSwipeableOpen('right', swipeable.props.swipeableHandle);
    swipeable.props.onSwipeableClose('left', swipeable.props.swipeableHandle);
  });

  assert.deepEqual(swipeEvents, ['open:right', 'close:left']);
});

test('SwipeableFlatList direct action props override swipeableProps action renderers', () => {
  resetMockEvents();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        data: [{ id: 'first' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
        renderLeftActions: (item: RowItem) => React.createElement('LeftAction', { source: `direct:${item.id}` }),
        renderRightActions: (item: RowItem) =>
          React.createElement('RightAction', { source: `direct:${item.id}` }),
        swipeableProps: {
          renderLeftActions: () => React.createElement('LeftAction', { source: 'swipeableProps' }),
          renderRightActions: () => React.createElement('RightAction', { source: 'swipeableProps' }),
        },
      })
    );
  });

  const swipeable = renderer!.root.find(hasHostType('MockSwipeable'));

  assert.equal(swipeable.props.renderLeftActions().props.source, 'direct:first');
  assert.equal(swipeable.props.renderRightActions().props.source, 'direct:first');
});

test('reanimated entrypoint renders ReanimatedSwipeable rows and keeps the ref API intact', () => {
  resetMockEvents();

  const listRef = React.createRef<SwipeableFlatListRef<RowItem>>();
  const ReanimatedSwipeableFlatList = loadReanimatedSwipeableFlatList();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(ReanimatedSwipeableFlatList, {
        ref: listRef,
        data: [{ id: 'first' }, { id: 'second' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
      })
    );
  });

  const swipeables = renderer!.root.findAll(hasHostType('MockReanimatedSwipeable'));

  act(() => {
    swipeables[0].props.onSwipeableOpen('right', swipeables[0].props.swipeableHandle);
    swipeables[1].props.onSwipeableOpen('left', swipeables[1].props.swipeableHandle);
    listRef.current?.closeAnyOpenRows();
  });

  assert.equal(swipeables.length, 2);
  assert.deepEqual(mockEvents.closedRows, ['row-0', 'row-1']);
});

test('reanimated entrypoint adapts legacy swipeable callbacks', () => {
  resetMockEvents();

  const events: string[] = [];
  const ReanimatedSwipeableFlatList = loadReanimatedSwipeableFlatList();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(ReanimatedSwipeableFlatList, {
        data: [{ id: 'first' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
        renderLeftActions: (item: RowItem) => React.createElement('LeftAction', { source: `direct:${item.id}` }),
        swipeableProps: {
          onSwipeableLeftOpen: () => {
            events.push('left-open');
          },
          onSwipeableLeftWillOpen: () => {
            events.push('left-will-open');
          },
          onSwipeableOpen: (direction) => {
            events.push(`open:${direction}`);
          },
          renderLeftActions: () => React.createElement('LeftAction', { source: 'swipeableProps' }),
          useNativeAnimations: false,
        },
      })
    );
  });

  const swipeable = renderer!.root.find(hasHostType('MockReanimatedSwipeable'));

  assert.equal(swipeable.props.renderLeftActions().props.source, 'direct:first');

  act(() => {
    swipeable.props.onSwipeableWillOpen('left');
    swipeable.props.onSwipeableOpen('left', swipeable.props.swipeableHandle);
  });

  assert.deepEqual(events, ['left-will-open', 'left-open', 'open:left']);
});

test('reanimated entrypoint falls back to swipeableProps actions and forwards close/right callbacks', () => {
  resetMockEvents();

  const events: string[] = [];
  const ReanimatedSwipeableFlatList = loadReanimatedSwipeableFlatList();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(ReanimatedSwipeableFlatList, {
        data: [{ id: 'first' }],
        keyExtractor: (item: RowItem) => item.id,
        renderItem: ({ item }: { item: RowItem }) =>
          React.createElement('RowHost', { rowId: item.id }),
        swipeableProps: {
          onSwipeableClose: (direction) => {
            events.push(`close:${direction}`);
          },
          onSwipeableRightOpen: () => {
            events.push('right-open');
          },
          onSwipeableRightWillOpen: () => {
            events.push('right-will-open');
          },
          onSwipeableOpen: (direction) => {
            events.push(`open:${direction}`);
          },
          renderRightActions: () => React.createElement('RightAction', { source: 'swipeableProps' }),
        },
      })
    );
  });

  const swipeable = renderer!.root.find(hasHostType('MockReanimatedSwipeable'));

  assert.equal(swipeable.props.renderRightActions().props.source, 'swipeableProps');

  act(() => {
    swipeable.props.onSwipeableWillOpen('right');
    swipeable.props.onSwipeableOpen('right', swipeable.props.swipeableHandle);
    swipeable.props.onSwipeableClose('right', swipeable.props.swipeableHandle);
  });

  assert.deepEqual(events, ['right-will-open', 'right-open', 'open:right', 'close:right']);
});

test('legacy entrypoint does not warn or render reanimated rows when ReanimatedSwipeable is unavailable', () => {
  resetMockEvents();

  let renderer: TestRenderer.ReactTestRenderer;

  withCapturedConsoleWarn((warnings) => {
    act(() => {
      renderer = TestRenderer.create(
        React.createElement(SwipeableFlatList, {
          data: [{ id: 'first' }, { id: 'second' }],
          keyExtractor: (item: RowItem) => item.id,
          renderItem: ({ item }: { item: RowItem }) =>
            React.createElement('RowHost', { rowId: item.id }),
        })
      );
    });

    const legacySwipeables = renderer!.root.findAll(hasHostType('MockSwipeable'));
    const reanimatedSwipeables = renderer!.root.findAll(hasHostType('MockReanimatedSwipeable'));

    assert.equal(legacySwipeables.length, 2);
    assert.equal(reanimatedSwipeables.length, 0);
    assert.deepEqual(warnings, []);
  });
});

test('SwipeableFlatList returns null rows when renderItem is omitted', () => {
  resetMockEvents();

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(SwipeableFlatList, {
        data: [{ id: 'first' }],
      } as unknown as SwipeableFlatListProps<RowItem>)
    );
  });

  assert.equal(renderer!.root.findAll(hasHostType('MockSwipeable')).length, 0);
});
