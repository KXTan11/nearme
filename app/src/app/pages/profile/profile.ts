
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { User } from '../../services/user-service';
import { BasePage } from '../base-page/base-page';
import { ProfileEditPage } from '../profile-edit/profile-edit';
import { ChangePasswordPage } from '../change-password/change-password';
import { SignInPage } from '../sign-in/sign-in';
import { SettingsPage } from '../settings/settings';
import { EventBusService, EmitEvent } from 'src/app/services/event-bus.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'page-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfilePage extends BasePage implements OnInit {

  @ViewChild(IonContent, { static: true }) container: IonContent;

  public user: User;

  public isReviewsEnabled: boolean;

  constructor(injector: Injector,
    private appConfigService: AppConfigService,
    private eventBusService: EventBusService) {
    super(injector);
  }

  enableMenuSwipe() {
    return true;
  }

  ionViewWillEnter() {
    if (this.container) {
      this.container.scrollToTop();
    }
  }

  ngOnInit() {

    this.user = User.getCurrent();

    this.eventBusService.on('user:login', () => {
      this.user = User.getCurrent();
    });

    this.eventBusService.on('user:loggedOut', () => {
      this.user = null;
    });

    this.checkReviewSettings();
  }

  async ionViewDidEnter() {

    this.user = User.getCurrent();

    const title = await this.getTrans('PROFILE');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async checkReviewSettings() {
    try {
      const appConfig = await this.appConfigService.load();

      if (appConfig && appConfig.reviews) {
        this.isReviewsEnabled = !appConfig.reviews.disabled;
      }
    } catch (error) {

    }
  }

  goTo(page: string) {

    if (!User.getCurrent()) return this.openSignInModal();

    this.navigateToRelative('./' + page);
  }

  async onPresentEditModal() {

    if (!User.getCurrent()) return this.openSignInModal();

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: ProfileEditPage
    });

    await modal.present();

    await this.dismissLoadingView();
  }

  async onPresentChangePasswordModal() {

    if (!User.getCurrent()) return this.openSignInModal();

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: ChangePasswordPage
    });

    await modal.present();

    await this.dismissLoadingView();
  }

  async onPresentSettingsModal() {

    if (!User.getCurrent()) return this.openSignInModal();

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: SettingsPage,
    });

    await modal.present();

    await this.dismissLoadingView();
  }

  async openSignInModal() {

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: SignInPage
    });

    await modal.present();

    await this.dismissLoadingView();
  }

  onLogout() {
    this.eventBusService.emit(new EmitEvent('user:logout'));
  }

}
