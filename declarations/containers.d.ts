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
export {};
