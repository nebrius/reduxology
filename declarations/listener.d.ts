import { GetSlice } from './state';
export declare const listenerAction: unique symbol;
export declare const listenerListener: unique symbol;
export declare type ListenerFunc<ActionData, State> = (data: ActionData, getSlice: GetSlice<State>) => void;
export declare class Listener<State> {
    [listenerAction]: string;
    [listenerListener]: ListenerFunc<unknown, State>;
    constructor(actionName: string, newListener: ListenerFunc<unknown, State>);
}
