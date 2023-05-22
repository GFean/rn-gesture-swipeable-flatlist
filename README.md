# React Native Swipeable FlatList

<div>
  <img src="gifs/demo_android.gif" alt="Android Demo" width="400" />
  <img src="gifs/demo_ios.gif" alt="iOS Demo" width="400" />
</div>

SwipeableFlatList is a custom component that combines the functionality of [FlatList](https://reactnative.dev/docs/flatlist) and [Swipeable](https://docs.swmansion.com/react-native-gesture-handler/docs/api/components/swipeable/) from [React Native]("https://reactnative.dev") and [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/) to create a swipeable list. It allows you to easily render a list of items that can be swiped to reveal additional actions.

This package uses usual, core components from both packages listed above - so this should work with any kind of React Native App and should have a high performance on both platforms.

You can also pass additional props supported by FlatList & Swipeable to customize the behavior and appearance of the list.

[Check the example project](https://github.com/GFean/rn-gesture-swipeable-flatlist-example)

## Installation

Install the package using npm or yarn:

```bash
npm install rn-gesture-swipeable-flatlist
yarn add rn-gesture-swipeable-flatlist
```
# Usage 

```jsx
import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

// Example usage
const MyComponent = () => {
  const data = [...]; // Your data array
  const renderItem = ({ item }) => {
    // Render individual list items
    return (
      // Your list item component JSX
    );
  };

  const renderLeftActions = (item) => {
    // Render left swipe actions for each item
    return (
      // Your left actions component JSX
    );
  };

  const renderRightActions = (item) => {
    // Render right swipe actions for each item
    return (
      // Your right actions component JSX
    );
  };

  return (
    <SwipeableFlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    />
  );
};
```

## Props

The SwipeableFlatList component accepts the following props:

### FlatlistProps: 

As the rn-gesture-swipeable-flatlist uses Flatlist from react-native core package, it can be passed FlatlistProps as the usual Flatlist.
Check general FlatlistProps [here](https://github.com/facebook/react-native-website/blob/main/docs/flatlist.md)

### SwipeableProps

As the rn-gesture-swipeable-flatlist uses Swipeable component, it can be passed SwipeableProps, so you can adjust your SwipeableItem of the flatlist.
Check general SwipeableProps [here](https://docs.swmansion.com/react-native-gesture-handler/docs/api/components/swipeable/) 
All the SwipeableProps can be passed under SwipeableProps prop to SwipeableFlatlist:

```jsx
<SwipeableFlatList 
    swipeableProps={{
        enabled: true 
    }}
>
```
### renderLeftActions

A function that returns the component to render as left swipe actions for each item. This is actually a SwipeableProp, but for the simplicity, as you will mostly using left/right actions, it can be passed directly to the SwipeableFlatList.

### renderRightActions

Similarly to the one above, this is the function that returns the component to render as right swipe actions for each item.
This is also a SwipeableProp, but for the simplicity, as you will mostly using left/right actions, it can be passed directly to the SwipeableFlatList.

## Contributing
Contributions are welcome! If you find any issues or would like to suggest improvements, please create a new issue or submit a pull request.

## License
This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

## Dependencies

- [React Native Gesture Handler](https://github.com/software-mansion/react-native-gesture-handler)

`rn-gesture-swipeable-flatlist` has a peer dependency on `react-native-gesture-handler`. It will be installed automatically when you install this package. However, please ensure that your project meets the requirements for `react-native-gesture-handler`.
