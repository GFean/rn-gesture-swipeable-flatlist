import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';

import type {
  SwipeableFlatListProps,
  SwipeableFlatListRef,
  SwipeableFlatListSwipeableProps,
} from '../src';
type SwipeableFlatListComponent = typeof import('../src').default;
type ReanimatedSwipeableFlatListComponent = typeof import('../src/reanimated').default;

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<T extends true> = T;

type _EnableOpenMultipleRowsIsOptional = Assert<
  Equal<SwipeableFlatListProps<{ id: string }>['enableOpenMultipleRows'], boolean | undefined>
>;

type _ImplementationPropIsNotPublic = Assert<
  Equal<'swipeableImplementation' extends keyof SwipeableFlatListProps<{ id: string }> ? true : false, false>
>;

type _SwipeablePropsExposeExpandedCompatType = Assert<
  Equal<
    SwipeableFlatListProps<{ id: string }>['swipeableProps'],
    SwipeableFlatListSwipeableProps | undefined
  >
>;

type _ReanimatedComponentPropIsNotPublic = Assert<
  Equal<
    'reanimatedSwipeableComponent' extends keyof SwipeableFlatListProps<{ id: string }> ? true : false,
    false
  >
>;

type _DefaultExportSignature = Assert<
  Equal<
    SwipeableFlatListComponent,
    <T>(
      props: SwipeableFlatListProps<T> & { ref?: React.ForwardedRef<SwipeableFlatListRef<T>> }
    ) => React.ReactElement | null
  >
>;

type _ReanimatedExportSignature = Assert<
  Equal<
    ReanimatedSwipeableFlatListComponent,
    <T>(
      props: SwipeableFlatListProps<T> & { ref?: React.ForwardedRef<SwipeableFlatListRef<T>> }
    ) => React.ReactElement | null
  >
>;

test('public type surface compiles', () => {
  assert.ok(true);
});
