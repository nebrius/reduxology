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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const state_1 = require("./state");
const reducer_1 = require("./reducer");
const reducers = Symbol('reducers');
const store = Symbol('store');
class Reduxology {
    constructor() {
        this[_a] = {};
        this.createContainer = (mapStateToProps, mapDispatchToProps, component) => {
            return react_redux_1.connect((rawState) => mapStateToProps(new state_1.State(rawState)), (rawDispatch) => mapDispatchToProps((type, ...data) => rawDispatch({ type, data })))(component);
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
        this.createRoot = (Container) => {
            const reducerSet = {};
            // tslint:disable forin
            for (const dataType in this[reducers]) {
                const reducer = this[reducers][dataType];
                reducerSet[dataType] = reducer[reducer_1.reduxReducer];
            }
            this[store] = redux_1.createStore(redux_1.combineReducers(reducerSet));
            return (React.createElement(react_redux_1.Provider, { store: this[store] },
                React.createElement(Container, null)));
        };
    }
}
exports.Reduxology = Reduxology;
_a = reducers;
const defaultReduxology = new Reduxology();
exports.createContainer = defaultReduxology.createContainer;
exports.createReducer = defaultReduxology.createReducer;
exports.createRoot = defaultReduxology.createRoot;
exports.dispatch = defaultReduxology.dispatch;
//# sourceMappingURL=index.js.map