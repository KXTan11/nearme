import { Component, NgZone } from '@angular/core';
import { Platform, AlertController, ToastController, LoadingController, ModalController, Config } from '@ionic/angular';
import { HeaderColor } from '@ionic-native/header-color/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { OneSignal, OSNotificationOpenedResult, OSNotification } from '@ionic-native/onesignal/ngx';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import * as Parse from 'parse';
import { LocalStorage } from './services/local-storage';
import { User } from './services/user-service';
import { Installation } from './services/installation';
import { WindowRef } from './services/window-ref';
import { Router, NavigationEnd } from '@angular/router';
import { Preference } from './services/preference';
import { Category } from './services/categories';
import { Place } from './services/place-service';
import { Review } from './services/review-service';
import { Post } from './services/post';
import { WalkthroughPage } from './pages/walkthrough/walkthrough';
import { EventBusService, EmitEvent } from './services/event-bus.service';
import { Slide } from './services/slider-image';
import { SocialAuthService } from 'angularx-social-login';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AudioService } from './services/audio-service';
import { AppConfigService } from './services/app-config.service';
import { AdMob } from '@admob-plus/ionic';
import Utils from './utils';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  private user: User;
  private objWindow: any;
  private loader: any;
  private currentUrl: string;

  constructor(private platform: Platform,
    private router: Router,
    private storage: LocalStorage,
    private preference: Preference,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private userService: User,
    private windowRef: WindowRef,
    private installationService: Installation,
    private headerColor: HeaderColor,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private oneSignal: OneSignal,
    private googlePlus: GooglePlus,
    private authService: SocialAuthService,
    private eventBusService: EventBusService,
    private audioService: AudioService,
    private ngZone: NgZone,
    private appConfigService: AppConfigService,
    private admob: AdMob,
    private translate: TranslateService) {

    this.initializeApp();
  }

  async initializeApp() {

    if (this.platform.is('desktop')) {
      const config = new Config;
      config.set('rippleEffect', false);
      config.set('animated', false);
    }

    this.subscribeToRouterChanges();

    this.objWindow = this.windowRef.nativeWindow;

    this.setupParse();
    this.setupDefaults();
    this.setupEvents();

    if (this.platform.is('cordova')) {
      await this.platform.ready();
      this.setupPush();
      this.setupAndroidHeaderColor();
      this.setupStatusBar();
      this.setupOneSignal();
      this.setupNativeAudio();
      this.tryShowAdMobBanner();
      this.splashScreen.hide();
    }

  }

  async setupDefaults() {

    this.translate.setDefaultLang(environment.defaultLang);

    try {

      const supportedLangs = ['en', 'es', 'ar'];
      const browserLang = navigator.language.substr(0, 2);

      let lang = await this.storage.getLang();

      if (lang === null && supportedLangs.indexOf(browserLang) !== -1) {
        lang = browserLang;
      }

      lang = lang || environment.defaultLang;

      if (lang === 'ar') {
        document.dir = 'rtl';
      } else {
        document.dir = 'ltr';
      }

      this.storage.setLang(lang);
      this.translate.use(lang);
      this.preference.lang = lang;
    } catch (error) {
      console.log(error);
    }

    try {
      const unit = await this.storage.getUnit() || environment.defaultUnit;
      await this.storage.setUnit(unit);
      this.preference.unit = unit;
    } catch (error) {
      console.log(error);
    }

  }

  setupNativeAudio() {

    let path = './assets/audio/pristine.mp3';

    if (this.platform.is('ios')) {
      path = './assets/audio/pristine.m4r';
    }

    this.audioService.preload('ping', path);
  }

  subscribeToRouterChanges() {

    this.router.events.subscribe(async (event) => {

      if (event instanceof NavigationEnd) {

        // Show the Walkthrought Modal only if the user is in homepage
        // and no previous page exists.

        if (this.router.url === '/1/home' && !this.currentUrl) {

          try {

            const appConfig = await this.appConfigService.load();

            if (appConfig && appConfig.slides && appConfig.slides.disabled) {
              return;
            }

            const skipIntro = await this.storage.getSkipIntroPage();

            if (!skipIntro) {
              this.presentWalkthroughModal();
            }

          } catch (error) {
            console.log(error);
          }
        }

        this.currentUrl = this.router.url;
      }
    })

  }

  setupEvents() {

    this.eventBusService.on('user:login', (user: User) => {
      this.user = user;
      this.loadCurrentUser();
      this.updateInstallation();
    });

    this.eventBusService.on('user:logout', () => {
      this.onLogOut();
    });

    this.eventBusService.on('installation:update', (data: any) => {
      this.updateInstallation(data);
    });

    window.addEventListener('lang:change', (event: CustomEvent) => {
      this.onChangeLang(event.detail);
    });
  }

  async onChangeLang(lang: string) {
    this.translate.use(lang);
    this.preference.lang = lang;
    await this.storage.setLang(lang);
    window.location.reload();
  }

  loadCurrentUser() {
    this.user = User.getCurrent();
    if (this.user) this.user.fetch();
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  setupParse() {
    Slide.getInstance();
    Post.getInstance();
    Review.getInstance();
    Place.getInstance();
    Category.getInstance();
    User.getInstance();

    Parse.initialize(environment.appId);
    (Parse as any).serverURL = environment.serverUrl;
    this.loadCurrentUser();
  }

  setupOneSignal() {

    const appId = environment.oneSignal.appId;
    const googleProjectNumber = environment.oneSignal.googleProjectNumber;

    if (appId && googleProjectNumber) {
      this.oneSignal.startInit(appId, googleProjectNumber);
      this.oneSignal.inFocusDisplaying(
        this.oneSignal.OSInFocusDisplayOption.None
      );

      this.oneSignal.handleNotificationReceived()
        .subscribe((notification: OSNotification) => {
          console.log('push received', notification);

          const notificationData: any = {
            ...notification.payload.additionalData
          };
          notificationData.alert = notification.payload.body;

          this.audioService.play('ping');
          this.showNotification(notificationData);
        });

      this.oneSignal.handleNotificationOpened()
        .subscribe((res: OSNotificationOpenedResult) => {
          console.log('push opened', res);

          const notificationData = res.notification.payload.additionalData;

          let page = null;
          let queryParams = {};

          if (notificationData.placeId) {
            page = '/1/home/places/' + notificationData.placeId;
          } else if (notificationData.postId) {
            page = '/1/home/posts/' + notificationData.postId;
          } else if (notificationData.categoryId) {
            page = '/1/home/places';
            queryParams = { cat: notificationData.categoryId };
          }

          if (page) {
            this.ngZone.run(() => {
              this.router.navigate([page], { queryParams });
            });
          }

        });

      this.oneSignal.endInit();
    }
  }

  async tryShowAdMobBanner() {
    try {
      await this.platform.ready();

      if (this.platform.is('cordova')) {

        const appConfig = await this.appConfigService.load();

        if (appConfig && appConfig.adMob && appConfig.adMob.disabled) {
          return;
        }

        if (!environment.production) {
          this.admob.setDevMode(true);
        }

        await Utils.sleep(5000);

        const res = await this.admob.banner.show({
          position: 'bottom',
          id: {
            android: environment.admob.banner.android,
            ios: environment.admob.banner.ios,
          }
        });
        console.log('ad visible', res);
      }

    } catch (error) {
      console.warn(error);
    }
  }

  setupStatusBar() {
    if (this.platform.is('ios')) {
      this.statusBar.overlaysWebView(true);
      this.statusBar.styleDefault();
    } else {
      this.statusBar.backgroundColorByHexString(environment.androidHeaderColor);
    }
  }

  setupAndroidHeaderColor() {
    if (environment.androidHeaderColor && this.platform.is('android')) {
      this.headerColor.tint(environment.androidHeaderColor);
    }
  }

  setupPush() {

    this.objWindow = this.windowRef.nativeWindow;

    if (this.objWindow.ParsePushPlugin) {

      this.objWindow.ParsePushPlugin.resetBadge();

      this.platform.resume.subscribe(() => {
        this.objWindow.ParsePushPlugin.resetBadge();
      });

      this.objWindow.ParsePushPlugin.on('receivePN', (pn: any) => {
        console.log('[receivePn] Push notification:' + JSON.stringify(pn));
        this.showNotification(pn);
        this.audioService.play('ping');
        this.objWindow.ParsePushPlugin.resetBadge();
      });

      this.objWindow.ParsePushPlugin.on('openPN', (pn: any) => {
        console.log('[openPN] Push Notification:' + JSON.stringify(pn));

        let page = null;
        let queryParams = {};

        if (pn.placeId) {
          page = '/1/home/places/' + pn.placeId;
        } else if (pn.postId) {
          page = '/1/home/posts/' + pn.postId;
        } else if (pn.categoryId) {
          page = '/1/home/places';
          queryParams = { cat: pn.categoryId };
        }

        if (page) {
          this.ngZone.run(() => {
            this.router.navigate([page], { queryParams });
          });
        }

        this.objWindow.ParsePushPlugin.resetBadge();
      });

      this.objWindow.ParsePushPlugin.initialize();

      this.updateInstallation();
    }
  }

  async updateInstallation(data: any = {}) {

    try {

      if (this.objWindow.ParsePushPlugin) {

        const payload: any = {
          user: null,
          ...data,
        };

        const id = await this.installationService.getId();
        const obj = await this.installationService.getOne(id);

        if (obj) {
          payload.isPushEnabled = obj.isPushEnabled;
          this.storage.setIsPushEnabled(obj.isPushEnabled);
          this.preference.isPushEnabled = obj.isPushEnabled;
        }

        const user = User.getCurrent();

        if (user) {
          payload.user = user.toPointer();
        }

        const res = await this.installationService.save(id, payload)
        console.log('Installation updated', res);
      }

    } catch (error) {
      console.log(error);
    }

  }

  async presentWalkthroughModal() {

    await this.showLoadingView();

    const modal = await this.modalCtrl.create({
      component: WalkthroughPage
    });

    await modal.present();

    this.dismissLoadingView();
  }

  async showNotification(notification: any) {

    const viewText = await this.translate.get('VIEW_MORE').toPromise();

    let buttons = null;

    if (notification.placeId) {
      buttons = [{
        side: 'end',
        text: viewText,
        handler: () => {
          this.ngZone.run(() => {
            this.router.navigate(['/1/home/places/' + notification.placeId]);
          });
        }
      }];
    } else if (notification.postId) {
      buttons = [{
        side: 'end',
        text: viewText,
        handler: () => {
          this.ngZone.run(() => {
            this.router.navigate(['/1/home/posts/' + notification.postId]);
          });
        }
      }];
    } else if (notification.categoryId) {
      buttons = [{
        side: 'end',
        text: viewText,
        handler: () => {
          this.ngZone.run(() => {
            this.router.navigate(['/1/home/places'], {
              queryParams: {
                cat: notification.categoryId
              }
            });
          });
        }
      }];
    }

    this.showToast(notification.alert, buttons, 5000);
  }

  async showAlert(title: string = '', message: string = '', okText: string = 'OK') {
    let alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [okText],
    });
    return await alert.present();
  }

  async showToast(message: string = '', buttons: any = null, duration: any = 3000) {

    const closeText = await this.translate.get('CLOSE').toPromise();

    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      color: 'primary',
      position: 'bottom',
      cssClass: 'tabs-bottom',
      buttons: buttons || [{
        text: closeText,
        role: 'cancel',
      }]
    });

    return await toast.present();
  }

  async showLoadingView() {

    const loadingText = await this.translate.get('LOADING').toPromise();

    this.loader = await this.loadingCtrl.create({
      message: loadingText
    });

    return await this.loader.present();
  }

  async dismissLoadingView() {

    if (!this.loader) return;

    try {
      await this.loader.dismiss()
    } catch (error) {
      console.log('ERROR: LoadingController dismiss', error);
    }
  }

  async onLogOut() {

    try {

      const authData = this.user.authData;

      await this.showLoadingView();
      await this.userService.logout();
      this.eventBusService.emit(new EmitEvent('user:loggedOut'));
      this.user = null;
      this.goTo('/');
      this.translate.get('LOGGED_OUT').subscribe(str => this.showToast(str));
      this.dismissLoadingView();
      this.updateInstallation();

      if (this.platform.is("cordova")) {
        if (authData && authData.google) {
          this.googlePlus.disconnect();
        }
      } else {
        if (authData && (authData.google || authData.facebook)) {
          this.authService.signOut(true);
        }
      }

    } catch (err) {
      console.log(err.message);
      this.dismissLoadingView();
    }

  }

}
