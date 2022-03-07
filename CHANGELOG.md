## 3.0.2 (2022-03-07)

- Type fixes for handlers of actions with data type `void`

## 3.0.1 (2022-03-07)

- Fixed a bug where `mapStateToProps` and `mapDispatchToProps` might return `null`.

## 3.0.0 (2022-03-07)

- BREAKING CHANGE: action listener parameters have been swapped, with the first now being `getSlice` and the second being the action data.
- BREAKING CHANGE: `createApp` now returns a `React.FunctionComponent` instead of `JSX.Element`
- BREAKING CHANGE: `createContainer` type signature updated to take three generics (props, dispatch, and ownProps) instead of a single argument (the old behavior was a bug)
- BREAKING CHANGE: `createListener` has been renamed to `handle`
  - The old name implied that it behaved similarly to `createReducer`, when in fact it's actually similar to `createReducer().handle()`
- POSSIBLY BREAKING CHANGE: `createReducer` and `handle` (formerly `createListener`) no longer throw after app creation
  - We already prevented reducers and listeners from being created and connected to an app after app creation due to how these are wired up to `createApp`
  - Throwing this exception could, in some circumstances, break apps where stores are destroyed and recreated, such as in Next.js apps
  - `.handle` and similar methods on reducer/listener instances still throw
- Tightened up `createApp` type for component to be `React.Component` instead of `any`
  - If anything other than a `React.Component` instance was passed in, this would have crashed at runtime anyways, and so isn't really a breaking change
- Cleaned up generic names to be more readable

## 2.1.3 (2021-06-06)

- Fixed a bug where container types aren't propagated to parent components properly
- Updated dependencies with breaking changes

## 2.1.2 (2020-01-18)

- Added a better error message when prematurely calling dispatch

## 2.1.1 (2020-12-20)

- Fixed a TypeScript "hole" where container's own properties weren't being passed out to parent components consuming the container

## 2.1.0 (2020-12-06)

- Updated action listeners so they are passed `getSlice` as the second argument, just like containers

## 2.0.0 (2020-11-23)

This is a major rewrite, with some fairly significant changes to the API.

- BREAKING CHANGE: renamed `createRoot` to `createApp` and changed it's signature (see README for details)
- BREAKING CHANGE: renamed `listen` to `createListener`
- BREAKING CHANGE: reworked `createListener` and `createReducer` so they are not automatically attached, and instead return values that must be passed to `createApp`
- BREAKING CHANGE: Removed `reducer#isHandlerRegistered` and `reducer#removeHandler`
- BREAKING CHANGE: action listeners and reducer handlers must be registered before app creation
- Added support for passing in interfaces to strictly type actions and state slices

## 1.1.0 (2020-10-14)

- Added support for own props in containers

## 1.0.0 (2020-08-20)

- Published first release version
