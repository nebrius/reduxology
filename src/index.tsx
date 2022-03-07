/*
MIT License

Copyright (c) Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as React from 'react';
import { Provider, ConnectedComponent, connect } from 'react-redux';
import {
  createStore,
  Store,
  Reducer as ReduxReducer,
  combineReducers,
  Middleware,
  applyMiddleware
} from 'redux';
import { GetSlice, State } from './state';
import {
  Reducer,
  reduxReducer,
  reducerSlice,
  makeReducerAlive
} from './reducer';
import {
  Listener,
  ListenerFunc,
  listenerAction,
  listenerListener
} from './listener';
import { VoidKeys } from './util';

const store = Symbol();
const actionListeners = Symbol();

// The type implementation for this is borrowed from Brian Terlson's work:
// https://medium.com/@bterlson/strongly-typed-event-emitters-2c2345801de8
export class Reduxology<
  State,
  Actions,
  ActionVK extends VoidKeys<Actions> = VoidKeys<Actions>,
  ActionNVK extends Exclude<keyof Actions, ActionVK> = Exclude<
    keyof Actions,
    ActionVK
  >,
  DispatchVK extends VoidKeys<Actions> = VoidKeys<Actions>,
  DispatchNVK extends Exclude<keyof Actions, DispatchVK> = Exclude<
    keyof Actions,
    DispatchVK
  >
> {
  private [actionListeners]: Record<any, ListenerFunc<any, State>[]> = {};
  private [store]: Store;

  constructor() {
    // We can't use class fields to bind these methods using arrow functions,
    // since we have to use overloaded or generic TypeScript signatures which
    // don't support class fields, so we bind these the old fashion way instead
    this.dispatch = this.dispatch.bind(this);
    this.createListener = this.createListener.bind(this);
    this.createContainer = this.createContainer.bind(this);
  }

  public createContainer<
    ComponentProps = null,
    ComponentDispatch = null,
    OwnProps = Record<string, never>
  >(
    mapStateToProps: (
      getSlice: GetSlice<State>,
      ownProps: OwnProps
    ) => ComponentProps | null,
    mapDispatchToProps: (
      dispatch: Reduxology<State, Actions>['dispatch'],
      ownProps: OwnProps
    ) => ComponentDispatch | null,
    component: any
  ): ConnectedComponent<any, OwnProps> {
    return connect(
      (rawState, ownProps) =>
        mapStateToProps
          ? mapStateToProps(
              new State<State>(rawState as State).getSlice,
              ownProps as any
            )
          : null,
      (_, ownProps) =>
        mapDispatchToProps
          ? mapDispatchToProps(this.dispatch, ownProps as any)
          : null
    )(component);
  }

  public createReducer = <Slice extends keyof State>(
    slice: Slice,
    initialData: State[Slice]
  ): Reducer<State[Slice], Actions> => {
    return new Reducer<State[Slice], Actions>(slice as string, initialData);
  };

  // TODO: symmetry between createReducer and createListener is off...the later handles an action, the former doesn't
  public createListener<ActionName extends ActionNVK>(
    action: ActionName,
    listener: ListenerFunc<Actions[ActionName], State>
  ): Listener<State>;
  public createListener<Action extends ActionVK>(
    action: Action,
    listener: () => void
  ): Listener<State>;
  public createListener(
    action: any,
    listener: ListenerFunc<any, State> | (() => void)
  ): Listener<State> {
    return new Listener(action, listener);
  }

  public createApp = ({
    container,
    reducers: appReducers = [],
    listeners: appListeners = [],
    middleware = []
  }: {
    container: React.Component | ConnectedComponent<any, any>;
    listeners?: Listener<State>[];
    reducers?: Reducer<State[keyof State], Actions>[];
    middleware?: Middleware[];
  }): React.FunctionComponent => {
    const reducerSet: Record<string, ReduxReducer> = {};

    for (const appReducer of appReducers) {
      const slice = appReducer[reducerSlice];
      if (reducerSet[slice]) {
        throw new Error(
          `Cannot create reducer at ${slice} because that slice is already taken`
        );
      }
      appReducer[makeReducerAlive]();
      reducerSet[slice] = appReducer[reduxReducer];
    }

    this[actionListeners] = {};
    for (const appListener of appListeners) {
      const action = appListener[listenerAction];
      if (!this[actionListeners].hasOwnProperty(action)) {
        this[actionListeners][action] = [];
      }
      this[actionListeners][action].push(appListener[listenerListener]);
    }

    middleware.unshift(() => (next) => (action) => {
      if (this[actionListeners][action.type]) {
        for (const listener of this[actionListeners][action.type]) {
          listener(
            action.data,
            new State<State>(this[store].getState()).getSlice
          );
        }
      }
      return next(action);
    });

    this[store] = createStore(
      combineReducers(reducerSet),
      applyMiddleware(...middleware)
    );

    const Container = container as any;
    const App = () => (
      <Provider store={this[store]}>
        <Container />
      </Provider>
    );

    return App;
  };

  public dispatch<Action extends DispatchNVK>(
    action: Action,
    data: Actions[Action]
  ): void;
  public dispatch<Action extends DispatchVK>(action: Action): void;
  public dispatch(action: any, data?: any): void {
    if (!this[store]) {
      throw new Error('Cannot call "dispatch" before "createApp" is called');
    }
    this[store].dispatch({ type: action, data });
  }
}

const defaultReduxology = new Reduxology();

export const createContainer = defaultReduxology.createContainer;
export const createReducer = defaultReduxology.createReducer;
export const createListener = defaultReduxology.createListener;
export const createApp = defaultReduxology.createApp;
export const dispatch = defaultReduxology.dispatch;
