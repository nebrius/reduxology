import { GetSlice } from './state';
export declare const listenerAction: unique symbol;
export declare const listenerListener: unique symbol;
export declare type ListenerFunc<T, TStateRecord> = (data: T, getSlice: GetSlice<TStateRecord>) => void;
export declare class Listener<TStateRecord> {
    [listenerAction]: string;
    [listenerListener]: ListenerFunc<unknown, TStateRecord>;
    constructor(actionName: string, newListener: ListenerFunc<unknown, TStateRecord>);
}
