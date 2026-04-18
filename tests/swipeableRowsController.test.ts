import assert from 'node:assert/strict';
import test from 'node:test';

import { createSwipeableRowsController, SwipeableRowHandle } from '../src/swipeableRowsController';

const createRowHandle = (rowKey: string, events: string[]): SwipeableRowHandle => ({
  close() {
    events.push(`close:${rowKey}`);
  },
  openLeft() {},
  openRight() {},
  reset() {},
});

test('controller closes the previously open row when multiple rows are disabled', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(false);
  const firstRow = createRowHandle('first', events);
  const secondRow = createRowHandle('second', events);

  controller.registerRow('first', firstRow);
  controller.registerRow('second', secondRow);

  controller.handleOpen('first', firstRow);
  controller.handleOpen('second', secondRow);

  assert.deepEqual(events, ['close:first']);
});

test('controller closes every open row when multiple rows are enabled', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(true);
  const firstRow = createRowHandle('first', events);
  const secondRow = createRowHandle('second', events);

  controller.registerRow('first', firstRow);
  controller.registerRow('second', secondRow);

  controller.handleOpen('first', firstRow);
  controller.handleOpen('second', secondRow);
  controller.closeAnyOpenRows();

  assert.deepEqual(events, ['close:first', 'close:second']);
});

test('controller unregisters stale rows by key', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(true);
  const row = createRowHandle('tracked', events);

  controller.registerRow('tracked', row);
  controller.handleOpen('tracked', row);
  controller.registerRow('tracked', null);
  controller.closeAnyOpenRows();

  assert.deepEqual(events, []);
});

test('controller clears closed rows from its open state', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(true);
  const row = createRowHandle('tracked', events);

  controller.registerRow('tracked', row);
  controller.handleOpen('tracked', row);
  controller.handleClose('tracked');
  controller.closeAnyOpenRows();

  assert.deepEqual(events, []);
});

test('controller closes open rows when switching from multiple to single mode', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(true);
  const firstRow = createRowHandle('first', events);
  const secondRow = createRowHandle('second', events);

  controller.registerRow('first', firstRow);
  controller.registerRow('second', secondRow);

  controller.handleOpen('first', firstRow);
  controller.handleOpen('second', secondRow);
  controller.setAllowMultipleOpenRows(false);

  assert.deepEqual(events, ['close:first', 'close:second']);
});

test('controller keeps single-open rows tracked across false -> true -> false mode changes', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(false);
  const firstRow = createRowHandle('first', events);
  const secondRow = createRowHandle('second', events);

  controller.registerRow('first', firstRow);
  controller.registerRow('second', secondRow);

  controller.handleOpen('first', firstRow);
  controller.setAllowMultipleOpenRows(true);
  controller.handleOpen('second', secondRow);
  controller.setAllowMultipleOpenRows(false);

  assert.deepEqual(events, ['close:first', 'close:second']);
});

test('controller clears the tracked single-open row when it is unregistered', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(false);
  const row = createRowHandle('tracked', events);

  controller.registerRow('tracked', row);
  controller.handleOpen('tracked', row);
  controller.registerRow('tracked', null);
  controller.closeAnyOpenRows();

  assert.deepEqual(events, []);
});

test('controller clears the tracked single-open row when it closes', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(false);
  const row = createRowHandle('tracked', events);

  controller.registerRow('tracked', row);
  controller.handleOpen('tracked', row);
  controller.handleClose('tracked');
  controller.closeAnyOpenRows();

  assert.deepEqual(events, []);
});

test('controller closes the tracked single-open row on demand', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(false);
  const row = createRowHandle('tracked', events);

  controller.registerRow('tracked', row);
  controller.handleOpen('tracked', row);
  controller.closeAnyOpenRows();

  assert.deepEqual(events, ['close:tracked']);
});

test('controller ignores redundant multiple-row mode updates', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(true);
  const row = createRowHandle('tracked', events);

  controller.registerRow('tracked', row);
  controller.handleOpen('tracked', row);
  controller.setAllowMultipleOpenRows(true);

  assert.deepEqual(events, []);
});

test('controller closes the latest registered row handle for a key', () => {
  const events: string[] = [];
  const controller = createSwipeableRowsController(false);
  const originalRow = createRowHandle('original', events);
  const replacementRow = createRowHandle('replacement', events);

  controller.registerRow('tracked', originalRow);
  controller.handleOpen('tracked', originalRow);
  controller.registerRow('tracked', replacementRow);
  controller.closeAnyOpenRows();

  assert.deepEqual(events, ['close:replacement']);
});
