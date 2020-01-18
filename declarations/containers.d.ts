import { State } from './state';
declare type MapStateToProps = (state: State) => any;
declare type MapDispatchToProps = (dispatch: (action: string, data?: any) => void) => any;
export declare function createContainer(mapStateToProps: MapStateToProps, mapDispatchToProps: MapDispatchToProps, component: any): import("react-redux").ConnectedComponent<any, Pick<unknown, never>>;
export {};
