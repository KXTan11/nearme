import { Injectable } from '@angular/core';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from "@ionic-native/diagnostic/ngx";
import { Platform } from "@ionic/angular";
import * as Parse from 'parse';
import { LocalStorage } from './local-storage';
import { LocationAddress } from '../models/location-address';
import { GeocoderService } from './geocoder.service';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  private lastPosition: LocationAddress;

  constructor(private geolocation: Geolocation,
    private platform: Platform,
    private diagnostic: Diagnostic,
    private geocoderService: GeocoderService,
    private storage: LocalStorage) { }

  setCurrentPosition(location: LocationAddress): Promise<LocationAddress> {
    this.lastPosition = location;
    return this.storage.setLastPosition(location);
  }

  async getCurrentPosition(): Promise<LocationAddress> {

    if (!this.lastPosition) {
      try {
        const savedPosition = await this.storage.getLastPosition();

        if (savedPosition) {
          this.lastPosition = savedPosition;
        }

      } catch (error) {
        console.warn(error);
      }
    }

    if (this.lastPosition) {
      return this.lastPosition;
    }

    let isGranted = true;

    if (this.platform.is('cordova')) {
      await this.platform.ready();

      const isLocationAuthorized = await this.diagnostic.isLocationAuthorized();

      if (!isLocationAuthorized) {
        const status = await this.diagnostic.requestLocationAuthorization();

        const validStatus = [
          this.diagnostic.permissionStatus.GRANTED,
          this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE,
        ];

        isGranted = validStatus.includes(status);

      } else {
        isGranted = isLocationAuthorized;
      }
    }

    if (!isGranted) return null;

    let locationAddress: LocationAddress = null;

    try {

      const options: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      const { coords } = await this.geolocation.getCurrentPosition(options);

      locationAddress = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

    } catch (error) {
      console.log(error);
    }

    if (locationAddress === null) {

      try {
        const res = await this.geocoderService.ipToGeo();
        locationAddress = {
          latitude: Number(res.latitude),
          longitude: Number(res.longitude),
        }
      } catch (error) {
        return null;
      }

    }

    try {

      const data = await this.geocoderService.reverse({
        lat: locationAddress.latitude,
        lng: locationAddress.longitude,
      });

      let address = '';

      if (data.results && data.results.length) {
        address = data.results[0].formatted_address;
      }

      locationAddress.address = address;
      this.lastPosition = locationAddress;
      this.storage.setLastPosition(this.lastPosition);

    } catch (error) {
      return null;
    }

    return this.lastPosition;

  }

  toParseGeoPoint(coords: any): Parse.GeoPoint {
    return new Parse.GeoPoint(coords.latitude, coords.longitude);
  }
}
