import { ConnectedComponent } from 'react-redux';
import { State } from './state';
declare type MapStateToProps = (state: State) => any;
declare type MapDispatchToProps = (dispatch: (action: string, data: any) => void) => any;
export declare type Container = ConnectedComponent<any, Pick<unknown, never>>;
export interface CreateContainerOptions {
    mapStateToProps: MapStateToProps;
    mapDispatchToProps: MapDispatchToProps;
    component: any;
}
export declare function createContainer(options: CreateContainerOptions): Container;
export declare function createContainer(mapStateToProps: MapStateToProps, mapDispatchToProps: MapDispatchToProps, component: any): Container;
export {};
