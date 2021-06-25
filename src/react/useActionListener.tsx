import React, { useEffect, useRef } from 'react';
import { Listener, ListenerActionType } from '../listenerMiddleware';
import getUniqueHash from '../utills/generateUniqueId';
import { Adapter } from './adapter';

export interface UseActionListener {
  (actionName: ListenerActionType, cb: Listener): void;
}

const useActionListener: UseActionListener = (actionName, cb) => {
  const cbRef = useRef(cb);
  // it only changes when actionName is changed not cb
  const hash = getUniqueHash();
  const { actionHandler } = Adapter;
  if (!actionHandler) {
    throw new Error(
      'middleware is not attached on your store, it will not listen your actions.'
    );
  }

  useEffect(() => {
    cbRef.current = cb;
  });

  useEffect(() => {
    actionHandler?.addListener(hash, actionName, (action, dispatch) => {
      cbRef.current(action, dispatch);
    });
    return () => {
      actionHandler?.removeListener(hash);
    };
  }, [JSON.stringify(actionName)]);
};

export default useActionListener;
