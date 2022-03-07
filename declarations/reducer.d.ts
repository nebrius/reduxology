import { Reducer as ReduxReducer } from 'redux';
import { VoidKeys } from './util';
export declare const reduxReducer: unique symbol;
export declare const reducerSlice: unique symbol;
export declare const makeReducerAlive: unique symbol;
declare const actionHandlers: unique symbol;
declare const isAlive: unique symbol;
declare type Handler<S, A> = (slice: S, action: A) => void;
export declare class Reducer<Slice, Actions, ActionVK extends VoidKeys<Actions> = VoidKeys<Actions>, ActionNVK extends Exclude<keyof Actions, ActionVK> = Exclude<keyof Actions, ActionVK>> {
    private [actionHandlers];
    [reduxReducer]: ReduxReducer;
    [reducerSlice]: string;
    private [isAlive];
    constructor(sliceName: string, init: any);
    handle<Action extends ActionNVK>(action: Action, handler: Handler<Slice, Actions[Action]>): void;
    handle<Action extends ActionVK>(action: Action, handler: () => void): void;
    [makeReducerAlive](): void;
}
export {};
