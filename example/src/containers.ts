/*
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
*/

import { createContainer } from 'reduxology';
import { AppComponent, AppComponentProps, AppComponentDispatch } from './components';
import { STATE_PATHS, ACTION_TYPES, AppointmentState } from './types';

export const AppContainer = createContainer(
  (state): AppComponentProps => {
    const appointmentState: AppointmentState = state.getSlice(STATE_PATHS.APPOINTMENTS);
    return {
      appointments: appointmentState.appointments
    };
  },
  (dispatch): AppComponentDispatch => {
    return {
      addAppointment(time, duration) {
        dispatch(ACTION_TYPES.ADD_APPOINTMENT, time, duration);
      },
      cancelAppointment(appointment) {
        dispatch(ACTION_TYPES.CANCEL_APPOINTMENT, appointment);
      }
    };
  },
  AppComponent);
