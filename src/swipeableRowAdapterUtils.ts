import { SwipeableActionRenderer } from './types';

export const createDirectActionRenderer = <T,>(
  renderAction: SwipeableActionRenderer<T> | undefined,
  item: T
) => (renderAction ? () => renderAction(item) : undefined);
