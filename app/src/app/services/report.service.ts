import { Injectable } from '@angular/core';
import * as Parse from 'parse';
import { User } from './user-service';
import { Place } from './place-service';

@Injectable({
  providedIn: 'root'
})
export class Report extends Parse.Object {

  constructor() {
    super('Report');
  }

  set reason(reason: string) {
    this.set('reason', reason);
  }

  get reason(): string {
    return this.get('reason');
  }

  set place(place: Place) {
    this.set('place', place);
  }

  get place(): Place {
    return this.get('place');
  }

  set reportedBy(user: User) {
    this.set('reportedBy', user);
  }

  get reportedBy(): User {
    return this.get('reportedBy');
  }
}

Parse.Object.registerSubclass('Report', Report);