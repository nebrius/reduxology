import * as React from 'react';
import { Appointment } from './types';
export interface MyComponentProps {
    appointments: Appointment[];
}
export interface MyComponentDispatch {
    addAppointment: (appointment: Appointment) => void;
}
export declare class MyComponent extends React.Component<MyComponentProps & MyComponentDispatch, null> {
    render(): JSX.Element;
    onClick: () => void;
}
