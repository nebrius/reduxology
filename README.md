# Reduxology <!-- omit in toc -->

- [Installation](#installation)
- [Usage](#usage)
  - [Actions](#actions)
  - [State](#state)
  - [Reducers](#reducers)
  - [Action Listeners](#action-listeners)
  - [Containers](#containers)
  - [App Creation](#app-creation)
  - [Using Existing Redux Middleware](#using-existing-redux-middleware)
- [Strict Typing with TypeScript](#strict-typing-with-typescript)
- [Motivation](#motivation)
- [API](#api)
  - [createContainer(mapStateToProps, mapDispatchToProps, component) => React Redux Container](#createcontainermapstatetoprops-mapdispatchtoprops-component--react-redux-container)
  - [createReducer(sliceName, initialData) => Reducer](#createreducerslicename-initialdata--reducer)
    - [Reducer#handle(actionType, handler) => Reducer](#reducerhandleactiontype-handler--reducer)
  - [handle(actionType, listener)](#handleactiontype-listener)
  - [createApp(options) => React Component](#createappoptions--react-component)
  - [dispatch(actionType, data?)](#dispatchactiontype-data)
  - [new Reduxology()](#new-reduxology)
- [License](#license)

Reduxology is a library that makes creating Redux-based React applications easier. This library automates and hides much of the boilerplate necessary in typical Redux apps. It also introduces a slightly tweaked model for actions and state, making these abstractions more consistent and user friendly.

In practice, this library is a wrapper for `redux` and `react-redux` in your application, replacing the need to use them directly. It is similar to [Redux Toolkit](https://redux-toolkit.js.org/), except that it also abstracts [React Redux](https://react-redux.js.org/) and is a replacement for both libraries.

This README is written with the assumption that you already understand the concepts of [React](https://reactjs.org/), [Redux](https://redux.js.org/), and [React Redux](https://react-redux.js.org/). If this library takes off, I will invest in creating better documentation.

## Installation

Install with npm:

```
npm install reduxology
```

If you're a TypeScript user, you don't need to do anything else. This module is written in TypeScript, and includes type definitions in the module itself.

## Usage

From a conceptual perspective, using this library is effectively same as using React+Redux, just with a different syntax. So we'll go through the major concepts and describe how they work here.

For a complete example, check out the [example in this repo](example/). For a real-world application, check out the client of my [Home Lights](https://github.com/rvl-system/home-lights) project.

### Actions

There aren't any actual APIs for working with actions in Reduxology or React+Redux, but they're an important concept. In traditional React, an action is an object with a `type` property that reducers use to determine how to react to an action. In many ways, actions are a lot like standard events in JavaScript with only minor differences in shape and usage.

In Reduxology, actions are modified to look more directly like events in JavaScript. In Reduxology, actions are not an object with a `type` property, but rather a relationship between a string identifying the type of event, and an arbitrary piece of data representing the rest of the action. Containers and reducers both interact with actions with this same abstraction, as we'll see in the sections on reducers and containers below.

### State

State has been remixed in Reduxology so that it looks a lot like actions, for similar reasons. A _slice_ of state, i.e. the part of state created by a single reducer, now has an accompanying _slice name_. This slice name is directly analogous to an action type, and is used to differentiate one slice of data from another. This is the largest change from typical Redux.

In vanilla Redux, the location of a slice in the store is implicit in the structure of the store for data consumers, and implicit in the `combineReducers` calls for reducers. In Reduxology, the slice name is used to explicitly define the slice location in both data consumers (containers) and data creators (reducers).

### Reducers

To create a reducer, we use the [createReducer()](#createreducerslicename-initialdata--reducer) function. We pass in two arguments: the slice name, and the data to initialize this reducer with. This function returns an object that we can register _action handlers_ with, which run the actual reducer code. An action handler is very similar to an event handler. An action handler listens for a specific action type, and calls the associated function when the action type is dispatched.

There are two core differences between an action handler and an event listener. Each action type can only have _one_ action handler associated with it per reducer. [handle()](#reducerhandleactiontype-handler--reducer) will throw an exception if you try to register more than one handler for the same action.

This happens because of the second core difference between an action handler and an event listener: action handlers produce changes based on the action that updates state, whereas event listeners don't produce anything. Allowing more than one action handler would make the resulting state change produced by the multiple handlers ambiguous.

Each action handler uses [Immer](https://immerjs.github.io/immer/docs/introduction) under the hood, which means you don't have to create a complete copy of the state like you need to in vanilla Redux. You can modify properties as you see fit and the rest is taken care of.

```JavaScript
// reducers.ts
import { createReducer } from 'reduxology';
import { v4 as uuidv4 } from 'uuid';

const init = {
  appointments: []
};

export const appointmentsReducer = createReducer('Appointments', init)

  .handle('AddAppointment', (state, appointmentData) => {
    state.appointments.push({ ...appointmentData, id: uuidv4() });
  })

  .handle('CancelAppointment', (state, appointmentToCancel) => {
    for (let i = 0; i < state.appointments.length; i++) {
      if (state.appointments[i].id === appointmentToCancel.id) {
        state.appointments.splice(i, 1);
        break;
      }
    }
  });
```
The returned value from the `createReducer` is used to register the reducer with Reduxology, as we'll see later.

_Note:_ you do not need to register any handlers to create the reducer. The reducer will exist and return slice data in the `init` value passed in. This is useful if you want to create a reducer to expose initialization data through Redux that will not change throughout the lifetime of the application

### Action Listeners

An action listener is a function that is invoked when a specific action is dispatched, similar to a reducer handler. The key difference between a reducer handler and an action listener is that an action listener _cannot_ change state, but _can_ do operations with side effects. Action listeners are the place to perform API calls, browser navigations, etc. An action listener is virtually indistinguishable from a general JavaScript event listener in practice. Action listeners are registered using the [handle()](#handleactiontype-listener) function.

For example, if you wanted to make an API call that fetches an item after a user clicks a button that dispatches a `RequestItem` action, you could write something like this:

```JavaScript
// listeners.ts
import { handle, dispatch } from 'reduxology';

export const requestItemListener = handle('RequestItem', async (id) => {
  try {
    const response = await fetch(`/api/items/${id}/`);
    const data = await response.json();
    dispatch('ItemFetched', {id, data});
  } catch (e) {
    dispatch('ItemFetchFailed', id);
  }
});
```

Action listeners are implemented as Redux middleware under the hood, and inherits several behavioral traits from middleware. Most importantly, action listeners are run _before_ reducer handlers.

Unlike traditional middleware, this function does _not_ provide a mechanism for modifying state. This was done intentionally to keep the API simple and address the most common use case for middleware. This also makes action listeners a safe place to perform side effects without affecting how we reason about state changes.

In some cases, you may need access to other parts of state in your listener in addition to the action data. Each listener is passed `getSlice` as the second argument, like you get in containers. This allows you to pull in any state you need.

Technical note: Although this action listener is an `async` function, action listeners are _not_ `await`ed by Reduxology. This means that the action dispatch is not blocked by the listener, and will continue being dispatched at the first `await` in the function.

### Containers

Containers look quite similar to vanilla React-Redux containers, except that there is a single function call to [createContainer()](#createcontainermapstatetoprops-mapdispatchtoprops-component--react-redux-container) instead of a double call to `connect()` and the function it returns. The first argument is mapStateToProps, and the second is mapDispatchToProps, same as in React Redux.

A key difference between React-Redux and Reduxology is the argument passed to the mapStateToProps function. In traditional React-Redux this argument is a plain old JavaScript object containing the entire state, typically called `state`. In Reduxology, this argument is a function, typically called `getSlice`. Your container can then call `getSlice()` with a slice name, and it returns that piece of state. At first, this value will be the same as the initialization value passed to [createReducer()](#createreducerslicename-initialdata--reducer).

```JavaScript
// containers.ts
import { createContainer } from 'reduxology';
import { AppComponent } from './components';

export const AppContainer = createContainer(
  (getSlice) => ({
    appointments: getSlice('Appointments').appointments
  }),
  (dispatch) => ({
    addAppointment(time, duration) {
      dispatch('AddAppointment', { time, duration });
    },
    cancelAppointment(appointment) {
      dispatch('CancelAppointment', { appointment });
    }
  }),
  AppComponent
);
```

### App Creation

Reduxology provides a function called [createApp()](#createappoptions--react-component) that ties everything together. This function returns a functioning React element you can pass to React's `render` method. Under the hood, it creates a `<Provider>` React-Redux element for you and automatically wires the store, reducers, and action listeners into it.

```JavaScript
// index.ts
import { render } from 'react-dom';
import { createApp } from 'reduxology';
import { AppContainer } from './containers';
import { appointmentsReducer } from './reducers';
import { requestItemListener } from './listeners';

const app = createApp({
  container: AppContainer,
  reducers: [appointmentsReducer],
  listeners: [requestItemListener]
});

render(
  app,
  document.getElementById('root')
);
```

### Using Existing Redux Middleware

Reduxology supports using existing Redux middleware via the [createApp()](#createappoptions--react-component) function detailed above. This is useful if you want to pass in off-the-shelf Redux middleware, such as [redux-thunk](https://github.com/reduxjs/redux-thunk) or [redux-saga](https://github.com/redux-saga/redux-saga).

## Strict Typing with TypeScript

Reduxology provides a way to strictly type all of your actions and state slices throughout the app. All of the functions we saw in the above examples are actually methods on a class. This class is [generic](https://www.typescriptlang.org/docs/handbook/generics.html), and takes two generic parameters to define your state and actions, respectively.

I recommend you create a file that is imported by all your files that use Reduxology. Here is the example project's `reduxology.ts` file with this aliasing:

```TypeScript
import { Reduxology } from 'reduxology';
import { Actions, State } from './types';

const reduxology = new Reduxology<State, Actions>();

export const createContainer = reduxology.createContainer;
export const createReducer = reduxology.createReducer;
export const handle = reduxology.handle;
export const createApp = reduxology.createApp;
export const dispatch = reduxology.dispatch;
```

_Note:_ All of the methods on the `Reduxology` class are properly bound, so you don't need to worry about binding `this` manually.

The `types.ts` file is implemented as:

```TypeScript
export interface Appointment {
  id: number;
  time: number;
  duration: number;
}

export interface Actions {
  AddAppointment: {
    time: number;
    duration: number;
  };
  CancelAppointment: Appointment;
}

export interface State {
  Appointments: Appointment[];
}
```

The `State` generic parameter is set to an `interface`. Each property in the interface is the slice name, and the type of that property is the shape of the slice data. Similarly, the `Actions` generic parameter is set to an `interface` as well. Each property in the interface is the action type, and the type of that property is the data associated with that action type or `void` if there is no data.

With these generics in place, you now get strict type checking in your `createReducer`, `reducer.handle`, `handle`, and `createContainer` functions. Any attempt to access an invalid slice name or action type will throw an error. Additionally, the data associated with those calls is strictly typed too. To see this in action, let's consider some examples.

This compiles properly:

```TypeScript
const addAppointmentListener = handle(
  'AddAppointment',
  ({ time, duration }) => console.log(time, duration)
);
```

This fails to compile because `Incorrect` isn't a known action.

```TypeScript
const addAppointmentListener = handle(
  'Incorrect',
  ({ time, duration }) => console.log(time, duration)
);
```

This also fails to compile, because `incorrect` isn't part of the `AddAppointment` action:

```TypeScript
const addAppointmentListener = handle(
  'AddAppointment',
  ({ incorrect }) => console.log(incorrect)
);
```

The implementation for this type checking is based on Brian Terlsen's fantastic [strict-event-emitter-types](https://github.com/bterlson/strict-event-emitter-types) library.

## Motivation

I've written many React apps, some small, some large. I've also taught React to a number of folks. Many developers, especially junior developers, get tripped up on understanding what all the pieces do, and how to connect them together. I've been thinking hard on this problem for a while, and I think I've figured out where the confusion comes from.

When we talk about React+Redux and separation of concerns, we tend to talk about the _data flow_ separation between parts of a React+Redux app, specifically how data flows _one way_. And React+Redux is _very_ good at constraining data flow such that it's easy to test and reason about.

But what about _data dependency_, e.g. how are multiple pieces of the app dependant on the shape of a piece of data, and how is that shape defined? This is where vanilla Redux stumbles, in my opinion. To illustrate this, let's discuss the three core concepts in React+Redux: reducers, containers, and actions.

### Actions <!-- omit in toc -->

Let's start by talking about actions. In a typical Redux application, we use _action creators_ to, well, create an action. These are effectively helper functions that take in specific parameters and create an action. An example action creator for the `AddAppointment` action illustrated above would look like:

```JavaScript
function createAddAppointmentAction(time, duration) {
  return {
    type: 'AddAppointment',
    appointment: {
      time,
      duration
    }
  };
}
```

These are a nice encapsulation that makes it easier to create actions, which happens in a container. In addition, the container that's creating the action doesn't need to know the shape of the action object, a nice encapsulation!

But what about _consuming_ these actions, which happens in reducers? There is no equivalent helper to consume an action in a reducer. This undermines the value of the abstraction created by the action creator because there is still a _data dependency_ on the output of an action creator inside the reducer. The shape of this data is only abstracted in half our code!

### Reducers and Containers <!-- omit in toc -->

Next, let's talk about reducers and containers. At a high level, reducers and containers are mirror images of each other. A reducer consumes an action and produces state, while a container consumes state and produces actions (indirectly through a child component). This is a nice level of symmetry in the design.

Reducers take in the application's current state plus an action, and produce a new state. One of the nice ways reducers are encapsulated is that each reducer is only responsible for a _subsection_ of state, called a _slice_ in Redux parlance. Reducers don't need to know anything about the state in the rest of the store. This is really great, and one of the things I love most about reducers. Below is an example:

```JavaScript
import { v4 as uuidv4 } from 'uuid';

const appointmentsReducer = (state, action) => {
  switch (action.type) {
    case 'AddAppointment':
      const newAppointment = {
        ...action.appointment,
        id: uuidv4()
      }
      return {
        ...state,
        appointments: [ ...state.appointments, newAppointment ]
      };
    case 'CancelAppointment':
      for (let i = 0; i < state.appointments.length; i++) {
        if (state.appointments[i].id === appointmentToCancel.id) {
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

This approach breaks down in one subtle way though, and that has to do with _where_ this state exists in the store. The state has to exist somewhere, so that's not an issue in and of itself. The issue has to do with how the location in the store is _expressed_.

Reducers define this location in how they are combined together with the `combineReducers` calls. The location ends up being implicit, and one of the niceties of this is that you can rename a slice that a reducer operates on without modifying the reducer itself, just the `combineReducers` call.

Similar to action creators, we have a nice encapsulation here. But what about those that _consume_ this state, i.e. containers? There is no equivalent mechanism to abstract the state from the location of that state, as we can see in the related container below:

```JavaScript
function mapStateToProps(appState) {
  return {
     // Note the full path to state shows up here. Knowing which "path" to use
     // requires knowledge of how the various `combineReducers` calls are scaffolded
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

Worse, the way this location is defined cannot be reused between reducers and containers. You have to manually verify the paths are correct separately in containers and combineReducers calls by hand, _even if you're using TypeScript_. Indeed, this is the biggest struggle I've had with TypeScript and React+Redux, because I had to effectively duplicate type information manually between these two parts of the application.

### Conclusion <!-- omit in toc -->

After reflecting on these issues, I realized that we have an issue with the _consistency_ of our abstractions in vanilla React+Redux. The way that actions are created vs consumed is different, with the container side being well abstracted and the reducer side not. The way that state is created vs consumed is the same but flipped, with the reducer side being well abstracted and the container side not. This imbalance diminishes the usefulness of these abstractions, and in my experience has led to confusion among developers, especially junior developers. This partial abstraction makes a lot of the code look like magic, and can lead to not understanding why some things require manual coding and others don't.

Thinking through the architecture of Redux more, there is another bit of implicit symmetry: state and actions are both data that flows through the system. They do represent very different types of data, so these are not things that should be combined. But, it is an observation that has influenced the API design of Reduxology.

In addition to Redux' somewhat muddy view of data dependencies vs data flow, there's also just a lot of _stuff_ you have to do to connect all the pieces together. When we look at a dependency graph of a codebase based on `import` statements, the unidirectional flow of data tends to be obscured by all the scaffolding around it.

Reduxology aims to address all of these issues to varying degrees, while keeping all the benefits of React+Redux that makes them such an amazing way to create UIs.

## API

_Note:_ Any property or argument with a "?" after it is optional

### createContainer(mapStateToProps, mapDispatchToProps, component) => React Redux Container

Creates a container, in the React Redux sense, for use as a React component.

**_Arguments:_**

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
      <td>mapStateToProps(getSlice, ownProps?)</td>
      <td>Function</td>
      <td>A mapStateToProps function, analogous to the first argument passed to <code>connect()</code></a> in React Redux. This function takes in the current state, and returns the props for the React component passed to <code>createContainer</code></td>
    </tr>
    <tr>
      <td></td>
      <td colspan="2">
        <em>Arguments:</em>
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
              <td>getSlice(sliceName)</td>
              <td>Function</td>
              <td>Gets a state slice from the global state object</td>
            </tr>
            <tr>
              <td></td>
              <td colspan="2">
                <em>Arguments:</em>
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
                      <td>getSlice</td>
                      <td>Function</td>
                      <td>Gets a state slice from the global state object</td>
                    </tr>
                  </tbody>
                </table>
                <br /><em>Return Value:</em>
                <div>The requested state slice value.</div>
                <br /><em>Throws:</em>
                <div>An exception is thrown if an invalid state slice name is passed in.</div>
              </td>
            </tr>
            <tr>
              <td>ownProps</td>
              <td>Object</td>
              <td>The properties passed to the container from its parent component</td>
            </tr>
          </tbody>
        </table>
        <br /><em>Return Value:</em>
        <div>The state-derived props to be passed to the React component this container is wrapping.</div>
      </td>
    </tr>
    <tr>
      <td>mapDispatchToProps(dispatch, ownProps?)</td>
      <td>Function</td>
      <td>A mapDispatchToProps function, analogous to the second argument passed to <code>connect()</code></a> in React Redux. The dispatch argument passed to this function is different from the dispatch argument in React Redux mapDispatchToProps.</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="2">
        <em>Arguments:</em>
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
              <td>dispatch(type, data?)</td>
              <td>Function</td>
              <td>See the global <a href="#dispatchactiontype-data">dispatch function</a> for a description of how this argument is used.</a></td>
            </tr>
            <tr>
              <td>ownProps</td>
              <td>Object</td>
              <td>The properties passed to the container from its parent component</td>
            </tr>
          </tbody>
        </table>
        <br /><em>Return Value:</em>
        <div>Dispatch-derived props to be passed to the React component this container is wrapping.</div>
      </td>
    </tr>
    <tr>
      <td>component</td>
      <td>React Component</td>
      <td>A React component to wrap in this container, analogous to the component argument passed to the function returned from <code>connect()</code> in React Redux</td>
    </tr>
  </tbody>
</table>

**_Return value:_**

A React Redux container, which can be used directly as a React component. This is the same value returned from React Redux' `connect()()` functions. [See the React Redux documentation for more information](https://react-redux.js.org/api/connect#connect-returns).

### createReducer(sliceName, initialData) => Reducer

Creates a reducer.

**_Arguments:_**

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
      <td>sliceName</td>
      <td>String</td>
      <td>The slide name that this reducer will reduce data to</td>
    </tr>
    <tr>
      <td>initialData</td>
      <td>Any</td>
      <td>The data to initialize this reducer slice with. It can be any value of any data type.</td>
    </tr>
  </tbody>
</table>

**_Return value:_**

A reducer object that you can use to connect action handlers to. See the Reducer documentation below for details.

#### Reducer#handle(actionType, handler) => Reducer

Adds an action handler to the reducer. Note: there can only be one handler registered for a given action type at a time.

**_Arguments:_**

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
      <td>handler(state, action?)</td>
      <td>Function</td>
      <td>The handler to invoke when an action specified by <code>actionType</code> is dispatched.</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="2">
        <em>Arguments:</em>
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
              <td>action?</td>
              <td>any</td>
              <td>The action data that was passed to the <a href="#dispatchactiontype-data">dispatch function</a>.</td>
            </tr>
          </tbody>
        </table>
        <br /><em>Return Value:</em>
        <div>None.</div>
      </td>
    </tr>
  </tbody>
</table>

**_Return value:_**

Returns the reducer that `handle()` was called on, so that you can chain multiple `handle()` calls together.

**_Throws:_**

This function will throw an exception if you try to register a handler to an action type that already has a handler registered to it.

**_Return value:_**

A boolean value indicating whether or not a handler has been registered for the given action type.

### handle(actionType, listener)

Creates a listener for the given action. This method is useful for connecting API calls to actions.

**_Arguments:_**

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
      <td>The type of action to listen for</td>
    </tr>
    <tr>
      <td>listener(data, getSlice)</td>
      <td>any</td>
      <td>A listener that will receive the action data.</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="2">
        <em>Arguments:</em>
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
              <td>data</td>
              <td>any or undefined</td>
              <td>Data associated with the action, as passed to the <a href="#dispatchactiontype-data">dispatch function</a>.</td>
            </tr>
            <tr>
              <td>getSlice(sliceName)</td>
              <td>Function</td>
              <td>Gets a state slice from the global state object</td>
            </tr>
          </tbody>
        </table>
        <br /><em>Return Value:</em>
        <div>None.</div>
      </td>
    </tr>
  </tbody>
</table>

**_Return value:_**

None.

### createApp(options) => React Component

Creates a root-level React component to be passed to React's `render()` method. This function creates the store for you and attaches it to a React Redux `<Provider>` component, attaches the supplied container as the one and only child to it, and wires in the supplied reducers and listeners.

**_Options:_**

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>container</td>
      <td>React Redux Container</td>
      <td>The container to attach, as returned from <a href="#createcontainermapstatetoprops-mapdispatchtoprops-component--react-redux-container">createContainer()</a></td>
    </tr>
    <tr>
      <td>reducers?</td>
      <td>Array of Reducers</td>
      <td>An array of reducers to wire up, created via <a href="#createreducerslicename-initialdata--reducer">createReducer()</a></td>
    </tr>
    <tr>
      <td>listeners?</td>
      <td>Array of Listeners</td>
      <td>An array of listeners to wire up, created via <a href="#handleactiontype-listener">handle()</a></td>
    </tr>
    <tr>
      <td>middleware?</td>
      <td>Array of Redux Middleware</td>
      <td>Any additional Redux middleware you'd like to attach to the Redux instance, e.g. <a href="https://github.com/reduxjs/redux-thunk">redux-thunk</a> or <a href="https://github.com/redux-saga/redux-saga">redux-saga</a>. These middleware can be passed in as-is without modification. They are passed to the Redux `applyMiddleware` method directly, so there's no need to call `applyMiddleware` yourself.<br /><br />Note: the value for store, next, and action used by the middleware are the raw under-the-hood variants, not the Reduxology variants. I soon hope to implement some helper methods you can use to convert actions and the store to the Reduxology variants.</td>
    </tr>
  </tbody>
</table>

**_Return value:_**

A React component containing the `<Provider>` component and supplied container.

### dispatch(actionType, data?)

Dispatches an action in a global context. This function is useful if you have actions that are not generated by the UI, such as receiving a Web Socket message from a server.

_Note:_ this function should not be used in the place of the `dispatch` parameter passed to a container's mapDispatchToProps.

**_Arguments:_**

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
      <td>The type of action to dispatch</td>
    </tr>
    <tr>
      <td>data?</td>
      <td>any</td>
      <td>Data associated with the action</td>
    </tr>
  </tbody>
</table>

**_Return value:_**

None.

### new Reduxology()

Creates a new Reduxology instance which will have its own store associated with it. Each of the previous methods described in the API section are present on the Reduxology instance. All of the previous methods are, in fact, part of a Reduxology instance that is created for you automatically behind the scenes.

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
