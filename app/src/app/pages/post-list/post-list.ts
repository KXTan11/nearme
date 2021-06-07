import { Component, Injector, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import { Post } from '../../services/post';
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
  selector: 'post-list-page',
  templateUrl: 'post-list.html',
  styleUrls: ['post-list.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class PostListPage extends BasePage {

  @ViewChild(IonContent, { static: true }) container: IonContent;

  protected params: any = {};

  public skeletonArray: any;
  public posts: Post[] = [];

  public contentLoaded: Subject<any>;
  public loadAndScroll: Observable<any>;

  constructor(injector: Injector,
    private postService: Post) {
    super(injector);

    this.skeletonArray = Array(12);
    this.params.limit = 20;
    this.params.page = 0;
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  ngOnInit() {
    this.setupObservables();
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
    if (!this.posts.length) {
      await this.showLoadingView({ showOverlay: false });
      this.loadData();
    }
    const title = await this.getTrans('POSTS');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async loadData() {

    try {

      const posts = await this.postService.load(this.params);

      for (let post of posts) {
        this.posts.push(post)
      }

      if (this.posts.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onContentLoaded();

      this.onRefreshComplete(posts);

    } catch (err) {
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      this.showContentView();
      this.onRefreshComplete();
    }
  }

  onReload(event: any = {}) {
    this.refresher = event.target;
    this.posts = [];
    this.params.page = 0;
    this.loadData();
  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.params.page++;
    this.loadData();
  }

}
