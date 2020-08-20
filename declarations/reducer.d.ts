import { Reducer as ReduxReducer } from 'redux';
export declare type ReducerActionListener = (state: any, ...actionData: any[]) => void;
export declare const reduxReducer: unique symbol;
declare const actionHandlers: unique symbol;
export declare class Reducer {
    [reduxReducer]: ReduxReducer;
    private [actionHandlers];
    constructor(init: any);
    handle: (actionType: string, handler: ReducerActionListener) => Reducer;
    removeHandler: (actionType: string) => void;
    isHandlerRegistered: (actionType: string) => boolean;
}
export {};
