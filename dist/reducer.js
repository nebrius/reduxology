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
exports.Reducer = exports.reduxReducer = void 0;
const immer_1 = require("immer");
exports.reduxReducer = Symbol('reduxReducer');
const actionHandlers = Symbol('actionHandlers');
class Reducer {
    constructor(init) {
        this[_a] = {};
        this.handle = (actionType, handler) => {
            if (this[actionHandlers].hasOwnProperty(actionType)) {
                throw new Error(`An action handler for ${actionType} has already been registered`);
            }
            this[actionHandlers][actionType] = handler;
            return this;
        };
        this.removeHandler = (actionType) => {
            delete this[actionHandlers][actionType];
        };
        this.isHandlerRegistered = (actionType) => {
            return this[actionHandlers].hasOwnProperty(actionType);
        };
        this[exports.reduxReducer] = (state, action) => {
            if (typeof state === 'undefined') {
                state = init;
            }
            if (this[actionHandlers].hasOwnProperty(action.type)) {
                return immer_1.default(state, (draftState) => {
                    return this[actionHandlers][action.type](draftState, ...action.data);
                });
            }
            return state;
        };
    }
}
exports.Reducer = Reducer;
_a = actionHandlers;
//# sourceMappingURL=reducer.js.map