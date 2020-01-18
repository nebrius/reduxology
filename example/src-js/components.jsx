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
import * as React from "react";
export class AppComponent extends React.Component {
  constructor() {
    super(...arguments);
    this.onClick = () => {
      this.props.addAppointment({
        time: Date.now(),
        duration: 30
      });
    };
  }
  render() {
    return (
      <div>
        {this.props.appointments.map(appointment => (
          <AppointmentComponent
            key={appointment.time}
            appointment={appointment}
            cancelAppointment={this.props.cancelAppointment}
          />
        ))}
        <button onClick={this.onClick}>Add Appointment</button>
      </div>
    );
  }
}
class AppointmentComponent extends React.Component {
  constructor() {
    super(...arguments);
    this.onClick = () => {
      this.props.cancelAppointment(this.props.appointment);
    };
  }
  render() {
    const { time, duration } = this.props.appointment;
    return (
      <div>
        <span>
          {new Date(time).toString()} ({duration} minutes)
        </span>
        <button onClick={this.onClick}>X</button>
      </div>
    );
  }
}