import { GetSlice } from './state';
export declare const listenerAction: unique symbol;
export declare const listenerListener: unique symbol;
export declare type ListenerFunc<State, ActionData> = (getSlice: GetSlice<State>, data: ActionData) => void;
export declare class Listener<State> {
    [listenerAction]: string;
    [listenerListener]: ListenerFunc<State, unknown>;
    constructor(actionName: string, newListener: ListenerFunc<State, unknown>);
}
