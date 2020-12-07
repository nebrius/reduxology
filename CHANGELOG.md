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
