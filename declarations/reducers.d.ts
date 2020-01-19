import { Reducer as ReduxReducer } from 'redux';
export declare type ReducerActionListener = (state: any, action: any) => any;
declare const reduxReducer: unique symbol;
declare const actionHandlers: unique symbol;
export declare class Reducer {
    [reduxReducer]: ReduxReducer;
    private [actionHandlers];
    constructor(init: any);
    handle: (actionType: string, listener: ReducerActionListener) => Reducer;
    removeHandler: (actionType: string) => void;
    iHandlerRegistered: (actionType: string) => boolean;
}
export declare function createReducer(dataType: string, initialData: any): Reducer;
export declare function buildReduxReducerSet(): ReduxReducer;
export {};
