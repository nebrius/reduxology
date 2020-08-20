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
import { Dispatch } from 'react';
import {
  createStore,
  Store,
  Reducer as ReduxReducer,
  combineReducers,
  Middleware,
  applyMiddleware
} from 'redux';
import { State } from './state';
import { Reducer, reduxReducer } from './reducer';

export { ReducerActionListener } from './reducer';
export type ActionListener = (...actionData: any[]) => void;
export type MapStateToProps = (getSlice: (slice: string) => any) => any;
export type MapDispatchToProps = (
  dispatch: (action: string, ...data: any[]) => void
) => any;

const reducers = Symbol('reducers');
const store = Symbol('store');
const actionListeners = Symbol('actionListeners');

export class Reduxology {
  private [reducers]: Record<string, Reducer> = {};
  private [store]: Store;
  private [actionListeners]: Record<string, ActionListener[]> = {};

  public createContainer = (
    mapStateToProps: MapStateToProps,
    mapDispatchToProps: MapDispatchToProps,
    component: any
  ): ConnectedComponent<any, Pick<unknown, never>> => {
    return connect(
      (rawState: any) => mapStateToProps(new State(rawState).getSlice),
      (rawDispatch: Dispatch<any>) =>
        mapDispatchToProps((type, ...data) => rawDispatch({ type, data }))
    )(component);
  };

  public createReducer = (slice: string, initialData: any): Reducer => {
    if (typeof slice !== 'string') {
      throw new Error('"slice" argument must be a string');
    }
    if (this[reducers].hasOwnProperty(slice)) {
      throw new Error(
        `Cannot create reducer at ${slice} because that slice is already taken`
      );
    }
    const reducer = new Reducer(initialData);
    this[reducers][slice] = reducer;
    return reducer;
  };

  public dispatch = (type: string, ...data: any[]): void => {
    this[store].dispatch({ type, data });
  };

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
          listener(...action.data);
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

  public listen = (actionType: string, listener: ActionListener): void => {
    if (!this[actionListeners].hasOwnProperty(actionType)) {
      this[actionListeners][actionType] = [];
    }
    this[actionListeners][actionType].push(listener);
  };
}

const defaultReduxology = new Reduxology();

export const createContainer = defaultReduxology.createContainer;
export const createReducer = defaultReduxology.createReducer;
export const createRoot = defaultReduxology.createRoot;
export const dispatch = defaultReduxology.dispatch;
export const listen = defaultReduxology.listen;
