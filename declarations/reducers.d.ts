export declare type ReducerActionListener = (state: any, action: any) => any;
export interface RegisterReducerOptions {
    path: string;
    actions: Record<string, ReducerActionListener>;
    init: any;
}
export declare function registerReducer(options: RegisterReducerOptions): void;
export declare function registerReducer(path: string, actions: Record<string, ReducerActionListener>, init: any): void;
