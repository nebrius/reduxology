/// <reference types="react" />
export declare type ActionCreator = (...args: any[]) => Record<string, any>;
export interface RegisterActionOptions {
    type: string;
    creator: ActionCreator;
}
export declare function registerAction(options: RegisterActionOptions): void;
export declare function registerAction(type: string, creator: ActionCreator): void;
export declare type ReducerActionListener = (state: Record<string, any>, action: Record<string, any>) => Record<string, any>;
export interface RegisterReducerOptions {
    path: string;
    actions: Record<string, ReducerActionListener>;
    init: Record<string, any>;
}
export declare function registerReducer(options: RegisterReducerOptions): void;
export declare function registerReducer(path: string, actions: Record<string, ReducerActionListener>, init: Record<string, any>): void;
declare class State {
    getState(path: string): any;
}
export interface CreateContainerOptions {
    mapStateToProps: (state: State) => Record<string, any>;
    mapDispatchToProps: (dispatch: (action: string, data: any) => void) => Record<string, any>;
    component: React.ComponentClass;
}
export interface Container {
    id: number;
}
export declare function createContainer(options: CreateContainerOptions): Container;
export declare function createRoot(container: Container): any;
export {};
