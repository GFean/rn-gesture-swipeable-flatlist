# rn-gesture-swipeable-flatlist

![npm](https://img.shields.io/npm/v/rn-gesture-swipeable-flatlist)
![license](https://img.shields.io/npm/l/rn-gesture-swipeable-flatlist)

A fast, simple swipeable FlatList for React Native.

👉 Drop-in `FlatList` replacement with swipe-to-delete support.

Built on top of `react-native-gesture-handler` and Reanimated, the standard gesture stack in React Native.

![Demo](gifs/demo_gif.gif)

A React Native swipeable FlatList for building:

- swipe to delete
- inbox-style lists
- gesture-based row actions

Built on `FlatList` with support for both:

- `rn-gesture-swipeable-flatlist/reanimated` using `ReanimatedSwipeable` (recommended)
- `rn-gesture-swipeable-flatlist` using classic `Swipeable`

If you are searching for a React Native swipe list, swipeable flatlist, or gesture handler swipeable list, this package is built for that exact use case.

## Why this library?

React Native does not ship a built-in swipeable list component.

Building one from scratch usually means wiring gesture handlers, tracking open rows, managing refs, and keeping everything stable as list data changes.

This package handles that for you while staying close to normal `FlatList` usage.

## Which implementation should I use?

👉 Use `rn-gesture-swipeable-flatlist/reanimated` by default.

`Swipeable` is deprecated in newer versions of `react-native-gesture-handler`.

| Import | Uses | Recommendation | Requires |
| --- | --- | --- | --- |
| `rn-gesture-swipeable-flatlist/reanimated` | `ReanimatedSwipeable` | Use by default for new apps | `react-native-gesture-handler` + `react-native-reanimated >= 2.3.0` |
| `rn-gesture-swipeable-flatlist` | classic `Swipeable` | Only use if you intentionally want the legacy RNGH component | `react-native-gesture-handler` |

## Installation

Install the package with Gesture Handler:

```bash
npm install rn-gesture-swipeable-flatlist react-native-gesture-handler
```

or:

```bash
yarn add rn-gesture-swipeable-flatlist react-native-gesture-handler
```

If you use the recommended `/reanimated` import, also install Reanimated:

```bash
npm install react-native-reanimated
```

If you use Expo:

```bash
expo install react-native-gesture-handler react-native-reanimated
```

## Gesture Handler Setup

Required for both imports.

Wrap your app root with `GestureHandlerRootView`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActualApp />
    </GestureHandlerRootView>
  );
}
```

Official docs:
https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation

## Reanimated Setup

Required only for `rn-gesture-swipeable-flatlist/reanimated`.

Use `react-native-reanimated@2.3.0` or newer and complete the normal Reanimated installation for your app.

Official docs:
https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started

## Copy-Paste Example

This is the recommended setup for a swipe to delete React Native list:

```tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import SwipeableFlatList from 'rn-gesture-swipeable-flatlist/reanimated';

type Message = {
  id: string;
  subject: string;
};

const initialData: Message[] = [
  { id: '1', subject: 'Welcome' },
  { id: '2', subject: 'Invoice' },
];

export function InboxScreen() {
  const [data, setData] = React.useState(initialData);

  const removeItem = (id: string) => {
    setData((current) => current.filter((item) => item.id !== id));
  };

  return (
    <SwipeableFlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.subject}</Text>
        </View>
      )}
      renderRightActions={(item) => (
        <Pressable onPress={() => removeItem(item.id)}>
          <Text>Delete</Text>
        </Pressable>
      )}
    />
  );
}
```

## Features

- Works exactly like `FlatList` with swipe support added
- Add per-item swipe actions like delete, archive, and pin
- Use `ReanimatedSwipeable` by default, or the classic import when needed
- Choose single-open or multi-open row behavior
- Close open rows imperatively when screens, tabs, or filters change
- Keep list usage simple with item-based action renderers

## API

`SwipeableFlatList` accepts normal `FlatList` props plus:

| Prop | Type | Purpose |
| --- | --- | --- |
| `renderLeftActions` | `(item) => React.ReactNode` | Render left swipe actions for a row |
| `renderRightActions` | `(item) => React.ReactNode` | Render right swipe actions for a row |
| `swipeableProps` | `SwipeableFlatListSwipeableProps` | Forward extra props to the underlying RNGH swipeable component |
| `enableOpenMultipleRows` | `boolean` | Control whether multiple rows can stay open |

Notes:

- `renderLeftActions` and `renderRightActions` receive the item directly
- direct `renderLeftActions` / `renderRightActions` props take priority over the same fields inside `swipeableProps`
- `swipeableProps` targets `Swipeable` on the default import and `ReanimatedSwipeable` on the `/reanimated` import

### Ref API

The forwarded ref behaves like a `FlatList` ref and adds:

| Method | Purpose |
| --- | --- |
| `closeAnyOpenRows()` | Close the currently open row, or all open rows when multiple-open mode is enabled |

```tsx
import React, { useRef } from 'react';
import SwipeableFlatList, {
  SwipeableFlatListRef,
} from 'rn-gesture-swipeable-flatlist/reanimated';

const listRef = useRef<SwipeableFlatListRef<Item> | null>(null);

listRef.current?.closeAnyOpenRows();
```

## When to use

- swipe to delete in React Native
- inbox-style message lists
- archive / pin / delete row actions
- activity, notifications, history, and settings lists with row gestures

## When not to use

- This library is not for drag-and-drop sorting
- This library is not a full custom gesture system
- This library is not for non-`FlatList` rendering patterns

## AI / Codex Notes

- Prefer `rn-gesture-swipeable-flatlist/reanimated`
- Do not mix the default and `/reanimated` imports for the same list
- Treat it like a normal `FlatList` with extra swipe props
- Always pass a stable `keyExtractor` for dynamic data

## Links

- React Native `FlatList` docs: https://reactnative.dev/docs/flatlist
- Gesture Handler `Swipeable` docs: https://docs.swmansion.com/react-native-gesture-handler/docs/2.x/components/swipeable/
- Gesture Handler `ReanimatedSwipeable` docs: https://docs.swmansion.com/react-native-gesture-handler/docs/2.x/components/reanimated_swipeable/
- Example project: https://github.com/GFean/rn-gesture-swipeable-flatlist-example

## License

ISC
