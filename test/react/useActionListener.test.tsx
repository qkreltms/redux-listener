import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { createStore } from 'redux';
import { createMiddleware, useActionListener } from '../../src';
import { Adapter } from '../../src/react/adapter';

afterEach(() => {
  jest.clearAllMocks();
});

const mockNext = (dispatch) => dispatch;
const mockStore = createStore((state, action) => state);

test('Should throw an error when middleware is not attached on store', () => {
  const { result } = renderHook(() => useActionListener('TEST', () => {}));
  expect(result.error).toEqual(
    Error(
      'middleware is not attached on your store, it will not listen your actions.'
    )
  );
});

test('Should listen an action', () => {
  const listenMiddleware = createMiddleware();
  let cnt = 0;
  renderHook(() =>
    useActionListener('TEST', () => {
      cnt += 1;
    })
  );

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST' });

  expect(cnt).toBe(1);
});

test('Should apply latest callback', () => {
  const listenMiddleware = createMiddleware();
  let cnt = 0;
  let cb = () => {
    cnt = 1;
  };
  const { rerender } = renderHook(() => useActionListener('TEST', cb));

  cb = () => {
    cnt = 2;
  };
  rerender();

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST' });

  expect(cnt).toBe(2);
  expect(listenMiddleware.listeners.size).toBe(1);
});

test('Should remove first listener when action name is chagned and register new one', () => {
  const listenMiddleware = createMiddleware();
  // it listens TEST actions
  const mockAction = 'TEST';
  let cntForTest = 0;
  let cntForOthers = 0;
  const { rerender } = renderHook(
    ({ action }) =>
      useActionListener(action, () => {
        if (action === 'TEST') {
          cntForTest += 1;
        } else {
          cntForOthers += 1;
        }
      }),
    { initialProps: { action: mockAction } }
  );

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST' });
  expect(listenMiddleware.listeners.size).toBe(1);
  expect(cntForTest).toBe(1);

  // now action name is chagned
  // it will remove listeneing listener that listens TEST
  // and will create new listener for CHANGE_ACTION
  rerender({ action: 'CHANGE_ACTION' });
  expect(listenMiddleware.listeners.size).toBe(1);
  expect(cntForTest).toBe(1);
  expect(cntForOthers).toBe(0);

  // dispatch TEST
  middleware({ type: 'TEST' });
  // should be 1 because the action TEST is removed
  expect(cntForTest).toBe(1);

  middleware({ type: 'CHANGE_ACTION' });
  // should be 1 because the CHANGE_ACTION is registed
  expect(cntForTest).toBe(1);
});

test('Should remove first listener when action list is chagned and register new one', () => {
  const listenMiddleware = createMiddleware();
  // it listens [TEST] actions
  const mockAction = ['TEST'];
  let cntForTest = 0;
  let cntForOthers = 0;
  const { rerender } = renderHook(
    ({ action }) =>
      useActionListener(action, () => {
        if (action[0] === 'TEST') {
          cntForTest += 1;
        } else {
          cntForOthers += 1;
        }
      }),
    { initialProps: { action: mockAction } }
  );

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST' });
  expect(listenMiddleware.listeners.size).toBe(1);
  expect(cntForTest).toBe(1);

  // now action name is chagned
  // it will remove listeneing listener that listens TEST
  // and will create new listener for CHANGE_ACTION
  rerender({ action: ['CHANGE_ACTION'] });
  expect(listenMiddleware.listeners.size).toBe(1);
  expect(cntForTest).toBe(1);
  expect(cntForOthers).toBe(0);

  // dispatch TEST
  middleware({ type: 'TEST' });
  // should be 1 because the action TEST is removed
  expect(cntForTest).toBe(1);

  middleware({ type: 'CHANGE_ACTION' });
  // should be 1 because the CHANGE_ACTION is registed
  expect(cntForTest).toBe(1);
});

test('Should register multiple listeners with same action name', () => {
  const listenMiddleware = createMiddleware();
  let cnt = 0;
  renderHook(() =>
    useActionListener('TEST', () => {
      cnt += 1;
    })
  );
  renderHook(() =>
    useActionListener('TEST', () => {
      cnt += 1;
    })
  );

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST' });
  expect(listenMiddleware.listeners.size).toBe(2);
});

test('Should register listener with action array', () => {
  const listenMiddleware = createMiddleware();
  let cnt = 0;
  renderHook(() =>
    useActionListener(['TEST', 'ANOTHER'], () => {
      cnt += 1;
    })
  );

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST' });
  expect(listenMiddleware.listeners.size).toBe(1);
  middleware({ type: 'ANOTHER' });
  expect(expect(cnt).toBe(2));
});

test('Should read payload of action', () => {
  const listenMiddleware = createMiddleware();
  renderHook(() =>
    useActionListener('TEST', (action) => {
      expect(action.payload).toBe(1);
    })
  );

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST', payload: 1 });
});

test('Should dispatch an action in other listener', () => {
  const listenMiddleware = createMiddleware();
  renderHook(() =>
    useActionListener('TEST', (action, dispatch) => {
      expect(action.payload).toBe(1);
      dispatch({ type: 'ANOTHER' });
    })
  );

  renderHook(() =>
    useActionListener('ANOTHER', (action) => {
      expect(action.payload).toBe(2);
    })
  );

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST', payload: 1 });
  middleware({ type: 'ANOTHER', payload: 2 });
});

test('Should have same reference', () => {
  const listenMiddleware = createMiddleware();
  renderHook(() =>
    useActionListener('TEST', (action, dispatch) => {
      expect(action.payload).toBe(1);
      dispatch({ type: 'ANOTHER' });
    })
  );

  expect(listenMiddleware.actionHandler === Adapter.actionHandler).toBe(true);
});

test('Should be used as hybrid', () => {
  const listenMiddleware = createMiddleware();
  const spy = jest.spyOn(listenMiddleware.actionHandler, 'addListener');
  renderHook(() =>
    useActionListener('TEST', (action) => {
      expect(action.payload).toBe(1);
    })
  );
  listenMiddleware.addListener('TEST', (action) => {
    expect(action.payload).toBe(1);
  });
  expect(listenMiddleware.listeners.size).toBe(2);

  const middleware = listenMiddleware(mockStore)(mockNext);
  middleware({ type: 'TEST', payload: 1 });
  expect(spy).toBeCalledTimes(2);
});
