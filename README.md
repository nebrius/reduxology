# Redux Wiring <!-- omit in toc -->

**Note: this library is still alpha stage and there may be bugs. I'm grateful for any and all issues filed with bugs, feedback, and other thoughts you may have!**

1. [Installation](#installation)
2. [Usage](#usage)
   1. [Actions](#actions)
   2. [State](#state)
   3. [Reducers](#reducers)
   4. [Containers](#containers)
   5. [App Initialization](#app-initialization)
3. [Motivation](#motivation)
4. [API](#api)
   1. [createContainer(mapStateToProps, mapDispatchToProps, component) => React Redux Container](#createcontainermapstatetoprops-mapdispatchtoprops-component--react-redux-container)
   2. [createReducer(slice, initialData) => Reducer](#createreducerslice-initialdata--reducer)
      1. [Reducer#handle(actionType, handler) => Reducer](#reducerhandleactiontype-handler--reducer)
      2. [Reducer#removeHandler(actionType)](#reducerremovehandleractiontype)
      3. [Reducer#isHandlerRegistered(actionType) => boolean](#reducerishandlerregisteredactiontype--boolean)
   3. [createRoot(container) => React Component](#createrootcontainer--react-component)
   4. [dispatch(actionType, ...data)](#dispatchactiontype-data)
   5. [new ReduxWiring()](#new-reduxwiring)
5. [License](#license)

Redux Wiring is a library that makes creating Redux-based React applications easier to create by automating a lot of the "wiring" required. In other words, this library automates and hides much of the boilerplate necessary in typical Redux apps. It also introduces a slightly tweaked model for actions and state, making them more symmetrical and evenly-abstracted.

In practice, this library is a wrapper for `redux` and `react-redux` in your application, replacing the need to use them directly.

Since this module is still new, this README is written with the assumption that you already understand the concepts of [React](https://reactjs.org/), [Redux](https://redux.js.org/), and [React-Redux](https://react-redux.js.org/). If this library takes off, I will of course invest in creating better documentation.

## Installation

Install with npm:

```
npm install redux-wiring
```

If you're a TypeScript user, you don't need to do anything else. This module is written in TypeScript, and includes type definitions in the module itself.

## Usage

From a conceptual perspective, using this library is effectively same as using React+Redux, just with a different syntax. So we'll go through the major concepts and describe how they work here.

For a complete example, check out the [example in this repo](example/). For a real-world application, check out the renderer half of my Electron.js application [Contact Scheduler](https://github.com/nebrius/contact-scheduler/tree/upgrade/renderer).

### Actions

There aren't any actual APIs for working with actions in React+Redux, but they're an important concept. In traditional React, an action is an object with a `type` property that reducers use to determine how to react to them. In many ways, actions are a lot like standard events in JavaScript with only minor differences in shape.

In Redux Wiring, actions are modified to look more like events in vanilla JavaScript. In Redux Wiring, actions are not an object with a `type` property, but rather a relationship between a string identifying the type of event, and arbitrary piece(s) of data representing the rest of the action. Containers and reducers both interact with actions with this same abstraction, as we'll see in the sections on reducers and containers below.

### State

State has been remixed in Redux Wiring so that it looks a lot like actions, for similar reasons. A _slice_ of state, i.e. the part of state created by a single reducer, now has an accompanying _slice type_. This slice type is directly analogous to an action type, and is used to differentiate one slice of data from another. This is the largest change from typical Redux.

In Redux, the location of this slice in the store is implicit in the structure of the store for data consumers, and implicit in the `combineReducers` calls for reducers. In Redux Wiring, the slice type is used to explicitly define the slice location. As we'll see below, consuming state in a container now looks a lot like using a `Map` object, except that there is no setter.

### Reducers

To create a reducer, we use the `createReducer()` function. We pass in two arguments: the slice type, and the data to initialize this reducer with. This function returns an object that we can register _action handlers_ with. An action handler is very similar to an event handler. An action handler listens for a specific action type, and calls the function when the action type is dispatched.

There is are two core differences between an action handler and an event listener. Each action type can only have _one_ action handler associated with it, and `registerActionHandler` will throw an exception if you try to register more than one handler. This is because of the second core difference: action handlers return the new state at the end, whereas event listeners don't return anything. This returned value is the new state created from the old state and the action. Allowing more than one action handler would make the multiple return values ambiguous.

Each action handler uses [Immer](https://immerjs.github.io/immer/docs/introduction) under the hood, which means you don't have to create a complete copy of the state, or use a library like Immutable.js. You can just modify properties as you see fit and the rest is taken care of.

```JavaScript
import { createReducer } from 'redux-wiring';

const init = {
  appointments: []
};

createReducer('APPOINTMENTS', init)

  .handle('ADD_APPOINTMENT', (state, time, duration) => {
    state.appointments.push({ time, duration });
  })

  .handle('CANCEL_APPOINTMENT', (state, appointmentToCancel) => {
    for (let i = 0; i < state.appointments.length; i++) {
      if (state.appointments[i].time === appointmentToCancel.time) {
        state.appointments.splice(i, 1);
      }
    }
  });
```

Note: if you do not need to handle any actions and just need the state to exist, you do not need to make any calls to `registerActionHandler`.

### Containers

Containers look quite similar to existing containers, except that there is a single function call to `createContainer()` instead of a double call to `connect()` and the function it returns. The first argument is mapStateToProps, and the second is mapDispatchToProps, same as in react-redux.

The biggest difference is with the `state` object passed in. In traditional React-Redux the state parameter passed in is a plain ole JavaScript object, but the state object in Redux Wiring is a little different. It's an object with a getter. You call `state.getType()` with a state type, and it returns that piece of state. This mirrors the value returned from the reducer handler passed to `handle()`.

```JavaScript
import { createContainer } from 'redux-wiring';
import { AppComponent } from './components';

export const AppContainer = createContainer(
  (state) => {
    return {
      appointments: state.getSlice('APPOINTMENTS').appointments
    };
  },
  (dispatch) => {
    return {
      addAppointment(time, duration) {
        dispatch('ADD_APPOINTMENT', time, duration);
      },
      cancelAppointment(appointment) {
        dispatch('CANCEL_APPOINTMENT', appointment);
      }
    };
  },
  AppComponent
);
```

### App Initialization

Redux Wiring provides a helper function called `createRoot` that creates a `<Provider store={store}></Provider` React element for you, and automatically wires the store into it.

```JavaScript
import { render } from 'react-dom';
import { createRoot } from 'redux-wiring';
import { AppContainer } from './containers';

import './reducers';

render(
  createRoot(AppContainer),
  document.getElementById('root')
);
```

## Motivation

I've written many React apps, most small, some large. I've also taught React to a number of folks. One of the things I see more junior developers get hung up on is wiring all the pieces together.

When we talk about React+Redux and separation of concerns, we tend to only talk about the _data flow_ separation between parts of a React+Redux app. And React+Redux is _very_ good at constraining data flow such that it's easy to test and reason about.

But what about _data dependency_? These are...less one directional. To illustrate this, let's discuss three different areas: reducers, containers, and actions.

### Actions <!-- omit in toc -->

Let's start by talking about actions. In a typical Redux application, we use _action creators_ to, well, create an action. These are effectively helper functions that take in specific parameters and create a action (which is really just an object with those parameters, and a `type` property to indicate the type). An example action creator for the ADD_APPOINTMENT action illustrated above would look like:

```JavaScript
function createAddAppointmentAction(time, duration) {
  return {
    type: 'ADD_APPOINTMENT',
    appointment: {
      time,
      duration
    }
  };
}
```

These are a nice encapsulation that makes it easier to create actions, which happens in a container. In addition, the container creating the action doesn't need to know the shape of the action object, a nice encapsulation!

But what about _consuming_ actions, which happens in reducers? There is no equivalent helper to consume an action, which undermines the utility of these helpers, since there is still a _data dependency_ on the output of an action creator inside the reducer.

### Reducers and Containers <!-- omit in toc -->

Next, let's talk about reducers. Reducers take in the application's current state and an action, and produce a new state. One of the nice ways reducers are encapsulated is that each reducer is only responsible for a _subsection_ of data, and don't need to know anything about the data in the rest of the store. This is really great, and one of the things I love most about them. Below is an example:

```JavaScript
const appointmentsReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [ ...state.appointments, action.appointment ]
      };
    case 'CANCEL_APPOINTMENT':
      for (let i = 0; i < state.appointments.length; i++) {
        if (state.appointments[i].time === appointmentToCancel.time) {
          state = {
            ...state,
            appointments: [ ...appointments ]
          };
          state.appointments.splice(i, 1);
        }
      }
      return state;
  }
};

combineReducers({
  appointments: appointmentsReducer,
  ...
});
```

This approach breaks down in one subtle way though, and that has to do with _where_ this data exists in the store. The data has to exist somewhere, so that's not the issue. The issue has to do with how this location is _expressed_.

Reducers know about this location by how they are combined together with the `combineReducers` calls. The location ends up being implicit, and one of the niceties of this is that you can migrate data produced by a reducer from one location to another without modifying the reducer itself, just the `combineReducers` call.

But what about those that _consume_ this data, namely containers? There is no equivalent mechanism to abstract the data from the location of that data, as we can see in the related container below:

```JavaScript
function mapStateToProps(appState) {
  return {
     // Note the full path to data shows up here. Knowing which path to use requires
     // knowledge of how the various `combineReducers` calls are scaffolded
    appointments: appState.appointments.appointments
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addAppointment(appointment) {
      dispatch(createAddAppointmentAction(appointment));
    },
    cancelAppointment(appointment) {
      dispatch(createCancelAppointmentAction(appointment));
    }
  };
}

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(AppComponent);
```

Worse, the way this location is defined cannot be reused between reducers and containers. You have to manually verify the paths are correct on both sides by hand without the aid of autocompletion, _even if you're using TypeScript_. Indeed this is the single greatest struggle I've had with TypeScript and React+Redux, because I had to effectively duplicate types manually between these two parts of the application.

### Conclusion <!-- omit in toc -->

So now we can see that there is an issue with _symmetry_ here. The way that actions are created vs consumed is different, with one side being well abstracted and the other not. The way that data is created vs consumed is the same, with one side being well abstracted and the other not. This imbalance diminishes the usefulness of these abstractions, and in my experience has led to confusion among more junior developers. This partial abstraction makes a lot of the code look like magic, and can lead to not understanding why some things require manual coding and others don't.

Thinking through this more, there is another bit of implicit symmetry here: state and actions are both data that flows through the system. They do represent very different types of data, so these are not things that should be merged. But it is an observation that can influence API design.

In addition to this somewhat muddy view of data dependencies vs data flow, there's also the fact that you just have to do a lot of _stuff_ to connect all the pieces together. When we look at a dependency graph of a codebase, the unidirectional flow of data tends to fall away, and indirect two-way dependencies tend to be common.

This library aims to address all of these issues to varying degrees, while keeping the things about React+Redux that makes them such an amazing way to create UIs.

## API

### createContainer(mapStateToProps, mapDispatchToProps, component) => React Redux Container

Creates a container, in the React Redux sense, for use as a React component.

_Arguments:_

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>mapStateToProps</td>
      <td>Function</td>
      <td>A mapStateToProps function, passed directly to React Redux' <code>connect()</code> function. <a href="https://react-redux.js.org/api/connect#mapstatetoprops-state-ownprops-object">See the React Redux documentation for details.</a></td>
    </tr>
    <tr>
      <td>mapDispatchToProps</td>
      <td>Function</td>
      <td>A mapDispatchToProps function, analogous to the <a href="https://react-redux.js.org/api/connect#mapdispatchtoprops-object-dispatch-ownprops-object">second function passed to <code>connect()</code></a> in React Redux. The dispatch argument passed to this function is slightly different though. See the global <a href="#dispatch">dispatch function</a> for details.</a></td>
    </tr>
    <tr>
      <td>component</td>
      <td>React Component</td>
      <td>A React component to wrap in this container, analogous to the component argument passed to the function returned from <code>connect()</code> in React Redux</td>
    </tr>
  </tbody>
</table>

_Return value:_

A React Redux container, which can be used directly as a React component. This is the same value returned from React Redux' `connect()()` functions. [See the React Redux documentation for more information](https://react-redux.js.org/api/connect#connect-returns).

### createReducer(slice, initialData) => Reducer

Creates and connects a reducer. Calling this function handles all of the plumbing for reducers. Meaning, once you call this function, you do not need to call anything else to connect or initialize this reducer.

_Arguments:_

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>slice</td>
      <td>String</td>
      <td>The slide ID that this reducer will reduce data to</td>
    </tr>
    <tr>
      <td>initialData</td>
      <td>Any</td>
      <td>The data to initialize this reducer slice with. It can be any value of any data type.</td>
    </tr>
  </tbody>
</table>

_Return value:_

A reducer object that you can use to connect action handlers to. See the Reducer documentation below for details.

#### Reducer#handle(actionType, handler) => Reducer

Adds an action handler to the reducer. Note: there can only be one handler registered for a given action type at a time.

_Arguments:_

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>actionType</td>
      <td>string</td>
      <td>The user-defined action type to handle</td>
    </tr>
    <tr>
      <td>handler</td>
      <td>Function</td>
      <td>The handler to invoke when an action specified by <code>actionType</code> is dispatched.</td>
    </tr>
    <tr>
       <td></td>
       <td colspan="2">
         <table>
           <thead>
             <tr>
               <th>Argument</th>
               <th>Type</th>
               <th>Description</th>
             </tr>
           </thead>
           <tbody>
              <tr>
                <td>state</td>
                <td>any</td>
                <td>The current state slice. This value is wrapped in a call to Immer's <code>produce()</code> function, and can be mutated safely.</td>
              </tr>
             <tr>
               <td>...data</td>
               <td>any</td>
               <td>Each action can dispatch zero to many arguments, and are passed in after the <code>state argument</code> in the order they were passed to the <code>dispatch()</code> function.</td>
             </tr>
           </tbody>
          </table>
        </td>
      </tr>
  </tbody>
</table>

_Return value:_

Returns the reducer that `handle()` was called on, so that you can chain multiple `handle()` calls together.

_Throws:_

This function will throw an exception if you try to register a handler to an action type that already has a handler registered to it.

#### Reducer#removeHandler(actionType)

Removes the action handler for the given action type, if it exists. If there is no handler registered for the given action type, this function completes silently and does not throw an exception.

_Arguments:_

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>actionType</td>
      <td>string</td>
      <td>The user-defined action type to remove a handler from</td>
    </tr>
  </tbody>
</table>

_Return value:_

None.

#### Reducer#isHandlerRegistered(actionType) => boolean

Checks if there is a handler registered for a given action type.

_Arguments:_

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>actionType</td>
      <td>string</td>
      <td>The user-defined action type to check if a handler exists for</td>
    </tr>
  </tbody>
</table>

_Return value:_

A boolean value indicating whether or not a handler has been registered for the given action type.

### createRoot(container) => React Component

Creates a root-level React component to be passed to React's `render()` method. This function creates the store for you and attaches it to a React Redux `<Provider>` component, and attaches the supplied container as the one and only child to it.

_Arguments:_

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>container</td>
      <td>React Redux Container</td>
      <td>The container to attach, as returned from <code>createContainer()</code></td>
    </tr>
  </tbody>
</table>

_Return value:_

A React component containing the `<Provider>` component and supplied container.

### dispatch(actionType, ...data)

_Arguments:_

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>actionType</td>
      <td>String</td>
      <td></td>
    </tr>
    <tr>
      <td>...data</td>
      <td>any</td>
      <td>You can dispatch any number of arguments of any type (including no arguments), and they are passed in order to any registered action handlers registered to reducers.</td>
    </tr>
  </tbody>
</table>

_Return value:_

None.

### new ReduxWiring()

Creates a new Redux Wiring instance which will have its own store associated with it. Each of the previous methods described in this README are present on the ReduxWiring instance. All of the previous methods are, in fact, part of a ReduxWiring object that is created for you automatically behind the scenes.

## License

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
