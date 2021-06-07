import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeocoderService {

  constructor(private httpClient: HttpClient) { }

  public reverse(coords: { lat: any, lng: any }): Promise<any> {

    const url = `https://maps.googleapis.com/maps/api/geocode/json`;

    let params = new HttpParams();
    params = params.append('latlng', `${coords.lat},${coords.lng}`);
    params = params.append('key', environment.googleMapsApiKey);

    return this.httpClient.get(url, { params }).toPromise();
  }

  public ipToGeo(): Promise<any> {
    const url = `https://get.geojs.io/v1/ip/geo.json`;
    let params = new HttpParams();
    return this.httpClient.get(url, { params }).toPromise();
  }
}
