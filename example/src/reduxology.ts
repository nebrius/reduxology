import { Reduxology } from 'reduxology';
import { Actions, State } from './types';

const reduxology = new Reduxology<State, Actions>();

export const createContainer = reduxology.createContainer;
export const createReducer = reduxology.createReducer;
export const createListener = reduxology.createListener;
export const createApp = reduxology.createApp;
export const dispatch = reduxology.dispatch;
