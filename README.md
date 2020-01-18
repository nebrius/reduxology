# Redux Wiring

Redux Wiring is a library that makes creating Redux-based React applications easier to create by automating a lot of the "wiring" required. In otherwords, this library automates and hides much of the boilerplate necessary in typical Redux apps. In practice, this library is a wrapper for `redux` and `react-redux` in your application, replacing the need to use them directly.

Redux Wiring is a more-opinionated layer that sits on top of Redux (and React Redux) and removes the need for a lot of Redux biolerplate, at the expense of some flexibility. It also introduces a slightly tweaked model for actions.

Since this module is still new, this README is written with the assumption that you already understand the concepts of [React](https://reactjs.org/), [Redux](https://redux.js.org/), and [React-Redux](https://react-redux.js.org/). If this library takes off, I will of course invest in creating better documentation.

## Installation

Install with npm:

```
npm install redux-wiring
```

If you're a TypeScript user, you don't need to do anything else. This module is written in TypeScript, and includes type definitions in the module itself.

## Usage

### Actions

### Reducers

```JavaScript
import { createReducer } from 'redux-wiring';

const initData = {
  appointments: []
};

createReducer('APPOINTMENTS', initData)
  .registerActionHandler('ADD_APPOINTMENT', (state, newAppointment) => {
      return {
        ...state,
        appointments: [ ...state.appointments, newAppointment ]
      };
    })
  .registerActionHandler('CANCEL_APPOINTMENT', (state, appointment) => {
      const index = state.appointments.indexOf(appointment);
      state.appointments.splice(index, 1);
      return {
        ...state,
        appointments: state.appointments
      };
    });
```

### Containers

```JavaScript
import { createContainer } from 'redux-wiring';
import { AppComponent } from './components';

export const AppContainer = createContainer(
  (state) => {
    const appointmentState = state.getState('APPOINTMENTS');
    return { appointments: appointmentState.appointments };
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

### Initialization

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

So now we can see that there is an issue with _symmetry_ here. The way that actions are created vs consumed is different, with one side being well abstracted and the othe rnot. The way that data is created vs consumed is the same, with one side being well abstracted and the other not. This imbalance diminishes the usefulness of these abstractions, and IME has led to confusion among more junior developers. This partial abstraction makes a lot of the code look like magic, while not understanding why some things require manual coding and others don't.

Thinking through this more, there is another bit of implicit symmetry here: state and actions are both data that flows through the system. They do represent very different types of data, so these are not things that should be merged. But it is an observation that can influence API design.

In addition to this somewhat muddy view of data dependencies vs data flow, there's also the fact that you just have to do a lot of _stuff_ to connect all the pieces together. When we look at a dependency graph of a codebase, the unidirectional flow of data tends to fall away, and indirect two-way dependencies tend to be common.

This library aims to address all of these issues to varying degrees, while keeping the things about React+Redux that makes them such an amazing way to create UIs.

# License

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
