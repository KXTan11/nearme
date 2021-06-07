import { Component, Injector, ViewChild, NgZone, TemplateRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import { ReviewAddPage } from '../review-add/review-add';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Place } from '../../services/place-service';
import { User } from '../../services/user-service';
import { Review } from '../../services/review-service';
import { SignInPage } from '../sign-in/sign-in';
import { Subject, Observable, merge, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { SharePage } from '../share/share.page';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { Report } from 'src/app/services/report.service';
import { LocalStorage } from 'src/app/services/local-storage';
import { AppConfigService } from 'src/app/services/app-config.service';
import { Lightbox } from 'ng-gallery/lightbox';
import { Gallery, GalleryConfig, GalleryRef, ImageSize, ThumbnailsPosition } from 'ng-gallery';

@Component({
  selector: 'place-detail-page',
  templateUrl: './place-detail.html',
  styleUrls: ['./place-detail.scss']
})
export class PlaceDetailPage extends BasePage {

  @ViewChild(IonContent, { static: true }) container: IonContent;
  @ViewChild('itemGalleryTemplate', { static: true }) itemGalleryTemplate: TemplateRef<any>;

  public apiKey: string = environment.googleMapsApiKey;

  public images = [];
  public place: Place;
  public description: any;
  public rating: number = 0;
  public isLiked: boolean = false;
  public isStarred: boolean = false;
  public location: any;
  public reviews: Review[] = [];
  public slidesConfig: any = {};

  public contentLoaded: Subject<any>;
  public loadAndScroll: Observable<any>;

  public skeletonImages: Array<any>;
  public skeletonReviews: Array<any>;

  public isReviewsEnabled: boolean;

  public isLightboxOpen: boolean;

  public lightboxSubscriptionOpen: Subscription;
  public lightboxSubscriptionClosed: Subscription;

  public backButtonListener: any;

  public webSocialShare: { show: boolean, share: any, onClosed: any } = {
    show: false,
    share: {
      config: [{
        facebook: {
          socialShareUrl: '',
        },
      }, {
        twitter: {
          socialShareUrl: '',
        }
      }, {
        whatsapp: {
          socialShareText: '',
          socialShareUrl: '',
        }
      }, {
        copy: {
          socialShareUrl: '',
        }
      }]
    },
    onClosed: () => {
      this.webSocialShare.show = false;
    }
  };

  public sliderGalleryOpts = {
    allowSlidePrev: false,
    allowSlideNext: false,
    zoom: {
      maxRatio: 3
    },
  };

  constructor(injector: Injector,
    private placeService: Place,
    private sanitizer: DomSanitizer,
    private geolocationService: GeolocationService,
    private reviewService: Review,
    private gallery: Gallery,
    private localStorage: LocalStorage,
    private appConfigService: AppConfigService,
    private lightboxService: Lightbox,
    private zone: NgZone,
    private socialSharing: SocialSharing) {
    super(injector);

    this.isReviewsEnabled = true;
    this.skeletonImages = Array(6);
    this.skeletonReviews = Array(5);
  }

  ngOnDestroy() {
    this.lightboxSubscriptionOpen.unsubscribe();
    this.lightboxSubscriptionClosed.unsubscribe();
    document.removeEventListener('ionBackButton', this.backButtonListener);
  }

  ngOnInit() {
    this.setupObservable();
    this.setupGallery();
    this.setupDistanceUnit();
  }

  async ionViewDidEnter() {
    if (!this.place) {
      this.setupSlider();
      await this.showLoadingView({ showOverlay: false });
      this.loadPlace();
      this.loadLocation();
    } else {
      this.setPageTitle(this.place.title);

      this.setMetaTags({
        title: this.place.title,
        description: this.place.description,
        image: this.place.image ? this.place.image.url() : '',
        slug: this.place.getSlug()
      });
    }
  }

  enableMenuSwipe() {
    return false;
  }

  onSlidesDidLoad() {
    this.contentLoaded.next();
  }

  onSlidesDrag() {
    this.contentLoaded.next();
  }

  async setupDistanceUnit() {

    let unit = null;

    try {

      unit = await this.localStorage.getUnit();

      if (unit === null) {
        unit = environment.defaultUnit;
      }

    } catch (error) {
      unit = environment.defaultUnit;
    }

    this.preference.unit = unit;
  }

  setupObservable() {
    this.contentLoaded = new Subject();
    this.loadAndScroll = merge(
      this.container.ionScroll,
      this.contentLoaded
    );
  }

  setupGallery() {
    const config: GalleryConfig = {
      gestures: false,
      imageSize: ImageSize.Cover,
      thumbPosition: ThumbnailsPosition.Bottom,
      itemTemplate: this.itemGalleryTemplate,
    };

    const galleryRef = this.gallery.ref('placeGallery');
    galleryRef.setConfig(config);

    this.backButtonListener = (ev: CustomEvent) => {
      ev.detail.register(10, () => {

        this.zone.run(() => {
          if (this.isLightboxOpen) {
            this.lightboxService.close();
          } else {
            this.goBack();
          }
        });

      });
    };

    document.addEventListener('ionBackButton', this.backButtonListener);

    this.lightboxSubscriptionOpen = this.lightboxService.opened.subscribe(() => {
      this.isLightboxOpen = true;
    });
    this.lightboxSubscriptionClosed = this.lightboxService.closed.subscribe(() => {
      this.isLightboxOpen = false;
    });
  }

  onContentLoaded() {
    setTimeout(() => {
      this.contentLoaded.next();
    }, 400);
  }

  async loadPlace() {

    try {

      const appConfig = await this.appConfigService.load();

      if (appConfig && appConfig.reviews) {
        this.isReviewsEnabled = !appConfig.reviews.disabled;
      }

      this.place = await this.placeService.loadOne(this.getParams().id);

      if (this.place.longDescription) {
        this.description = this.sanitizer
          .bypassSecurityTrustHtml(this.place.longDescription);
      }

      this.setPageTitle(this.place.title);

      this.setMetaTags({
        title: this.place.title,
        description: this.place.description,
        image: this.place.image ? this.place.image.url() : '',
        slug: this.place.getSlug()
      });

      this.webSocialShare.share.config.forEach((item: any) => {
        if (item.whatsapp) {
          item.whatsapp.socialShareUrl = this.getShareUrl(this.place.getSlug());
        } else if (item.facebook) {
          item.facebook.socialShareUrl = this.getShareUrl(this.place.getSlug());
        } else if (item.twitter) {
          item.twitter.socialShareUrl = this.getShareUrl(this.place.getSlug());
        } else if (item.copy) {
          item.copy.socialShareUrl = this.getShareUrl(this.place.getSlug());
        }
      });

      this.rating = this.place.rating;

      if (User.getCurrent()) {
        this.checkIfIsLiked();
        this.checkIfIsStarred();
      }

      this.loadReviews();

      if (this.place.image) {
        this.images.push(this.place.image);
      }

      if (this.place.imageTwo) {
        this.images.push(this.place.imageTwo);
      }

      if (this.place.imageThree) {
        this.images.push(this.place.imageThree);
      }

      if (this.place.imageFour) {
        this.images.push(this.place.imageFour);
      }

      if (Array.isArray(this.place.images) && this.place.images.length) {
        this.images.push(...this.place.images);
      }

      this.showContentView();
      this.onContentLoaded();
      this.onRefreshComplete(this.place);

    } catch (err) {

      if (err.code === 101) {
        this.showEmptyView();
      } else {
        this.showErrorView();
      }

      this.onRefreshComplete();
    }
  }

  setupSlider() {
    this.slidesConfig = {
      grabCursor: true,
      slidesPerView: 2.5,
      slidesOffsetBefore: 16,
      breakpointsInverse: true,
      zoom: false,
      touchStartPreventDefault: false,
      breakpoints: {
        // when window width is >= 320px
        320: {
          slidesPerView: 2.4,
          spaceBetween: 6
        },
        // when window width is >= 400px
        400: {
          slidesPerView: 2.5,
          spaceBetween: 5
        },
        // when window width is >= 640px
        600: {
          slidesPerView: 3.5,
          spaceBetween: 10
        },
        800: {
          slidesPerView: 4.5,
          spaceBetween: 10
        }
      }
    };
  }

  async checkIfIsLiked() {
    try {
      const isLiked = await this.placeService.isLiked(this.place)
      this.isLiked = isLiked;
    } catch (err) {
      console.warn(err.message);
    }
  }

  async checkIfIsStarred() {
    try {
      const isStarred = await this.placeService.isStarred(this.place)
      this.isStarred = isStarred;
    } catch (err) {
      console.warn(err.message);
    }
  }

  async loadLocation() {
    try {
      const coords = await this.geolocationService.getCurrentPosition();
      this.location = coords;
    } catch (err) {
      console.warn(err);
    }
  }

  async loadReviews() {
    try {
      this.reviews = await this.reviewService.load({
        place: this.place, limit: 5
      });
    } catch (err) {
      console.warn(err.message);
    }
  }

  async openSignInModal() {

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: SignInPage
    });

    await modal.present();

    await this.dismissLoadingView();

  }

  async openAddReviewModal() {

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: ReviewAddPage,
      componentProps: {
        place: this.place
      }
    });

    await modal.present();

    await this.dismissLoadingView();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.reviews.unshift(data);
    }
  }

  async openShareModal() {

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: SharePage,
    });

    await modal.present();

    await this.dismissLoadingView();

  }

  onLike() {

    if (User.getCurrent()) {
      this.isLiked = !this.isLiked;
      this.placeService.like(this.place);
    } else {
      this.openSignInModal();
    }
  }

  onRate() {
    if (User.getCurrent()) {
      this.openAddReviewModal();
    } else {
      this.openSignInModal();
    }
  }

  onContentTouched(ev: any = {}) {
    const href = ev.target.getAttribute('href');
    if (href) {
      ev.preventDefault();
      this.openUrl(href);
    }
  }

  async onShare() {

    if (this.isCordova) {

      try {
        const url = this.getShareUrl(this.place.getSlug());
        await this.socialSharing.share(null, null, null, url);
      } catch (err) {
        console.warn(err)
      }

    } else if (this.isPwa || this.isMobile) {
      this.webSocialShare.show = true;
    } else {
      this.openShareModal();
    }

  }

  async onCall() {
    this.openSimpleUrl('tel:' + this.place.phone);
  }

  async onDirectionsButtonTouched() {

    const lat = this.place.location.latitude;
    const lng = this.place.location.longitude;

    const url = `https://maps.google.com/maps?q=${lat},${lng}`;

    this.openSimpleUrl(url);
  }

  async onReportButtonTouched() {

    if (!User.getCurrent()) {
      return this.openSignInModal();
    }

    const str = await this.getTrans([
      'REPORT_LISTING', 'REPORT_REASON',
      'CONFIRM', 'DISMISS'
    ]);

    const { value: text } = await this.showSweetTextArea(
      str.REPORT_PROFILE,
      str.REPORT_REASON,
      str.CONFIRM,
      str.DISMISS
    );

    if (text) {

      try {

        const report = new Report;
        report.place = this.place;
        report.reason = text as string;

        await report.save();

        this.translate.get('SENT').subscribe(str => this.showToast(str));

      } catch (error) {
        this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      }

    }
  }

}
