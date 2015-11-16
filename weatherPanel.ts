// Firebase Observable Demo App
// Kyle Cordes, Oasis Digital, November 2015

// This component displays a single entry from Firebase on the screen.
// there is an unsolved problem, noted below.

import {Component, CORE_DIRECTIVES, Observable, AsyncPipe, JsonPipe, Input, OnInit} from 'angular2/angular2';

import {observableFirebaseObject, observableFirebaseArray} from './observableFirebase.ts';
import {NgWhen} from './ngWhen.ts';
import {SecondsToDatePipe} from './secondsToDatePipe.ts'

declare var Firebase: any;

var template = `
  <h3>Weather for {{city}}:</h3>
  <div *ng-when="#c is currently | async">
    <p>current temperature: {{ c.temperature }}</p>
    <p>current windSpeed: {{ c.windSpeed }}</p>
  </div>

  <table class="table table-condensed">
    <tr>
      <th>Time</th>
      <th>Temp</th>
      <th>Precip</th>
    </tr>
    <tr *ng-for="#d of hourly | async">
      <td>{{ d.time | secondsToDate | date:'H:m:s' }}</td>
      <td>{{ d.temperature }}</td>
      <td>{{ d.precipIntensity }}</td>
    </tr>
  </table>
`;

@Component({
  selector: 'weather-panel',
  template: template,
  directives: [CORE_DIRECTIVES, NgWhen],
  pipes: [AsyncPipe, JsonPipe, SecondsToDatePipe]
})
export class WeatherPanel implements OnInit {
  @Input()
  city: string;

  currently: Observable<any>;
  hourly: Observable<any[]>;

  onInit() {
    //  This can't be called in the constructor because the properties
    // from the parent template are not yet populated.

    const weatherURL = "https://publicdata-weather.firebaseio.com/";
    let city = new Firebase(weatherURL).child(this.city);

    this.currently = observableFirebaseObject(
      city.child("currently"));

    this.hourly = observableFirebaseArray(
      city.child("hourly/data").limitToLast(10));
  }
}
