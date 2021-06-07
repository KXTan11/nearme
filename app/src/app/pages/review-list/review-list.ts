
import { Component, Injector, ViewChild } from '@angular/core';
import { Review } from '../../services/review-service';
import { BasePage } from '../base-page/base-page';
import { Place } from 'src/app/services/place-service';
import { IonContent } from '@ionic/angular';
import { Subject, Observable, merge } from 'rxjs';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'page-review-list',
  templateUrl: './review-list.html',
  styleUrls: ['./review-list.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class ReviewListPage extends BasePage {

  @ViewChild(IonContent, { static: true }) container: IonContent;

  public contentLoaded: Subject<any>;
  public loadAndScroll: Observable<any>;

  public reviews: Review[] = [];
  public params: any = {};
  public skeletonReviews: Array<any>;

  constructor(injector: Injector, private reviewService: Review) {
    super(injector);
    this.params = Object.assign({}, this.getParams());
    this.params.limit = 20;
    this.params.page = 0;

    this.contentLoaded = new Subject();

    this.skeletonReviews = Array(10);
  }

  enableMenuSwipe() {
    return false;
  }

  ngOnInit() {
    this.setupObservable();
  }

  setupObservable() {
    this.loadAndScroll = merge(
      this.container.ionScroll,
      this.contentLoaded
    );
  }

  onContentLoaded() {
    setTimeout(() => {
      this.contentLoaded.next();
    }, 400);
  }

  async ionViewDidEnter() {

    await this.showLoadingView({ showOverlay: false });

    if (this.params.id) {
      this.params.place = await this.loadPlace();

      const str = await this.getTrans('REVIEWS');

      const title = this.params.place.title + ' - ' + str;
      this.setPageTitle(title);

      this.setMetaTags({
        title: title
      });
    }

    this.loadData();
  }

  async loadPlace() {
    const place = new Place;
    place.id = this.params.id;
    return await place.fetch();
  }

  async loadData() {

    try {

      const reviews = await this.reviewService.load(this.params);
      
      for (let review of reviews) {
        this.reviews.push(review);
      }

      if (this.reviews.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }
      
      this.onContentLoaded();
      this.onRefreshComplete(reviews);
      
    } catch (error) {

      this.showContentView();
      this.onRefreshComplete();

      let message = await this.getTrans('ERROR_NETWORK');
      this.showToast(message);
    }
  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.params.page++;
    this.loadData();
  }

  onReload(event: any = {}) {
    this.refresher = event.target;
    this.reviews = [];
    this.params.page = 0;
    this.loadData();
  }

}
