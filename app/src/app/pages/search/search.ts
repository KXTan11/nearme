import { Component, Injector, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subject, Observable, merge } from 'rxjs';
import { BasePage } from '../base-page/base-page';
import { Place } from '../../services/place-service';
import { Coordinates } from '@ionic-native/geolocation/ngx';
import { GeolocationService } from 'src/app/services/geolocation.service';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import { LocationAddress } from 'src/app/models/location-address';

@Component({
  selector: 'page-search',
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class SearchPage extends BasePage {

  @ViewChild(IonContent, { static: true }) container: IonContent;

  protected params: any = {
    limit: 100
  };
  public skeletonArray: any;

  public places: Place[] = [];

  public location: LocationAddress;

  public contentLoaded: Subject<any>;
  public loadAndScroll: Observable<any>;

  public searchTerm: string;

  constructor(injector: Injector,
    private geolocationService: GeolocationService,
    private placeService: Place) {
    super(injector);
    this.skeletonArray = Array(12);
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  ngOnInit() {
    this.setupObservables();
    this.subscribeToQueryParams();
  }

  setupObservables() {

    this.contentLoaded = new Subject();

    this.loadAndScroll = merge(
      this.container.ionScroll,
      this.contentLoaded,
    );
  }

  subscribeToQueryParams() {
    
    this.activatedRoute.queryParams.subscribe(queryParams => {

      const query = queryParams.q;

      if (query) {
        this.searchTerm = query;
        this.params.tag = query.toLowerCase();
        this.places = [];
        this.showLoadingView({ showOverlay: false });
        this.loadData();
      }

    });
  }

  onContentLoaded() {
    setTimeout(() => {
      this.contentLoaded.next();
    }, 300);
  }

  async ionViewDidEnter() {
    const title = await this.getTrans('SEARCH');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });

    this.loadLocation();
  }

  async loadLocation() {
    try {
      const coords = await this.geolocationService.getCurrentPosition();
      this.location = coords;
    } catch (err) {
      console.warn(err);
    }
  }

  async loadData(event: any = {}) {

    this.refresher = event.target;

    try {

      this.places = await this.placeService.load(this.params);
  
      if (this.places.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onContentLoaded();

      this.onRefreshComplete(this.places);

    } catch (err) {
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      this.showContentView();
      this.onRefreshComplete();
    }
  }

  onSearch(event: any = {}) {
    const query = event.target.value;
    this.navigateToRelative('./', { q: query });
  }

}
