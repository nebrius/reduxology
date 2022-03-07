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
import produce, { enableMapSet } from 'immer';
import { VoidKeys } from './util';

enableMapSet();

export const reduxReducer = Symbol();
export const reducerSlice = Symbol();
export const makeReducerAlive = Symbol();
const actionHandlers = Symbol();
const isAlive = Symbol();

type Handler<S, A> = (slice: S, action: A) => void;

export class Reducer<
  Slice,
  Actions,
  ActionVK extends VoidKeys<Actions> = VoidKeys<Actions>,
  ActionNVK extends Exclude<keyof Actions, ActionVK> = Exclude<
    keyof Actions,
    ActionVK
  >
> {
  private [actionHandlers]: Record<
    string,
    (state: any, actionData: any) => void
  > = {};

  public [reduxReducer]: ReduxReducer;
  public [reducerSlice]: string;
  private [isAlive] = false;

  constructor(sliceName: string, init: any) {
    this[reducerSlice] = sliceName;
    this.handle = this.handle.bind(this);

    this[reduxReducer] = (state: any, action: any) => {
      if (typeof state === 'undefined') {
        state = init;
      }
      if (this[actionHandlers].hasOwnProperty(action.type)) {
        return produce(state, (draftState: any) => {
          return this[actionHandlers][action.type](draftState, action.data);
        });
      }
      return state;
    };
  }

  public handle<Action extends ActionNVK>(
    action: Action,
    handler: Handler<Slice, Actions[Action]>
  ): void;
  public handle<Action extends ActionVK>(
    action: Action,
    handler: () => void
  ): void;
  public handle(
    actionType: string,
    handler: (state: any, actionData: any) => void
  ): Reducer<Slice, Actions> {
    if (this[isAlive]) {
      throw new Error(
        'Cannot attach a reducer handler after the app has been created'
      );
    }
    if (this[actionHandlers].hasOwnProperty(actionType)) {
      throw new Error(
        `An action handler for ${actionType} has already been registered`
      );
    }
    this[actionHandlers][actionType] = handler;
    return this;
  }

  public [makeReducerAlive](): void {
    this[isAlive] = true;
  }
}
