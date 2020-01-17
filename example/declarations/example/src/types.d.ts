export declare const STATE_PATHS: {
    USERS: string;
    APPOINTMENTS: string;
};
export declare const ACTION_TYPES: {
    ADD_APPOINTMENT: string;
    CANCEL_APPOINTMENT: string;
};
export interface Appointment {
    time: number;
    duration: number;
}
export interface AppointmentState {
    appointments: Appointment[];
}
export declare type AddAppointmentActionCreator = (appointment: Appointment) => Appointment;
export declare type CancelAppointmentActionCreator = (appointment: Appointment) => Appointment;
