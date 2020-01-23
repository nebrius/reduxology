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

import { Reducer as ReduxReducer } from 'redux';
import produce from 'immer';

export type ReducerActionListener = (state: any, ...actionData: any[]) => void;

export const reduxReducer = Symbol('reduxReducer');
const actionHandlers = Symbol('actionHandlers');

export class Reducer {

  public [reduxReducer]: ReduxReducer;
  private [actionHandlers]: Record<string, ReducerActionListener> = {};

  constructor(init: any) {
    this[reduxReducer] = (state: any, action: any) => {
      if (typeof state === 'undefined') {
        state = init;
      }
      if (this[actionHandlers].hasOwnProperty(action.type)) {
        return produce(state, (draftState: any) => {
          return this[actionHandlers][action.type](draftState, ...action.data);
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

  public isHandlerRegistered = (actionType: string): boolean => {
    return this[actionHandlers].hasOwnProperty(actionType);
  }
}
