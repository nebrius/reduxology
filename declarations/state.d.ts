export declare type GetSlice<T> = <K extends keyof T>(slice: K) => T[K];
declare const state: unique symbol;
export declare class State<T> {
    private [state];
    constructor(rawState: Record<string, any>);
    getSlice: GetSlice<T>;
}
export {};
