"use strict";
class Emitter {
    constructor() {
        this.listeners = {};
    }
    dispatch(action, data) {
        const listener = this.listeners[action];
        if (listener) {
            listener(data);
        }
    }
    listen(action, listener) {
        this.listeners[action] = listener;
    }
}
const emitter = new Emitter();
emitter.listen('start', (action) => {
    console.log(action.bar);
});
emitter.listen('run', (action) => {
    console.log(action.name, action.age);
});
emitter.listen('stop', () => {
    console.log('stop');
});
emitter.dispatch('start', {
    bar: 20
});
emitter.dispatch('run', {
    name: 'Billy',
    age: 20
});
emitter.dispatch('stop');
//# sourceMappingURL=test.js.map