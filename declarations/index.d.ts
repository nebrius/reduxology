/// <reference types="react" />
import { State } from './state';
import { Reducer } from './reducer';
declare type MapStateToProps = (state: State) => any;
declare type MapDispatchToProps = (dispatch: (action: string, ...data: any[]) => void) => any;
declare const reducers: unique symbol;
declare const store: unique symbol;
export declare class Reduxology {
    private [reducers];
    private [store];
    createContainer: (mapStateToProps: MapStateToProps, mapDispatchToProps: MapDispatchToProps, component: any) => import("react-redux").ConnectedComponent<any, Pick<unknown, never>>;
    createReducer: (slice: string, initialData: any) => Reducer;
    dispatch: (type: string, ...data: any[]) => void;
    createRoot: (Container: any) => JSX.Element;
}
export declare const createContainer: (mapStateToProps: MapStateToProps, mapDispatchToProps: MapDispatchToProps, component: any) => import("react-redux").ConnectedComponent<any, Pick<unknown, never>>;
export declare const createReducer: (slice: string, initialData: any) => Reducer;
export declare const createRoot: (Container: any) => JSX.Element;
export declare const dispatch: (type: string, ...data: any[]) => void;
export {};
