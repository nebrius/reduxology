/// <reference types="react" />
import { ConnectedComponent } from 'react-redux';
import { Middleware } from 'redux';
import { GetSlice } from './state';
import { Reducer } from './reducer';
import { Listener, ListenerFunc } from './listener';
import { VoidKeys } from './util';
declare const store: unique symbol;
declare const actionListeners: unique symbol;
export declare class Reduxology<TStateRecord, TActionsRecord, ActionVK extends VoidKeys<TActionsRecord> = VoidKeys<TActionsRecord>, ActionNVK extends Exclude<keyof TActionsRecord, ActionVK> = Exclude<keyof TActionsRecord, ActionVK>, DispatchVK extends VoidKeys<TActionsRecord> = VoidKeys<TActionsRecord>, DispatchNVK extends Exclude<keyof TActionsRecord, DispatchVK> = Exclude<keyof TActionsRecord, DispatchVK>> {
    private [actionListeners];
    private [store];
    constructor();
    createContainer: (mapStateToProps: (getSlice: GetSlice<TStateRecord>, ownProps?: any) => any, mapDispatchToProps: (dispatch: Reduxology<TStateRecord, TActionsRecord>['dispatch'], ownProps?: any) => any, component: any) => ConnectedComponent<any, Pick<unknown, never>>;
    createReducer: <K extends keyof TStateRecord>(slice: K, initialData: TStateRecord[K]) => Reducer<TStateRecord[K], TActionsRecord, keyof TActionsRecord extends (TActionsRecord[keyof TActionsRecord] extends void ? keyof TActionsRecord : never) ? (TActionsRecord[keyof TActionsRecord] extends void ? keyof TActionsRecord : never) & keyof TActionsRecord : never, Exclude<keyof TActionsRecord, keyof TActionsRecord extends (TActionsRecord[keyof TActionsRecord] extends void ? keyof TActionsRecord : never) ? (TActionsRecord[keyof TActionsRecord] extends void ? keyof TActionsRecord : never) & keyof TActionsRecord : never>>;
    createListener<P extends ActionNVK>(action: P, listener: ListenerFunc<TActionsRecord[P]>): Listener;
    createListener<P extends ActionVK>(action: P, listener: () => void): Listener;
    createApp: ({ container: Container, reducers: appReducers, listeners: appListeners, middleware }: {
        container: any;
        listeners?: Listener[] | undefined;
        reducers?: Reducer<unknown, TActionsRecord, keyof TActionsRecord extends (TActionsRecord[keyof TActionsRecord] extends void ? keyof TActionsRecord : never) ? (TActionsRecord[keyof TActionsRecord] extends void ? keyof TActionsRecord : never) & keyof TActionsRecord : never, Exclude<keyof TActionsRecord, keyof TActionsRecord extends (TActionsRecord[keyof TActionsRecord] extends void ? keyof TActionsRecord : never) ? (TActionsRecord[keyof TActionsRecord] extends void ? keyof TActionsRecord : never) & keyof TActionsRecord : never>>[] | undefined;
        middleware?: Middleware<{}, any, import("redux").Dispatch<import("redux").AnyAction>>[] | undefined;
    }) => JSX.Element;
    dispatch<P extends DispatchNVK>(action: P, data: TActionsRecord[P]): void;
    dispatch<P extends DispatchVK>(action: P): void;
}
export declare const createContainer: (mapStateToProps: (getSlice: GetSlice<unknown>, ownProps?: any) => any, mapDispatchToProps: (dispatch: {
    <P extends never>(action: P, data: unknown): void;
    <P_1 extends never>(action: P_1): void;
}, ownProps?: any) => any, component: any) => ConnectedComponent<any, Pick<unknown, never>>;
export declare const createReducer: <K extends never>(slice: K, initialData: unknown) => Reducer<unknown, unknown, never, never>;
export declare const createListener: {
    <P extends never>(action: P, listener: ListenerFunc<unknown>): Listener;
    <P_1 extends never>(action: P_1, listener: () => void): Listener;
};
export declare const createApp: ({ container: Container, reducers: appReducers, listeners: appListeners, middleware }: {
    container: any;
    listeners?: Listener[] | undefined;
    reducers?: Reducer<unknown, unknown, never, never>[] | undefined;
    middleware?: Middleware<{}, any, import("redux").Dispatch<import("redux").AnyAction>>[] | undefined;
}) => JSX.Element;
export declare const dispatch: {
    <P extends never>(action: P, data: unknown): void;
    <P_1 extends never>(action: P_1): void;
};
export {};
