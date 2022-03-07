import * as React from 'react';
import { ConnectedComponent } from 'react-redux';
import { Middleware } from 'redux';
import { GetSlice } from './state';
import { Reducer } from './reducer';
import { Listener, ListenerFunc } from './listener';
import { VoidKeys } from './util';
declare const store: unique symbol;
declare const actionListeners: unique symbol;
export declare class Reduxology<State, Actions, ActionVK extends VoidKeys<Actions> = VoidKeys<Actions>, ActionNVK extends Exclude<keyof Actions, ActionVK> = Exclude<keyof Actions, ActionVK>, DispatchVK extends VoidKeys<Actions> = VoidKeys<Actions>, DispatchNVK extends Exclude<keyof Actions, DispatchVK> = Exclude<keyof Actions, DispatchVK>> {
    private [actionListeners];
    private [store];
    constructor();
    createContainer<ComponentProps = null, ComponentDispatch = null, OwnProps = Record<string, never>>(mapStateToProps: (getSlice: GetSlice<State>, ownProps: OwnProps) => ComponentProps | null, mapDispatchToProps: (dispatch: Reduxology<State, Actions>['dispatch'], ownProps: OwnProps) => ComponentDispatch | null, component: any): ConnectedComponent<any, OwnProps>;
    createReducer: <Slice extends keyof State>(slice: Slice, initialData: State[Slice]) => Reducer<State[Slice], Actions, keyof Actions extends (Actions[keyof Actions] extends void ? keyof Actions : never) ? (Actions[keyof Actions] extends void ? keyof Actions : never) & keyof Actions : never, Exclude<keyof Actions, keyof Actions extends (Actions[keyof Actions] extends void ? keyof Actions : never) ? (Actions[keyof Actions] extends void ? keyof Actions : never) & keyof Actions : never>>;
    handle<ActionName extends ActionNVK>(action: ActionName, listener: ListenerFunc<State, Actions[ActionName]>): Listener<State>;
    handle<ActionName extends ActionVK>(action: ActionName, listener: ListenerFunc<State, void>): Listener<State>;
    createApp: ({ container, reducers: appReducers, listeners: appListeners, middleware }: {
        container: React.Component | ConnectedComponent<any, any>;
        listeners?: Listener<State>[] | undefined;
        reducers?: Reducer<State[keyof State], Actions, keyof Actions extends (Actions[keyof Actions] extends void ? keyof Actions : never) ? (Actions[keyof Actions] extends void ? keyof Actions : never) & keyof Actions : never, Exclude<keyof Actions, keyof Actions extends (Actions[keyof Actions] extends void ? keyof Actions : never) ? (Actions[keyof Actions] extends void ? keyof Actions : never) & keyof Actions : never>>[] | undefined;
        middleware?: Middleware<{}, any, import("redux").Dispatch<import("redux").AnyAction>>[] | undefined;
    }) => React.FunctionComponent;
    dispatch<Action extends DispatchNVK>(action: Action, data: Actions[Action]): void;
    dispatch<Action extends DispatchVK>(action: Action): void;
}
export declare const createContainer: <ComponentProps = null, ComponentDispatch = null, OwnProps = Record<string, never>>(mapStateToProps: (getSlice: GetSlice<unknown>, ownProps: OwnProps) => ComponentProps | null, mapDispatchToProps: (dispatch: {
    <Action extends never>(action: Action, data: unknown): void;
    <Action_1 extends never>(action: Action_1): void;
}, ownProps: OwnProps) => ComponentDispatch | null, component: any) => ConnectedComponent<any, OwnProps>;
export declare const createReducer: <Slice extends never>(slice: Slice, initialData: unknown) => Reducer<unknown, unknown, never, never>;
export declare const createListener: {
    <ActionName extends never>(action: ActionName, listener: ListenerFunc<unknown, unknown>): Listener<unknown>;
    <ActionName_1 extends never>(action: ActionName_1, listener: ListenerFunc<unknown, void>): Listener<unknown>;
};
export declare const createApp: ({ container, reducers: appReducers, listeners: appListeners, middleware }: {
    container: React.Component | ConnectedComponent<any, any>;
    listeners?: Listener<unknown>[] | undefined;
    reducers?: Reducer<never, unknown, never, never>[] | undefined;
    middleware?: Middleware<{}, any, import("redux").Dispatch<import("redux").AnyAction>>[] | undefined;
}) => React.FunctionComponent;
export declare const dispatch: {
    <Action extends never>(action: Action, data: unknown): void;
    <Action_1 extends never>(action: Action_1): void;
};
export {};
