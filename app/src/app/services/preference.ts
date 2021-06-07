import { Injectable } from '@angular/core';
import { LocationAddress } from '../models/location-address';

@Injectable({
  providedIn: 'root'
})
export class Preference {

  private _unit: string;
  private _mapStyle: string;
  private _lang: string;
  private _isPushEnabled: boolean;
  private _location: LocationAddress;

  get unit(): any {
    return this._unit;
  }

  set unit(val) {
    this._unit = val;
  }

  get mapStyle(): any {
    return this._mapStyle;
  }

  set mapStyle(val) {
    this._mapStyle = val;
  }

  get lang(): any {
    return this._lang;
  }

  set lang(val) {
    this._lang = val;
  }

  get isPushEnabled(): any {
    return this._isPushEnabled;
  }

  set isPushEnabled(val) {
    this._isPushEnabled = val;
  }

  get location(): LocationAddress {
    return this._location;
  }

  set location(val) {
    this._location = val;
  }

}
