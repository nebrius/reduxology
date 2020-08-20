/// <reference types="react" />
import { ConnectedComponent } from 'react-redux';
import { Middleware } from 'redux';
import { Reducer } from './reducer';
export { ActionListener } from './reducer';
export declare type MapStateToProps = (getSlice: (slice: string) => any) => any;
export declare type MapDispatchToProps = (dispatch: (action: string, ...data: any[]) => void) => any;
declare const reducers: unique symbol;
declare const store: unique symbol;
export declare class Reduxology {
    private [reducers];
    private [store];
    createContainer: (mapStateToProps: MapStateToProps, mapDispatchToProps: MapDispatchToProps, component: any) => ConnectedComponent<any, Pick<unknown, never>>;
    createReducer: (slice: string, initialData: any) => Reducer;
    dispatch: (type: string, ...data: any[]) => void;
    createRoot: (Container: any, ...middleware: Middleware[]) => JSX.Element;
}
export declare const createContainer: (mapStateToProps: MapStateToProps, mapDispatchToProps: MapDispatchToProps, component: any) => ConnectedComponent<any, Pick<unknown, never>>;
export declare const createReducer: (slice: string, initialData: any) => Reducer;
export declare const createRoot: (Container: any, ...middleware: Middleware[]) => JSX.Element;
export declare const dispatch: (type: string, ...data: any[]) => void;
