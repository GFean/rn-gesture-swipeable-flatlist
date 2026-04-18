export interface SwipeableRowHandle {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
}

export interface SwipeableRowsController {
  closeAnyOpenRows: () => void;
  handleOpen: (rowKey: string, row: SwipeableRowHandle) => void;
  handleClose: (rowKey: string) => void;
  registerRow: (rowKey: string, row: SwipeableRowHandle | null) => void;
  setAllowMultipleOpenRows: (enabled: boolean) => void;
}

export const createSwipeableRowsController = (
  enableOpenMultipleRows: boolean
): SwipeableRowsController => {
  let allowMultipleOpenRows = enableOpenMultipleRows;
  const rows = new Map<string, SwipeableRowHandle>();
  const openRowKeys = new Set<string>();
  let openRowKey: string | null = null;

  const closeRows = (rowKeys: Iterable<string>) => {
    Array.from(rowKeys).forEach((rowKey) => {
      rows.get(rowKey)?.close();
    });
  };

  const setAllowMultipleOpenRows = (enabled: boolean) => {
    if (allowMultipleOpenRows === enabled) {
      return;
    }

    if (enabled && openRowKey) {
      openRowKeys.add(openRowKey);
      openRowKey = null;
    }

    if (!enabled) {
      closeRows(openRowKeys);
      openRowKeys.clear();
      openRowKey = null;
    }

    allowMultipleOpenRows = enabled;
  };

  const registerRow = (rowKey: string, row: SwipeableRowHandle | null) => {
    if (row === null) {
      rows.delete(rowKey);
      openRowKeys.delete(rowKey);

      if (openRowKey === rowKey) {
        openRowKey = null;
      }

      return;
    }

    rows.set(rowKey, row);
  };

  const handleOpen = (rowKey: string, row: SwipeableRowHandle) => {
    rows.set(rowKey, row);

    if (allowMultipleOpenRows) {
      openRowKeys.add(rowKey);
      return;
    }

    if (openRowKey && openRowKey !== rowKey) {
      rows.get(openRowKey)?.close();
    }

    openRowKey = rowKey;
  };

  const handleClose = (rowKey: string) => {
    openRowKeys.delete(rowKey);

    if (openRowKey === rowKey) {
      openRowKey = null;
    }
  };

  const closeAnyOpenRows = () => {
    if (allowMultipleOpenRows) {
      closeRows(openRowKeys);
      openRowKeys.clear();
      return;
    }

    if (openRowKey) {
      rows.get(openRowKey)?.close();
      openRowKey = null;
    }
  };

  return {
    closeAnyOpenRows,
    handleOpen,
    handleClose,
    registerRow,
    setAllowMultipleOpenRows,
  };
};
