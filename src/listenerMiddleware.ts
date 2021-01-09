import { AnyAction, Dispatch, Store } from 'redux';
import reactAdapter from './react/adapter';
import getUniqueHash from './utills/generateUniqueId';

export type ActionType = string | Array<string>;
interface Listener {
  (dispatch?: Dispatch, action?: AnyAction): void;
}
interface ListenerTemplate {
  type: ActionType;
  listener: Listener;
}

export class ActionHandler {
  listeners: { [key: string]: ListenerTemplate };

  constructor() {
    this.listeners = {};
  }

  addListener = (hash: string, type: ActionType, listener: Listener) => {
    this.listeners[hash] = { type, listener };
  };

  removeListener = (hash: string) => {
    delete this.listeners[hash];
  };
}
export interface ListenerStore
  extends Omit<ActionHandler, 'addListener' | 'removeListener'> {
  actionHandler: ActionHandler;
  addListener: (type: ActionType, listener: Listener) => void;
  (store: Store): (next: Dispatch<AnyAction>) => (action: any) => void;
}
export interface CreateMiddleware {
  (): ListenerStore;
}

const createMiddleware: CreateMiddleware = () => {
  const actionHandler = new ActionHandler();
  const middleware = (store: Store) => (next: Dispatch<AnyAction>) => (
    action: any
  ) => {
    Object.values(actionHandler.listeners)
      .filter(({ type }) => {
        if (type === action.type) {
          return true;
        }

        // then check if listener type is array and has action.type
        if (type.constructor === Array && type.indexOf(action.type) > -1) {
          return true;
        }

        return false;
      })
      .map((listener) => listener.listener(store.dispatch, action));

    // continue middleware chain
    next(action);
  };

  middleware.listeners = actionHandler.listeners;
  middleware.addListener = (type: ActionType, listener: Listener) => {
    const hash = getUniqueHash();
    actionHandler.addListener(hash, type, listener);
  };
  middleware.actionHandler = actionHandler;

  reactAdapter(middleware.actionHandler);
  return middleware;
};

export default createMiddleware;
