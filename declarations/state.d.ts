export declare type GetSlice<StateData> = <Slice extends keyof StateData>(slice: Slice) => StateData[Slice];
declare const state: unique symbol;
export declare class State<StateData> {
    private [state];
    constructor(rawState: StateData);
    getSlice: GetSlice<StateData>;
}
export {};
