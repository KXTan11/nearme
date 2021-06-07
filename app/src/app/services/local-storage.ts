import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LocationAddress } from '../models/location-address';

@Injectable({
  providedIn: 'root'
})
export class LocalStorage {

  constructor(private storage: Storage) {
  }

  setSkipIntroPage(val: boolean): Promise<any> {
    return this.storage.set('skipIntroPage', val);
  }

  getSkipIntroPage(): Promise<any> {
    return this.storage.get('skipIntroPage');
  }

  setUnit(val: string): Promise<any> {
    return this.storage.set('unit', val);
  }

  getUnit(): Promise<any> {
    return this.storage.get('unit');
  }

  setLang(val: string): Promise<any> {
    return this.storage.set('lang', val);
  }

  getLang(): Promise<any> {
    return this.storage.get('lang');
  }

  setMapStyle(val: string): Promise<any> {
    return this.storage.set('mapStyle', val);
  }

  getMapStyle(): Promise<any> {
    return this.storage.get('mapStyle');
  }

  getIsPushEnabled(): Promise<boolean> {
    return this.storage.get('isPushEnabled');
  }

  setIsPushEnabled(val: boolean) {
    return this.storage.set('isPushEnabled', val);
  }

  getLastPosition(): Promise<LocationAddress> {
    return this.storage.get('lastPosition');
  }

  setLastPosition(val: LocationAddress) {
    return this.storage.set('lastPosition', val);
  }

}
