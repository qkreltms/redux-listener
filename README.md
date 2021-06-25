# react-action-listener

[![Version](https://img.shields.io/npm/v/react-action-listener.svg)](https://www.npmjs.com/package/react-action-listener)
[![License: MIT](https://img.shields.io/github/license/qkreltms/react-action-listener)](https://github.com/qkreltms/react-action-listener/blob/master/LICENSE)

[<img src="https://user-images.githubusercontent.com/25196026/108624179-8cb45400-7486-11eb-9e1e-0a60967ffece.jpg" width="150"/>](Observer_SC2_Head1)

> Middleware, React hook which allows making side effect and listening actions of Context or Redux

![react-action-listener](https://user-images.githubusercontent.com/25196026/123260477-9206d580-d530-11eb-8ac0-741d4260d4b4.gif)

## Motivation

In 'redux-saga', to change the local state when an action is dispatched, it is necessary to change local state to globally using Redux, Context and etc. It becomes maintenance difficult if these kinds of works are repeated.

To solve this problem I made 'redux-action-listener' by inheriting the work of [redux-listener](https://github.com/Gaya/redux-listeners).

You can make side effects and listening actions more simply and lightly than 'redux-saga'. Also, by providing a hook version, you don't have to move local state to global state.

## Install

```sh
npm i react-action-listener
yarn add react-action-listener
```

## Usages

### Much like `redux-saga`

```ts
import { createMiddleware } from 'react-action-listener';

const middleware = createMiddleware();
// 1. Apply middleware.
const store = createStore(reduce, {}, applyMiddleware(middleware);

// 2. Register listener.
middleware.addListener((action, dispatch) => {
  // Now you can listen 'ADD' when button is pressed.
  // {"type":"ADD","payload":1}
  console.log(`${JSON.stringify(action)}`);
});

const onClickPlus = () => {
  // When the button is clicked, an action 'ADD' is dispatched.
  // Note: You must provide property 'type'
  store.dispatch({ type: 'ADD', payload: 1 });
};

return <button onClick={onClickPlus}>add</button>;
```

### Hook

```ts
import { createMiddleware, useActionListener } from 'react-action-listener';
// 1. Apply global middleware.
const store = createStore(reduce, {}, applyMiddleware(createMiddleware()));

// 2. Use hook.
useActionListener('ADD', (action, dispatch) => {
  // Now you can listen 'ADD' when the button is pressed.
  // {"type":"ADD","payload":1}
  console.log(`${JSON.stringify(action)}`);
});

const onClickPlus = () => {
  // When the button is clicked, an action 'ADD' is dispatched.
  store.dispatch({ type: 'ADD', payload: 1 });
};

return <button onClick={onClickPlus}>add</button>;
```

### Context

```ts
import { createMiddleware, useActionListener } from 'react-action-listener';
// Note: you must provide config.isContext = true
// You will be able to see redux-logger style logs for dispatched action when you provide isDebugContext = true
const middleware = createMiddleware({ isContext: true, isDebugContext: true });

const [state, dispatch] = useReducer(counterReducer, initialValues);

function increaseAction(dispatch) {
  const action = {
    type: 'ADD',
    payload: 1,
  };

  // 1. Apply middleware.
  middleware(action);
  dispatch(action);
}

// 2. Use hook.
// Note: when you use Context, dispatch will not be provided as parameter.
useActionListener('ADD', (action) => {
  // {"type":"ADD","payload":1}
  console.log(`${JSON.stringify(action)}`);
});
```

### Hybrid

You can also mix up.

```ts
import { createMiddleware, useActionListener } from 'react-action-listener';
// 1. Apply global middleware.
const middleware = createMiddleware();

useActionListener('ADD', (action, dispatch) => {
  //...
});

middleware.addListener('ADD', (action, dispatch) => {
  // ...
});
```

## API

```js
createMiddleware({ isContext, isDebugContext });
```

- `isContext: boolean`
  - When you want to use middleware with Context you must provide this to `true`
  - Note: You will not be able to use middleware with Redux.
- `isDebugContext: boolean`
  - When you use middleware with Context, you can also log dispatched actions by setting it `true`.

```js
useActionListener(actionType, listener);
```

- `actionType: string | string[]`
  - The action type or an array of action types to match.
- `listener: (action, dispatch) => void`
  - The callback function which will be called when an action of specified types is dispatched.
  - `action: object`
    - Dispatched action.
  - `dispatch: Dispatch<AnyAction>(action: AnyAction) => AnyAction`
    - Equals with `store.dispatch`, but wrapped with setTimeout(() => {...}, 0)
    - By using this, you can ensure another action in listener can be dispatched as soon as the first dispatching action is completed.
    - Note: when you set `isContext: true`, dispatch will not be provided as parameter.

## Links

- Examples

  - [Counters](https://codesandbox.io/s/react-action-listener-5we8j?file=/src/reducer.ts)
  - [Counters (hook)](https://codesandbox.io/s/react-action-listener-counter-example-0dti5?file=/src/reducer.ts)
  - [Counters (Context)](https://codesandbox.io/s/react-action-listener-context-s748z?file=/src/Counter.tsx)

    See also [here](./examples)

## Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/qkreltms/react-action-listener/issues). You can also take a look at the [contributing guide](https://github.com/qkreltms/react-action-listener/blob/master/CONTRIBUTING.md).

## Contributors

**Jeong Hoon Park**
<br/>

## License

Copyright © 2021 [Jeong Hoon Park](https://github.com/qkreltms).

This project is [MIT](https://github.com/qkreltms/react-action-listener/blob/master/LICENSE) licensed.

---
