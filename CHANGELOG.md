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
