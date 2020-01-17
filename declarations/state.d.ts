declare const state: unique symbol;
export declare class State {
    private [state];
    constructor(rawState: Record<string, any>);
    getState(id: string): any;
}
export {};
