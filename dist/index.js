"use strict";
/*
MIT License

Copyright (c) Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatch = exports.createApp = exports.createListener = exports.createReducer = exports.createContainer = exports.Reduxology = void 0;
const React = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const state_1 = require("./state");
const reducer_1 = require("./reducer");
const listener_1 = require("./listener");
const store = Symbol();
const actionListeners = Symbol();
const isAlive = Symbol();
// The type implementation for this is borrowed from Brian Terlson's work:
// https://medium.com/@bterlson/strongly-typed-event-emitters-2c2345801de8
class Reduxology {
    constructor() {
        this[_a] = {};
        this[_b] = false;
        this.createReducer = (slice, initialData) => {
            if (this[isAlive]) {
                throw new Error('Cannot create a reducer after the app has been created');
            }
            return new reducer_1.Reducer(slice, initialData);
        };
        this.createApp = ({ container: Container, reducers: appReducers = [], listeners: appListeners = [], middleware = [] }) => {
            this[isAlive] = true;
            const reducerSet = {};
            for (const appReducer of appReducers) {
                const slice = appReducer[reducer_1.reducerSlice];
                if (reducerSet[slice]) {
                    throw new Error(`Cannot create reducer at ${slice} because that slice is already taken`);
                }
                appReducer[reducer_1.makeReducerAlive]();
                reducerSet[slice] = appReducer[reducer_1.reduxReducer];
            }
            for (const appListener of appListeners) {
                const action = appListener[listener_1.listenerAction];
                if (!this[actionListeners].hasOwnProperty(action)) {
                    this[actionListeners][action] = [];
                }
                this[actionListeners][action].push(appListener[listener_1.listenerListener]);
            }
            middleware.unshift(() => (next) => (action) => {
                if (this[actionListeners][action.type]) {
                    for (const listener of this[actionListeners][action.type]) {
                        listener(action.data, new state_1.State(this[store].getState()).getSlice);
                    }
                }
                return next(action);
            });
            this[store] = redux_1.createStore(redux_1.combineReducers(reducerSet), redux_1.applyMiddleware(...middleware));
            return (React.createElement(react_redux_1.Provider, { store: this[store] },
                React.createElement(Container, null)));
        };
        // We can't use class fields to bind these methods using arrow functions,
        // since we have to use overloaded or generic TypeScript signatures which
        // don't support class fields, so we bind these the old fashion way instead
        this.dispatch = this.dispatch.bind(this);
        this.createListener = this.createListener.bind(this);
        this.createContainer = this.createContainer.bind(this);
    }
    createContainer(mapStateToProps, mapDispatchToProps, component) {
        return react_redux_1.connect((rawState, ownProps) => mapStateToProps(new state_1.State(rawState).getSlice, ownProps), (_, ownProps) => mapDispatchToProps(this.dispatch, ownProps))(component);
    }
    createListener(action, listener) {
        if (this[isAlive]) {
            throw new Error('Cannot create a listener after the app has been created');
        }
        return new listener_1.Listener(action, listener);
    }
    dispatch(action, data) {
        if (!this[store]) {
            throw new Error('Cannot call "dispatch" before "createApp" is called');
        }
        this[store].dispatch({ type: action, data });
    }
}
exports.Reduxology = Reduxology;
_a = actionListeners, _b = isAlive;
const defaultReduxology = new Reduxology();
exports.createContainer = defaultReduxology.createContainer;
exports.createReducer = defaultReduxology.createReducer;
exports.createListener = defaultReduxology.createListener;
exports.createApp = defaultReduxology.createApp;
exports.dispatch = defaultReduxology.dispatch;
//# sourceMappingURL=index.js.map