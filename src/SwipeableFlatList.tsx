import { createSwipeableFlatList } from './createSwipeableFlatList';
import { LegacySwipeableRowAdapter } from './LegacySwipeableRowAdapter';

const SwipeableFlatList = createSwipeableFlatList(LegacySwipeableRowAdapter);

export default SwipeableFlatList;
