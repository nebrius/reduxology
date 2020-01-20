# Redux Wiring

**Note: this library is still alpha stage and there may be bugs. I'm grateful for any and all issues filed with bugs, feedback, and other thoughts you may have!**

1. [Installation](#installation)
1. [Usage](#usage)
    1. [Actions](#actions)
    1. [State](#state)
    1. [Reducers](#reducers)
    1. [Containers](#containers)
    1. [App Initialization](#app-initialization)
1. [Motivation](#motivation)
1. [API](#api)
1. [License](#license)

Redux Wiring is a library that makes creating Redux-based React applications easier to create by automating a lot of the "wiring" required. In otherwords, this library automates and hides much of the boilerplate necessary in typical Redux apps. It also introduces a slightly tweaked model for actions and state, making them more symmetrical and evenly-abstracted.

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

In Redux Wiring, actions are modified to look more like events in vanilla JavaScript. In Redux Wiring, actions are not an object with a `type` property, but rather a pair of entities: a string identifying the type of event, and an arbitrary piece of data representing the reset of the action. Containers and reducers both interact with actions with this same abstraction, as we'll see in the sections on reducers and container below.

### State

State has been remixed in Redux Wiring so that it looks a lot like actions, for similar reasons. A _subsection_ of state, i.e. the part of state created by a single reducer, now has an accompanying _data type_. This data type is directly analagous to an action type, and is used to differentiate one subsection of data from another. This is the largest change from typical Redux.

In Redux, this subsection is implicit in the structure of the store for data consumers, and implicit in the `combineReducers` calls for reducers. In Redux Wiring, the data type is used to explicitly define subsections. As we'll see below, consuming state in a container now looks a lot like using a `Map` object, except that there is no setter.

### Reducers

To create a reducer, we use the `createReducer()` method. We pass in two arguments: the data type, and the data to initialize this reducer with. This method returns an object that we can register _action handlers_ with. An action handler is very similar to an event handler. An action handler listens for a specific action type, and calls the method when the action type is dispatched.

There is are two core differences between an action handler and an event listener. Each action type can only have _one_ action handler associated with it, and `registerActionHandler` will throw an exception if you try to register more than one handler. This is because of the second core difference: action handlers return the new state at the end, whereas event listeners don't return anything. This returned value is the new state created from the old state and the action. Allowing more than one action handler would make the multiple return values ambiguous.

Each action handler uses [Immer](https://immerjs.github.io/immer/docs/introduction) under the hood, which means you don't have to create a complete copy of the state, or use a library like Immutable.js. You can just modify properties as you see fit and the rest is taken care of.

```JavaScript
import { createReducer } from 'redux-wiring';

const init = {
  appointments: []
};

createReducer('APPOINTMENTS', init)

  .handle('ADD_APPOINTMENT', (state, newAppointment) => {
    state.appointments.push(newAppointment);
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

Containers look quite similar to existing containers, except that there is a single method call to `createContainer` instead of a double call to `connect()` and the function it returns. The first argument is mapStateToProps, and the second is mapDispatchToProps, same as in react-redux.

The biggest difference is with the `state` object passed in. In traditional React-Redux the state parameter passed in is a plain ole JavaScript object, but the state object in Redux Wiring is a little different. It's an object with a getter. You call `getState` with a state type, and it returns that piece of state. This mirrors the value returned from the reducer handler passed to `registerActionHandler`.

```JavaScript
import { createContainer } from 'redux-wiring';
import { AppComponent } from './components';

export const AppContainer = createContainer(
  (state) => {
    return {
      appointments: state.getType('APPOINTMENTS').appointments
    };
  },
  (dispatch) => {
    return {
      addAppointment(appointment) {
        dispatch('ADD_APPOINTMENT', appointment);
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

Redux Wiring provides a helper method called `createRoot` that creates a `<Provider store={store}></Provider` React element for you, and automatically wires the store into it.

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

I've written many React apps, most small, some large. I've also taught React to a number of folks. One of the things I see more junior developers get hung up on is wiring the app together.

When we talk about React+Redux and separation of concerns, we tend to only talk about the _data flow_ between parts of a React+Redux app. And React+Redux is _very_ good at constraining data flow such that it's easy to test and reason about.

But what about _data dependency_ (as well as _code depdency_)? These are...less one directional. To illustrate this, let's discuss three different areas: reducers, containers, and actions.

Let's start by talking about actions. In a typical Redux application, we use _action creators_ to, well, create an action. These are effectivey helper functions that take in specific parameters and create a action (which is really just an object with those parameters, and a `type` property to indicate the type). These are a nice encapsulation that makes it easier to create actions, which happens in a container. But what about _consuming_ actions, which happens in reducers? There is no equivalent helper to consume an action, which undermines the utility of these helpers, since there is still a _data dependency_ on the output of an action creator on an external piece of code.

Next, let's talk about reducers. Reducers take in the applications current state and an action, and produce a new state. One of the nice ways reducers are encapsulated is that each reducer is only responsible for a _subsection_ of data, and don't need to know anything about the data in the rest of the store. This is really great, and one of the things I love most about them. This breaks down in one subtle way though, and that has to do with _where_ this data exists in the store. The data has to exist somewhere, so that's not the issue. The issue has to do with how this location is _expressed_. Reducers know about this location by how they are combined together with the `combineReducers` calls. The location ends up being implicit, and one of the nicities of this is that you can migrate data produced by a reducer from one location to another without modifying the reducer. But what about those that _consume_ this data, namely containers? There is no equivalent mechanism to abstract the data from the location of that data. Worse, the way this location is defined cannot be reused between reducers and containers. This is especially true if you're using TypeScript, and indeed this is the single greatest struggle I've had with TypeScript and React+Redux, because I had to effectively duplicate types manually between these two parts of the application.

So now we can see that there is an issue with _symmetry_ here. The way that actions are created vs consumed is different, with one side being well abstracted and the other not. The way that data is created vs consumed is the same, with one side being well abstracted and the other not. This imbalance diminishes the usefulness of these abstractions, and IME has led to confusion among more junior developers. This partial abstraction makes a lot of the code look like magic, while not understanding why some things require manual coding and others don't.

Thinking through this more, there is another bit of implicit symmetry here: state and actions are both data that flows through the system. They do represent very different types of data, so these are not things that should be merged. But it is an observation that can influence API design.

In addition to this somewhat muddy view of data dependencies vs data flow, there's also the fact that you just have to do a lot of _stuff_ to connect all the pieces together. When we look at a dependency graph of a codebase, the unidirectional flow of data tends to fall away, and indirect two-way dependencies tend to be common.

This library aims to address all of these issues to varying degrees, while keeping the things about React+Redux that makes them such an amazing way to create UIs.

## API

Coming soon!

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
