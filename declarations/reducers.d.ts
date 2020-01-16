export declare type ReducerActionListener = (state: any, action: any) => any;
export declare class Reducer {
    constructor(path: string, init: any);
    registerActionHandler: (actionType: string, listener: ReducerActionListener) => Reducer;
}
export declare function createReducer(path: string, init: any): Reducer;
