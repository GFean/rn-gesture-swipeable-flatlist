import { createSwipeableFlatList } from './createSwipeableFlatList';
import { ReanimatedSwipeableRowAdapter } from './ReanimatedSwipeableRowAdapter';

const ReanimatedSwipeableFlatList = createSwipeableFlatList(ReanimatedSwipeableRowAdapter);

export default ReanimatedSwipeableFlatList;
