
/// <reference types="@types/googlemaps" />
import { Component, Injector, ElementRef, ViewChild, NgZone } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Place } from '../../services/place-service';
import { MapStyle } from '../../services/map-style';
import { ParseFile } from '../../services/parse-file-service';
import { Category } from '../../services/categories';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { IonSearchbar } from '@ionic/angular';
import { EmitEvent, EventBusService } from 'src/app/services/event-bus.service';
import { User } from 'src/app/services/user-service';
import { SignInPage } from '../sign-in/sign-in';
import { Package } from 'src/app/services/package';
import { AppConfigService } from 'src/app/services/app-config.service';
import { UserPackage } from 'src/app/services/user-package';
import { PayModalPage } from '../pay-modal/pay-modal.page';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'page-place-add',
  templateUrl: './place-add.html',
  styleUrls: ['./place-add.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class PlaceAddPage extends BasePage {

  @ViewChild('map', { static: true }) mapElement: ElementRef;
  @ViewChild(IonSearchbar, { static: true }) searchBar: IonSearchbar;

  protected location: { lat?: number, lng?: number } = {};

  protected map: google.maps.Map;
  protected geocoder: google.maps.Geocoder;
  protected marker: google.maps.Marker;
  protected autocompleteService: google.maps.places.AutocompleteService;
  protected placesService: google.maps.places.PlacesService;
  protected mapInitialized: boolean = false;

  public suggestions: any = [];

  public form: FormGroup;
  public categories: Category[] = [];
  public slidesConfig = {};
  public mainUpload: ParseFile;
  public uploads: Array<{ file: ParseFile }>;

  public isSaving: boolean;

  public packages: Package[] = [];
  public userPackages: UserPackage[] = [];

  public isPaidListingEnabled: boolean;

  constructor(injector: Injector,
    private zone: NgZone,
    private eventBusService: EventBusService,
    private geolocationService: GeolocationService,
    private packageService: Package,
    private userPackageService: UserPackage,
    private appConfigService: AppConfigService,
    private placeService: Place,
    private categoryService: Category) {
    super(injector);
  }

  enableMenuSwipe() {
    return true;
  }

  async ionViewDidEnter() {

    const title = await this.getTrans('ADD_PLACE');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });

    this.loadData();
  }

  ngOnInit() {
    this.setupImages();
    this.setupForm();
  }

  async loadData() {

    try {

      this.showLoadingView({ showOverlay: false });

      const config = await this.appConfigService.load();

      if (config) {
        const placeSettings = config.places;

        this.isPaidListingEnabled = placeSettings.enablePaidListings;

        if (placeSettings.enablePaidListings) {
          this.packages = await this.packageService.load({
            type: 'paid_listing'
          });
          this.userPackages = await this.userPackageService.load({
            status: 'paid',
            type: 'paid_listing',
            isLimitReached: false
          });
          this.form.controls.package.setValidators(Validators.required);
          this.form.controls.package.updateValueAndValidity();
        }
      }

      this.categories = await this.categoryService.load();

      this.showContentView();

      if (typeof google == 'undefined' || typeof google.maps == 'undefined') {
        this.loadGoogleMaps();
      } else {
        this.initMap();
      }

    } catch (error) {
      this.showErrorView();
    }

  }

  setupImages() {
    this.uploads = Array
      .from({ length: 9 })
      .map(i => { return { file: null } });
  }

  setupForm() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      category: new FormControl(null, Validators.required),
      package: new FormControl(null),
      description: new FormControl(''),
      address: new FormControl(''),
      phone: new FormControl(''),
      website: new FormControl(''),
    });
  }

  onMainFileUploaded(file: ParseFile) {
    this.mainUpload = file;
  }

  onFileUploaded(file: ParseFile, upload: any) {
    upload.file = file;
  }

  compareCategory(category: Category, category1: Category): boolean {
    return category && category1 ? category.id === category1.id : category === category1;
  }

  loadGoogleMaps() {

    window['mapInit'] = () => {
      this.zone.run(() => this.initMap());
    }

    const apiKey = environment.googleMapsApiKey;

    const script = document.createElement('script');
    script.id = 'googleMaps';
    script.src = `https://maps.google.com/maps/api/js?key=${apiKey}&callback=mapInit&libraries=places`;
    document.body.appendChild(script);

  }

  async initMap() {

    this.mapInitialized = true;

    this.geocoder = new google.maps.Geocoder();

    const mapOptions: any = {
      styles: MapStyle.light(),
      zoom: 2,
      center: { lat: 0, lng: 0 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    google.maps.event.addListener(this.map, 'dragend', () => {

      const center = this.map.getCenter();

      this.setMarkerPosition(center);
      this.location.lat = center.lat();
      this.location.lng = center.lng();

      this.geocoder.geocode({ location: center }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {

        if (status === google.maps.GeocoderStatus.OK) {
          const target = results[0];
          this.searchBar.value = target.formatted_address;
          this.form.controls.address.setValue(target.formatted_address);
        }
      });

    });

    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(this.map);

    try {

      const coords = await this.geolocationService.getCurrentPosition();

      if (!coords) {
        return this.translate.get('ERROR_LOCATION_UNAVAILABLE')
          .subscribe(str => this.showToast(str));
      }

      this.location.lat = coords.latitude;
      this.location.lng = coords.longitude;

      this.setMarkerPosition(this.location);

      this.map.panTo({
        lat: coords.latitude,
        lng: coords.longitude
      });
      this.map.setZoom(15);

    } catch (err) {

    }
  }

  setMarkerPosition(position: any) {

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        icon: {
          url: './assets/img/pin.png',
          size: new google.maps.Size(64, 64),
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(18, 32),
        },
        position: position,
        map: this.map,
      });
    } else {
      this.marker.setPosition(position);
    }
  }

  onSuggestionTouched(suggestion: any) {

    if (!this.mapInitialized) return;

    this.suggestions = [];

    this.placesService.getDetails({ placeId: suggestion.place_id }, (details: any) => {

      this.zone.run(() => {

        const location = details.geometry.location;

        this.searchBar.value = details.formatted_address;
        this.form.controls.address.setValue(details.formatted_address);

        this.setMarkerPosition(location);

        this.map.panTo(location);
        this.map.setZoom(15);

        this.location.lat = location.lat();
        this.location.lng = location.lng();
      });

    });

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

  preparePlaceData(): Place {

    let place: any = {};

    const formData = Object.assign({}, this.form.value);

    place.packageId = formData.package;
    place.title = formData.name;
    place.category = formData.category.toPointer();
    place.description = formData.description;
    place.address = formData.address;
    place.website = formData.website;
    place.phone = formData.phone;
    place.image = this.mainUpload;

    place.images = this.uploads
      .filter(item => item.file)
      .map(item => item.file);

    if (this.location) {

      let position = {
        lat: this.location.lat,
        lng: this.location.lng
      };

      place.location = position;
    }

    return place;
  }

  async openSignInModal() {

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: SignInPage
    });

    await modal.present();

    await this.dismissLoadingView();
  }

  async presentPayModalPage(place: Place, userPackage: UserPackage) {
    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: PayModalPage,
      componentProps: { place, userPackage },
      cssClass: 'pay-modal'
    });

    await modal.present();

    await this.dismissLoadingView();

    return await modal.onDidDismiss();
  }

  async onSubmit() {

    if (!User.getCurrent()) return this.openSignInModal();

    if (this.form.invalid) {
      const trans = await this.getTrans('INVALID_FORM');
      return this.showToast(trans);
    }

    if (!this.location) {
      const trans = await this.getTrans('INVALID_LOCATION');
      return this.showToast(trans);
    }

    try {

      this.isSaving = true;

      const payload = this.preparePlaceData();
      const { place, userPackage } = await this.placeService.createInCloud(payload);

      this.eventBusService.emit(new EmitEvent('place:add'));

      this.form.reset();

      this.isSaving = false;

      const trans = await this.getTrans(['GOOD_JOB', 'PLACE_ADDED', 'OK'])

      const sweetAlertOptions: SweetAlertOptions = {
        title: trans.GOOD_JOB,
        text: trans.PLACE_ADDED,
        confirmButtonText: trans.OK,
        icon: 'success',
        heightAuto: false,
        customClass: {
          popup: 'fade-in'
        },
      };

      if (this.isPaidListingEnabled && userPackage.status === 'unpaid') {
        const { data } = await this.presentPayModalPage(place, userPackage);

        if (data) {
          await Swal.fire(sweetAlertOptions);
        }

        await this.setRoot('/');
        this.navigateTo('/1/profile/places');

      } else {
        await Swal.fire(sweetAlertOptions);
        await this.setRoot('/');
        this.navigateTo('/1/profile/places');
      }

    } catch (err) {
      this.isSaving = false;

      if (err.code === 5000) {
        this.translate.get('PACKAGE_CANNOT_PURCHASE_MULTIPLE_TIMES')
          .subscribe(str => this.showToast(str));
      } else if (err.code === 5001) {
        this.translate.get('PACKAGE_PURCHASE_LIMIT_REACHED')
          .subscribe(str => this.showToast(str));
      } else {
        this.translate.get('ERROR_NETWORK')
          .subscribe(str => this.showToast(str));
      }

    }

  }

}
