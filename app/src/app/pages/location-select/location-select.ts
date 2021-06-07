import { Component, Injector, NgZone, ViewChild } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import Utils from 'src/app/utils';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'page-location-select',
  templateUrl: './location-select.html',
  styleUrls: ['./location-select.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class LocationSelectPage extends BasePage {

  @ViewChild(IonSearchbar) searchBar: IonSearchbar;

  protected map: google.maps.Map;
  protected autocompleteService: any;
  protected placesService: any;

  public places: any = [];
  public isLoading: boolean;
  public mapInitialized: boolean;

  constructor(injector: Injector,
    public zone: NgZone,
    public modalCtrl: ModalController) {
    super(injector);
  }

  enableMenuSwipe() {
    return true;
  }

  async ngOnInit() {

    this.showEmptyView();

    if (typeof google == 'undefined' || typeof google.maps == 'undefined') {
      this.loadGoogleMaps();
    } else {
      this.initMap();
    }
  }

  async ionViewDidEnter() {
    await Utils.sleep(1000);
    this.searchBar.setFocus();
  }

  async loadGoogleMaps() {

    window['mapInit'] = () => {
      this.initMap();
    }

    const apiKey = environment.googleMapsApiKey;

    let script = document.createElement('script');
    script.id = 'googleMaps';
    script.src = `https://maps.google.com/maps/api/js?key=${apiKey}&callback=mapInit&libraries=places`;
    document.body.appendChild(script);

  }

  async initMap() {
    this.mapInitialized = true;
    this.map = new google.maps.Map(document.createElement('div'));
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(this.map);
  }

  onPlaceTouched(place: any) {

    this.showLoadingView({ showOverlay: false });

    this.placesService.getDetails({ placeId: place.place_id }, (details: any) => {
      this.zone.run(() => {
        this.dismissLoadingView();
        this.onDismiss(details);
      });
    });

  }

  onClear() {
    this.isLoading = false;
    this.places = [];
    this.showEmptyView();
  }

  onSearchAddress(event: any = {}) {

    const query = event.target.value;

    if (query && query.length >= 3 && this.map) {

      this.showContentView();

      const config = {
        input: query,
      };

      this.isLoading = true;

      this.autocompleteService.getPlacePredictions(config, (predictions: any) => {
        this.zone.run(() => {
          this.isLoading = false;
          if (predictions) {
            this.places = predictions;
          }
        });
      });
    }

  }

  onDismiss(place: any = null) {
    this.modalCtrl.dismiss(place);
  }

}
