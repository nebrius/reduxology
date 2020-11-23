export declare const listenerAction: unique symbol;
export declare const listenerListener: unique symbol;
export declare type ListenerFunc<T> = (data: T) => void;
export declare class Listener {
    [listenerAction]: string;
    [listenerListener]: ListenerFunc<unknown>;
    constructor(actionName: string, newListener: ListenerFunc<unknown>);
}
