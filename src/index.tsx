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
import { Reducer, reduxReducer } from './reducer';
import { VoidKeys } from './util';

type Listener<T> = (data: T) => void;

const reducers = Symbol('reducers');
const store = Symbol('store');
const actionListeners = Symbol('actionListeners');

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
  private [reducers]: Record<any, Reducer<any, TActionsRecord>> = {};
  private [actionListeners]: Record<any, Listener<any>[]> = {};
  private [store]: Store;

  constructor() {
    // We can't use class fields to bind these methods using arrow functions,
    // since we have to use overloaded TypeScript signatures which don't support
    // class fields, so we bind these the old fashion way instead
    this.dispatch = this.dispatch.bind(this);
    this.listen = this.listen.bind(this);
  }

  public createContainer = (
    mapStateToProps: (getSlice: GetSlice<TStateRecord>, ownProps?: any) => any,
    mapDispatchToProps: (
      dispatch:
        | (<P extends DispatchNVK>(action: P, data: TActionsRecord[P]) => void)
        | (<P extends DispatchVK>(action: P) => void),
      ownProps?: any
    ) => any,
    component: any
  ): ConnectedComponent<any, Pick<unknown, never>> => {
    return connect(
      (rawState: any, ownProps) =>
        mapStateToProps(new State<TStateRecord>(rawState).getSlice, ownProps),
      (rawDispatch, ownProps) => mapDispatchToProps(this.dispatch, ownProps)
    )(component);
  };

  public createReducer = <K extends keyof TStateRecord>(
    slice: K,
    initialData: TStateRecord[K]
  ): Reducer<TStateRecord[K], TActionsRecord> => {
    if (typeof slice !== 'string') {
      throw new Error('"slice" argument must be a string');
    }
    if (this[reducers].hasOwnProperty(slice)) {
      throw new Error(
        `Cannot create reducer at ${slice} because that slice is already taken`
      );
    }
    const reducer = new Reducer<TStateRecord[K], TActionsRecord>(initialData);
    this[reducers][slice] = reducer;
    return reducer;
  };

  public dispatch<P extends DispatchNVK>(
    action: P,
    data: TActionsRecord[P]
  ): void;
  public dispatch<P extends DispatchVK>(action: P): void;
  public dispatch(action: any, data?: any): void {
    this[store].dispatch({ type: action, data });
  }

  public createRoot = (
    Container: any,
    ...middleware: Middleware[]
  ): JSX.Element => {
    const reducerSet: Record<string, ReduxReducer> = {};
    for (const dataType in this[reducers]) {
      const reducer = this[reducers][dataType];
      reducerSet[dataType] = reducer[reduxReducer];
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

  public listen<P extends ActionNVK>(
    action: P,
    listener: Listener<TActionsRecord[P]>
  ): void;
  public listen<P extends ActionVK>(action: P, listener: () => void): void;
  public listen(action: any, listener: Listener<any> | (() => void)): void {
    if (!this[actionListeners].hasOwnProperty(action)) {
      this[actionListeners][action] = [];
    }
    this[actionListeners][action].push(listener);
  }
}

const defaultReduxology = new Reduxology();

export const createContainer = defaultReduxology.createContainer;
export const createReducer = defaultReduxology.createReducer;
export const createRoot = defaultReduxology.createRoot;
export const dispatch = defaultReduxology.dispatch;
export const listen = defaultReduxology.listen;
