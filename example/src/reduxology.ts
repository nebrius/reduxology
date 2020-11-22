import { Reduxology } from 'reduxology';
import { Actions, State } from './types';

const reduxology = new Reduxology<State, Actions>();

export const createContainer = reduxology.createContainer;
export const createReducer = reduxology.createReducer;
export const createRoot = reduxology.createRoot;
export const dispatch = reduxology.dispatch;
export const listen = reduxology.listen;
