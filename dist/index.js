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
exports.listen = exports.dispatch = exports.createRoot = exports.createReducer = exports.createContainer = exports.Reduxology = void 0;
const React = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const state_1 = require("./state");
const reducer_1 = require("./reducer");
const reducers = Symbol('reducers');
const store = Symbol('store');
const actionListeners = Symbol('actionListeners');
class Reduxology {
    constructor() {
        this[_a] = {};
        this[_b] = {};
        this.createContainer = (mapStateToProps, mapDispatchToProps, component) => {
            return react_redux_1.connect((rawState, ownProps) => mapStateToProps(new state_1.State(rawState).getSlice, ownProps), (rawDispatch, ownProps) => mapDispatchToProps((type, ...data) => rawDispatch({ type, data }), ownProps))(component);
        };
        this.createReducer = (slice, initialData) => {
            if (typeof slice !== 'string') {
                throw new Error('"slice" argument must be a string');
            }
            if (this[reducers].hasOwnProperty(slice)) {
                throw new Error(`Cannot create reducer at ${slice} because that slice is already taken`);
            }
            const reducer = new reducer_1.Reducer(initialData);
            this[reducers][slice] = reducer;
            return reducer;
        };
        this.dispatch = (type, ...data) => {
            this[store].dispatch({ type, data });
        };
        this.createRoot = (Container, ...middleware) => {
            const reducerSet = {};
            for (const dataType in this[reducers]) {
                const reducer = this[reducers][dataType];
                reducerSet[dataType] = reducer[reducer_1.reduxReducer];
            }
            middleware.unshift(() => (next) => (action) => {
                if (this[actionListeners][action.type]) {
                    for (const listener of this[actionListeners][action.type]) {
                        listener(...action.data);
                    }
                }
                return next(action);
            });
            this[store] = redux_1.createStore(redux_1.combineReducers(reducerSet), redux_1.applyMiddleware(...middleware));
            return (React.createElement(react_redux_1.Provider, { store: this[store] },
                React.createElement(Container, null)));
        };
        this.listen = (actionType, listener) => {
            if (!this[actionListeners].hasOwnProperty(actionType)) {
                this[actionListeners][actionType] = [];
            }
            this[actionListeners][actionType].push(listener);
        };
    }
}
exports.Reduxology = Reduxology;
_a = reducers, _b = actionListeners;
const defaultReduxology = new Reduxology();
exports.createContainer = defaultReduxology.createContainer;
exports.createReducer = defaultReduxology.createReducer;
exports.createRoot = defaultReduxology.createRoot;
exports.dispatch = defaultReduxology.dispatch;
exports.listen = defaultReduxology.listen;
//# sourceMappingURL=index.js.map