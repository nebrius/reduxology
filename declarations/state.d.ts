declare const state: unique symbol;
export declare class State {
    private [state];
    constructor(rawState: Record<string, any>);
    getSlice: (slice: string) => any;
}
export {};
