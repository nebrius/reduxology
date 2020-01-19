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

import { Reducer as ReduxReducer, combineReducers } from 'redux';
import { Action } from './actions';
import produce from 'immer';

export type ReducerActionListener = (state: any, action: any) => any;

const reducers: Record<string, Reducer> = {};

const reduxReducer = Symbol('reduxReducer');
const actionHandlers = Symbol('actionHandlers');

export class Reducer {

  public [reduxReducer]: ReduxReducer;
  private [actionHandlers]: Record<string, ReducerActionListener> = {};

  constructor(init: any) {
    this[reduxReducer] = (state: any, action: any) => {
      if (typeof state === 'undefined') {
        state = init;
      }
      if (this[actionHandlers].hasOwnProperty((action as Action).type)) {
        return produce(state, (draftState: any) => {
          return this[actionHandlers][action.type](draftState, (action as Action).data);
        });
      }
      return state;
    };
  }

  public handle = (actionType: string, listener: ReducerActionListener): Reducer => {
    if (this[actionHandlers].hasOwnProperty(actionType)) {
      throw new Error(`An action handler for ${actionType} has already been registered`);
    }
    this[actionHandlers][actionType] = listener;
    return this;
  }

  public removeHandler = (actionType: string): void => {
    delete this[actionHandlers][actionType];
  }

  public iHandlerRegistered = (actionType: string): boolean => {
    return this[actionHandlers].hasOwnProperty(actionType);
  }
}

export function createReducer(dataType: string, initialData: any): Reducer {
  if (typeof dataType !== 'string') {
    throw new Error('"dataType" argument must be a string');
  }
  if (reducers.hasOwnProperty(dataType)) {
    throw new Error(`Cannot create reducer at ${dataType} because that type is already taken`);
  }
  const reducer = new Reducer(initialData);
  reducers[dataType] = reducer;
  return reducer;
}

export function buildReduxReducerSet(): ReduxReducer {
  const reducerSet: Record<string, ReduxReducer> = {};
  // tslint:disable forin
  for (const dataType in reducers) {
    const reducer = reducers[dataType];
    reducerSet[dataType] = reducer[reduxReducer];
  }
  return combineReducers(reducerSet);
}
