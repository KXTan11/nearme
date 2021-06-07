
/// <reference types="@types/googlemaps" />
import { Component, Injector, ViewChild, ElementRef, ComponentFactoryResolver, NgZone } from '@angular/core';
import { Place } from '../../services/place-service';
import { MapStyle } from '../../services/map-style';
import { BasePage } from '../base-page/base-page';
import { LocalStorage } from '../../services/local-storage';
import { InfoWindowComponent } from '../../components/info-window/info-window';
import { environment } from '../../../environments/environment';
import { IonSearchbar } from '@ionic/angular';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { DrawerState } from 'ion-bottom-drawer';
import { DomSanitizer } from '@angular/platform-browser'
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import Utils from 'src/app/utils';
import { Location } from '@angular/common';

@Component({
  selector: 'map-page',
  templateUrl: 'map.html',
  styleUrls: ['map.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class MapPage extends BasePage {

  @ViewChild(IonSearchbar, { static: true }) searchBar: IonSearchbar;
  @ViewChild('map', { static: true }) mapElement: ElementRef;

  protected snazzyInfoWindow: any;

  protected params: any = {
    page: 0
  };

  public suggestions: any = [];
  public places: Place[] = [];

  public bottomDrawerConfig: any = {
    state: DrawerState.Bottom,
    shouldBounce: true,
    disableDrag: true,
    minimumHeight: 0,
    distanceTop: 130,
    dockedHeight: 220,
    transition: '0.25s ease-in-out',
  };

  protected map: google.maps.Map;
  protected geocoder: google.maps.Geocoder;
  protected markers: google.maps.Marker[] = [];
  protected autocompleteService: google.maps.places.AutocompleteService;
  protected placesService: google.maps.places.PlacesService;
  protected myLocationMarker: google.maps.Marker;

  protected mapInitialized: boolean = false;
  public location: any;
  protected zoomMyLocation: boolean = true;

  private placeToInfoWindow: Map<string, any>;
  private activeInfoWindow: any;

  public ionContentStylePadding: any;

  constructor(private injector: Injector,
    public sanitizer: DomSanitizer,
    private zone: NgZone,
    private resolver: ComponentFactoryResolver,
    private storage: LocalStorage,
    private placeService: Place,
    private locationService: Location,
    private geolocationService: GeolocationService) {
    super(injector);
  }

  enableMenuSwipe() {
    return false;
  }

  async ngOnInit() {
    this.setupQueryParams();
  }

  setupQueryParams() {

    const featured = this.getQueryParams().featured;
    if (featured) {
      this.params.featured = featured;
    }

    const cat = this.getQueryParams().cat;
    if (cat) {
      this.params.cat = cat;
    }

    const ratingMin = this.getQueryParams().ratingMin;
    if (ratingMin) {
      this.params.ratingMin =  Number(ratingMin);
    }

    const ratingMax = this.getQueryParams().ratingMax;
    if (ratingMax) {
      this.params.ratingMax =  Number(ratingMax);
    }

    const maxDistance = this.getQueryParams().maxDistance;
    if (maxDistance) {
      this.params.maxDistance = Number(maxDistance);
    }

    let lat = this.getQueryParams().latitude;
    let lng = this.getQueryParams().longitude;

    if (lat && lng) {
      lat = Number(lat);
      lng = Number(lng);
      this.params.latitude = lat;
      this.params.longitude = lng;
    }

    const address = this.getQueryParams().address;

    if (address) {
      this.params.address = this.getQueryParams().address;
    }
  }

  async updateSearchBarValue(val: string) {
    await Utils.sleep(800);
    this.searchBar.value = val;
  }

  async setupDistanceUnit() {

    try {

      const unit = await this.storage.getUnit();

      if (unit === null) {
        this.params.unit = environment.defaultUnit;
      } else {
        this.params.unit = unit;
      }

    } catch (error) {
      this.params.unit = environment.defaultUnit;
    }

    this.preference.unit = this.params.unit;
  }

  async ionViewDidEnter() {

    if (this.params.address) {
      this.updateSearchBarValue(this.params.address);
    }

    if (typeof google == 'undefined' || typeof google.maps == 'undefined') {
      this.loadGoogleMaps();
    } else if (!this.mapInitialized) {
      this.initMap();
    }

    const title = await this.getTrans('MAP');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async loadGoogleMaps() {

    window['mapInit'] = () => {
      this.initMap();
    };

    const apiKey = environment.googleMapsApiKey;

    const script = document.createElement('script');
    script.id = 'googleMaps';
    script.src = `https://maps.google.com/maps/api/js?key=${apiKey}&callback=mapInit&libraries=places`;
    document.body.appendChild(script);
  }

  async initMap() {

    this.snazzyInfoWindow = require('snazzy-info-window');

    this.geocoder = new google.maps.Geocoder();

    this.mapInitialized = true;

    const mapOptions: any = {
      styles: MapStyle.light(),
      zoom: 2,
      center: { lat: 0, lng: 0 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(this.map);

    const text = await this.getTrans('SEARCH_THIS_AREA');

    const component = document.createElement('ion-button');
    component.innerText = text;
    component.shape = 'round';
    component.size = 'small';
    component.setAttribute('margin-top', null);
    component.onclick = () => this.onSearchButtonTapped();

    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(component);

    try {

      await this.setupDistanceUnit();

      let location = null;

      if (this.params.latitude && this.params.longitude) {
        location = {
          latitude: this.params.latitude,
          longitude: this.params.longitude,
        };
      } else {
        location = await this.geolocationService.getCurrentPosition();
      }

      if (location) {
        this.location = location;

        this.loadData();
        this.updateMyLocationMarker(location);
      }

    } catch (err) {
      this.translate.get('ERROR_LOCATION_UNAVAILABLE').subscribe(str => this.showToast(str));
    }
  }

  updateMyLocationMarker(location: any) {

    const latLng = new google.maps.LatLng(
      location.latitude,
      location.longitude
    );

    if (!this.myLocationMarker) {
      this.myLocationMarker = new google.maps.Marker({
        icon: {
          url: './assets/img/dot.png',
          scaledSize: new google.maps.Size(24, 24),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
        },
        position: latLng,
        map: this.map,
      });
    } else {
      this.myLocationMarker.setPosition(latLng);
    }
    
  }

  setMapOnAll(map: any) {
    this.markers.forEach(marker => {
      marker.setMap(map);
    });
  }

  onClearSearchAddress() {
    this.suggestions = [];
  }

  onSearchAddress(event: any = {}) {

    if (!this.mapInitialized) return;

    const query = event.target.value;

    if (query && query.length >= 3) {

      const config = {
        input: query,
      };

      this.autocompleteService.getPlacePredictions(config, (predictions: any) => {
        this.zone.run(() => {
          if (predictions) this.suggestions = predictions;
        });
      });

    }
  }

  onSuggestionTouched(suggestion: any) {

    if (!this.mapInitialized) return;

    this.suggestions = [];

    this.placesService.getDetails({ placeId: suggestion.place_id }, (details: any) => {

      this.zone.run(() => {

        const coords = {
          latitude: details.geometry.location.lat(),
          longitude: details.geometry.location.lng()
        };

        this.map.setCenter({
          lat: coords.latitude,
          lng: coords.longitude
        })

        this.map.setZoom(6);

        this.location = coords;
        this.params.latitude = coords.latitude;
        this.params.longitude = coords.longitude;
        this.params.address = details.formatted_address;
        this.params.bounds = null;
        this.zoomMyLocation = false;

        this.updateSearchBarValue(details.formatted_address);

        this.removeActiveInfoWindow();

        this.setMapOnAll(null);

        this.updateMyLocationMarker(coords);

        this.reloadUrl();

        setTimeout(() => this.loadData(), 400);
      });

    });

  }

  getFilteredParams() {
    const params = Object.assign({}, this.params);

    const allowed = [
      'featured',
      'ratingMin',
      'ratingMax',
      'maxDistance',
      'latitude',
      'longitude',
      'cat',
      'address',
    ];

    return Object.keys(params)
      .filter(key => allowed.includes(key))
      .reduce((obj, key) => {
        obj[key] = params[key]
        return obj
      }, {});
  }

  reloadUrl() {
    const urlTree = this.createUrlTree(this.getFilteredParams());
    this.locationService.go(urlTree.toString());
  }

  setBottomDrawerState(state: DrawerState) {
    this.bottomDrawerConfig.state = state;
    this.updateIonContentStylePadding();
  }

  async loadData() {

    try {

      this.showLoadingView({ showOverlay: false });

      this.places = await this.placeService.load(this.params);

      if (!this.places.length) {
        this.translate.get('EMPTY_PLACES').subscribe(str => this.showToast(str));
        this.showEmptyView();
        this.setBottomDrawerState(DrawerState.Bottom);
      } else {
        this.showContentView();
      }

      this.onPlacesLoaded();

    } catch (err) {
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      this.showErrorView();
      this.setBottomDrawerState(DrawerState.Bottom);
    }
  }

  onPlacesLoaded() {

    setTimeout(() => {

      this.zone.run(() => {

        const bounds = new google.maps.LatLngBounds();
        const points = [];

        this.placeToInfoWindow = new Map<string, any>();

        for (const place of this.places) {

          const position = new google.maps.LatLng(place.location.latitude, place.location.longitude);

          bounds.extend(position);

          const marker = new google.maps.Marker({
            icon: {
              url: place.icon ? place.icon.url() : './assets/img/pin.png',
              scaledSize: new google.maps.Size(32, 32),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 0)
            },
            position: position,
            map: this.map,
          });

          marker.addListener('click', () => {
            this.map.panTo(marker.getPosition());
          });

          this.markers.push(marker);

          const factory = this.resolver.resolveComponentFactory(InfoWindowComponent);
          const component = factory.create(this.injector);
          component.instance.place = place;
          component.instance.location = this.location;
          component.instance.unit = this.params.unit;
          component.changeDetectorRef.detectChanges();

          component.instance.onButtonTouched.subscribe((place: Place) => {
            this.zone.run(() => this.onPlaceTouched(place));
          })

          const infoWindow = new this.snazzyInfoWindow({
            marker: marker,
            content: component.location.nativeElement,
            padding: '0',
            wrapperClass: 'info-window-wrapper',
            showCloseButton: false,
            panOnOpen: false,
            closeWhenOthersOpen: true,
            callbacks: {
              afterOpen: () => {
                this.activeInfoWindow = infoWindow;
                this.setBottomDrawerState(DrawerState.Docked);
              },
            },
            offset: {
              top: '-4px',
              left: '16px'
            }
          });

          this.placeToInfoWindow.set(place.id, infoWindow);

          points.push(position);
        }

        if (this.zoomMyLocation && this.myLocationMarker) {
          bounds.extend(this.myLocationMarker.getPosition());
        }
    
        if (points.length || this.zoomMyLocation) {
          this.map.fitBounds(bounds);
        }
    
        if (!points.length && this.zoomMyLocation) {
          this.map.setZoom(this.map.getZoom() - 8);
        }

      });

    }, 100);

  }

  onReload() {
    this.setMapOnAll(null);
    this.markers = [];
    this.loadData();
  }

  onPlaceTouched(place: Place) {
    this.navigateToRelative('../' + place.id + '/' + place.slug);
  }

  async onSearchButtonTapped() {

    if (!this.mapInitialized) return;

    this.removeActiveInfoWindow();

    const bounds = this.map.getBounds();

    this.params.bounds = [{
      latitude: bounds.getSouthWest().lat(),
      longitude: bounds.getSouthWest().lng(),
    }, {
      latitude: bounds.getNorthEast().lat(),
      longitude: bounds.getNorthEast().lng()
    }];

    this.zoomMyLocation = false;

    await this.showLoadingView({ showOverlay: false });
    this.onReload();
  }

  updateIonContentStylePadding() {

    let style = '--padding-bottom: 0';

    if ((this.isCordova || this.isMobile) && this.bottomDrawerConfig.state === DrawerState.Docked) {
      const toolBarHeight = this.isAndroid ? 56 : 48;
      const padding = this.bottomDrawerConfig.dockedHeight - toolBarHeight;
      style = `--padding-bottom: ${padding}px`;
    }

    this.ionContentStylePadding = this.sanitizer.bypassSecurityTrustStyle(style);
  }

  onBottomDrawerTouched() {
    if (this.bottomDrawerConfig.state === DrawerState.Docked) {
      this.bottomDrawerConfig.state = DrawerState.Top;
    } else {
      this.bottomDrawerConfig.state = DrawerState.Docked;
    }
  }

  onPlaceHover(place: Place) {
    const infoWindow = this.placeToInfoWindow.get(place.id);
    infoWindow.open();
  }

  removeActiveInfoWindow() {
    if (this.activeInfoWindow) {
      this.activeInfoWindow.destroy();
      this.activeInfoWindow = null;
    }
  }

  async showInfoWindow(place: Place, event: Event) {

    event.stopPropagation();

    if (this.bottomDrawerConfig.state === DrawerState.Top) {

      const infoWindow = this.placeToInfoWindow.get(place.id);
      infoWindow.open();

      this.setBottomDrawerState(DrawerState.Docked);

      setTimeout(() => {

        this.map.setCenter({
          lat: place.location.latitude,
          lng: place.location.longitude
        });
  
        this.map.setZoom(14);

      }, 600);
    } else {
      this.bottomDrawerConfig.state = DrawerState.Top;
    }
  }

}
