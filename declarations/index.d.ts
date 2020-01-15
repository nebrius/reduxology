export declare type ActionCreator = (...args: any[]) => any;
export interface RegisterActionOptions {
    type: string;
    creator: ActionCreator;
}
export declare function registerAction(options: RegisterActionOptions): void;
export declare function registerAction(type: string, creator: ActionCreator): void;
export declare type ReducerActionListener = (state: any, action: any) => any;
export interface RegisterReducerOptions {
    path: string;
    actions: Record<string, ReducerActionListener>;
    init: any;
}
export declare function registerReducer(options: RegisterReducerOptions): void;
export declare function registerReducer(path: string, actions: Record<string, ReducerActionListener>, init: any): void;
declare class State {
    getState(path: string): any;
}
declare type MapStateToProps = (state: State) => any;
declare type MapDispatchToProps = (dispatch: (action: string, data: any) => void) => any;
export interface Container {
    id: number;
}
export interface CreateContainerOptions {
    mapStateToProps: MapStateToProps;
    mapDispatchToProps: MapDispatchToProps;
    component: any;
}
export declare function createContainer(options: CreateContainerOptions): Container;
export declare function createContainer(mapStateToProps: MapStateToProps, mapDispatchToProps: MapDispatchToProps, component: any): Container;
export declare function createRoot(container: Container): any;
export {};
