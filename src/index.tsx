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
import { Reducer, reduxReducer, reducerSlice } from './reducer';
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
  TStateRecord,
  TActionsRecord,
  ActionVK extends VoidKeys<TActionsRecord> = VoidKeys<TActionsRecord>,
  ActionNVK extends Exclude<keyof TActionsRecord, ActionVK> = Exclude<
    keyof TActionsRecord,
    ActionVK
  >,
  DispatchVK extends VoidKeys<TActionsRecord> = VoidKeys<TActionsRecord>,
  DispatchNVK extends Exclude<keyof TActionsRecord, DispatchVK> = Exclude<
    keyof TActionsRecord,
    DispatchVK
  >
> {
  private [actionListeners]: Record<any, ListenerFunc<any>[]> = {};
  private [store]: Store;

  constructor() {
    // We can't use class fields to bind these methods using arrow functions,
    // since we have to use overloaded TypeScript signatures which don't support
    // class fields, so we bind these the old fashion way instead
    this.dispatch = this.dispatch.bind(this);
    this.createListener = this.createListener.bind(this);
  }

  public createContainer = (
    mapStateToProps: (getSlice: GetSlice<TStateRecord>, ownProps?: any) => any,
    mapDispatchToProps: (
      dispatch: Reduxology<TStateRecord, TActionsRecord>['dispatch'],
      ownProps?: any
    ) => any,
    component: any
  ): ConnectedComponent<any, Pick<unknown, never>> => {
    return connect(
      (rawState: any, ownProps) =>
        mapStateToProps(new State<TStateRecord>(rawState).getSlice, ownProps),
      (_, ownProps) => mapDispatchToProps(this.dispatch, ownProps)
    )(component);
  };

  public createReducer = <K extends keyof TStateRecord>(
    slice: K,
    initialData: TStateRecord[K]
  ): Reducer<TStateRecord[K], TActionsRecord> => {
    return new Reducer<TStateRecord[K], TActionsRecord>(
      slice as string,
      initialData
    );
  };

  public createListener<P extends ActionNVK>(
    action: P,
    listener: ListenerFunc<TActionsRecord[P]>
  ): Listener;
  public createListener<P extends ActionVK>(
    action: P,
    listener: () => void
  ): Listener;
  public createListener(
    action: any,
    listener: ListenerFunc<any> | (() => void)
  ): Listener {
    return new Listener(action, listener);
  }

  public createApp = ({
    container: Container,
    reducers: appReducers = [],
    listeners: appListeners = [],
    middleware = []
  }: {
    container: any;
    listeners?: Listener[];
    reducers?: Reducer<unknown, TActionsRecord>[];
    middleware?: Middleware[];
  }): JSX.Element => {
    const reducerSet: Record<string, ReduxReducer> = {};

    for (const appReducer of appReducers) {
      const slice = appReducer[reducerSlice];
      if (reducerSet[slice]) {
        throw new Error(
          `Cannot create reducer at ${slice} because that slice is already taken`
        );
      }
      reducerSet[slice] = appReducer[reduxReducer];
    }

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
          listener(action.data);
        }
      }
      return next(action);
    });

    this[store] = createStore(
      combineReducers(reducerSet),
      applyMiddleware(...middleware)
    );

    return (
      <Provider store={this[store]}>
        <Container />
      </Provider>
    );
  };

  public dispatch<P extends DispatchNVK>(
    action: P,
    data: TActionsRecord[P]
  ): void;
  public dispatch<P extends DispatchVK>(action: P): void;
  public dispatch(action: any, data?: any): void {
    this[store].dispatch({ type: action, data });
  }
}

const defaultReduxology = new Reduxology();

export const createContainer = defaultReduxology.createContainer;
export const createReducer = defaultReduxology.createReducer;
export const createListener = defaultReduxology.createListener;
export const createApp = defaultReduxology.createApp;
export const dispatch = defaultReduxology.dispatch;
