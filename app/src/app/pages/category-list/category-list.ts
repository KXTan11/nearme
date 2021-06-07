import { Component, Injector, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subject, Observable, merge } from 'rxjs';
import { Category } from '../../services/categories';
import { BasePage } from '../base-page/base-page';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'category-list-page',
  templateUrl: 'category-list.html',
  styleUrls: ['category-list.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class CategoryListPage extends BasePage {

  @ViewChild(IonContent, { static: true }) container: IonContent;

  public skeletonArray: any;

  public categories: Category[] = [];

  public contentLoaded: Subject<any>;
  public loadAndScroll: Observable<any>;

  public pathPrefix: string;

  constructor(injector: Injector,
    private categoryService: Category) {
    super(injector);
    this.skeletonArray = Array(12);
  }

  enableMenuSwipe() {
    return true;
  }

  ngOnInit() {
    this.setupObservables();

    const tab = this.activatedRoute.snapshot.parent.data.tab;

    if (tab === 'home') {
      this.pathPrefix = '../';
    } else if (tab === 'categories') {
      this.pathPrefix = './';
    }
  }

  setupObservables() {

    this.contentLoaded = new Subject();

    this.loadAndScroll = merge(
      this.container.ionScroll,
      this.contentLoaded,
    );
  }

  onContentLoaded() {
    setTimeout(() => {
      this.contentLoaded.next();
    }, 300);
  }

  ionViewWillEnter() {
    if (this.container) {
      this.container.scrollToTop();
    }
  }

  async ionViewDidEnter() {
    if (!this.categories.length) {
      await this.showLoadingView({ showOverlay: false });
      this.loadData();
    }

    const title = await this.getTrans('CATEGORIES');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async loadData() {

    try {

      this.categories = await this.categoryService.load();
  
      if (this.categories.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onContentLoaded();
  
      this.onRefreshComplete();

    } catch (error) {
      this.showErrorView();
      this.onRefreshComplete();
    }
  }

  onReload(event: any = {}) {
    this.refresher = event.target;
    this.loadData();
  }

}
