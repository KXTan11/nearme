import { Component, Injector, ViewChild } from '@angular/core';
import { IonContent, IonSlides } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import * as Parse from 'parse';
import { Category } from '../../services/categories';
import { Place } from '../../services/place-service';
import { Subject, Observable, merge } from 'rxjs';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { EventBusService, EmitEvent } from 'src/app/services/event-bus.service';
import { Slide } from 'src/app/services/slider-image';
import { LocationSelectPage } from '../location-select/location-select';
import { LocalStorage } from 'src/app/services/local-storage';
import { LocationAddress } from 'src/app/models/location-address';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'home-page',
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomePage extends BasePage {

  @ViewChild(IonContent, { static: true }) container: IonContent;
  @ViewChild(IonSlides, { static: true }) ionSlides: IonSlides;

  public slides: Slide[] = [];
  public featuredPlaces: Place[] = [];
  public newPlaces: Place[] = [];
  public places: Place[] = [];
  public nearbyPlaces: Place[] = [];

  public categories: Category[] = [];

  public params: any = {
    page: -1,
    limit: 4,
  };

  public slideOpts = {};

  public skeletonArray: any;

  public location: any;

  public slidesTopEvent: Subject<any>;
  public slidesTopObservable: Observable<any>;

  public horizontalScroll: Subject<any>;
  public onHorizontalScroll: Observable<any>;

  public contentLoaded: Subject<any>;
  public loadAndScroll: Observable<any>;

  constructor(injector: Injector,
    private localStorage: LocalStorage,
    private geolocationService: GeolocationService,
    private placeService: Place,
    private eventBusService: EventBusService) {
    super(injector);

    this.skeletonArray = Array(6);
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  async ionViewDidEnter() {
    const title = await this.getTrans('APP_NAME');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  ionViewWillEnter() {
    if (this.container) {
      this.container.scrollToTop();
    }
    if (this.ionSlides) {
      this.ionSlides.startAutoplay();
    }
  }

  ionViewWillLeave() {
    if (this.ionSlides) {
      this.ionSlides.stopAutoplay();
    }
  }

  async ngOnInit() {
    this.setupObservables();
    this.setupSliders();

    await this.showLoadingView({ showOverlay: false });
    await this.setupDistanceUnit();
    this.onReload();
  }

  async setupDistanceUnit() {

    try {

      const unit = await this.localStorage.getUnit();

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

  async onReload(event: any = {}) {
    this.refresher = event.target;
    this.showLoadingView({ showOverlay: false });

    const location = await this.geolocationService.getCurrentPosition();

    if (!location) {
      this.onRefreshComplete();
      return this.showErrorView();
    }

    const point = this.geolocationService.toParseGeoPoint(location);

    this.eventBusService.emit(new EmitEvent('installation:update', {
      location: point
    }));

    this.location = location;
    this.params.latitude = location.latitude;
    this.params.longitude = location.longitude;
    this.params.address = location.address;

    this.loadData();
  }

  onLogoTouched() {
    this.container.scrollToTop(300);
  }

  onScroll() {
    this.horizontalScroll.next();
  }

  onSlidesTopDidLoad() {
    this.slidesTopEvent.next();
  }

  onSlidesTopWillChange() {
    this.slidesTopEvent.next();
  }

  onContentLoaded() {
    this.contentLoaded.next();
  }

  setupObservables() {

    this.slidesTopEvent = new Subject();
    this.horizontalScroll = new Subject();
    this.contentLoaded = new Subject();

    this.loadAndScroll = merge(
      this.container.ionScroll,
      this.horizontalScroll,
      this.contentLoaded,
      this.slidesTopEvent,
    );
  }

  setupSliders() {
    this.slideOpts = {
      autoplay: {
        delay: 7000
      },
      spaceBetween: 16,
      zoom: false,
      touchStartPreventDefault: false
    };
  }

  async loadData() {

    try {

      const data: any = await Parse.Cloud.run('getHomePageData', this.params);

      this.newPlaces = data.newPlaces || [];
      this.featuredPlaces = data.featuredPlaces || [];
      this.nearbyPlaces = data.nearbyPlaces || [];
      this.categories = data.categories || [];
      this.slides = data.slides || [];

      this.onRefreshComplete();
      this.showContentView();
      this.onContentLoaded();

    } catch (error) {

      this.showErrorView();
      this.onRefreshComplete();

      this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));

      if (error.code === 209) {
        this.eventBusService.emit(new EmitEvent('user:logout'));
      }

    }

  }

  async loadMorePlaces() {

    try {

      const places = await this.placeService.load({
        page: this.params.page++,
        sortBy: 'desc',
        sortByField: 'createdAt',
        ...this.params
      });

      for (const place of places) {
        this.places.push(place);
      }

      this.onRefreshComplete(places);

    } catch (error) {
      this.onRefreshComplete();
      this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));
    }

  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.loadMorePlaces();
  }

  onPlaceTouched(place: Place) {
    this.navigateToRelative('/places/' + place.id + '/' + place.slug);
  }

  async onPresentLocationSelectModal() {

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: LocationSelectPage
    });

    await modal.present();

    this.dismissLoadingView();

    const { data } = await modal.onDidDismiss();

    if (data) {

      const location: LocationAddress = {
        address: data.formatted_address,
        latitude: data.geometry.location.lat(),
        longitude: data.geometry.location.lng(),
      };

      this.navigateToRelative('./places', {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
    }
  }

  onSlideTouched(slide: Slide) {

    if (slide.url && slide.type === 'url') {
      this.openUrl(slide.url);
    } else if (slide.place && slide.type === 'place') {
      this.navigateToRelative('./places/' + slide.place.id + '/' + slide.place.slug);
    } else if (slide.post && slide.type === 'post') {
      this.navigateToRelative('./posts/' + slide.post.id + '/' + slide.post.slug);
    } else if (slide.category && slide.type === 'category') {
      this.navigateToRelative('./places', {
        cat: slide.category.id
      });
    } else {
      // no match...
    }
  }

}
