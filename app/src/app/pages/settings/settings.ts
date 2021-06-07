
import { Component, Injector } from '@angular/core';
import { LocalStorage } from '../../services/local-storage';
import { BasePage } from '../base-page/base-page';
import { WalkthroughPage } from '../walkthrough/walkthrough';
import { Installation } from 'src/app/services/installation';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  styleUrls: ['settings.scss']
})
export class SettingsPage extends BasePage {

  constructor(injector: Injector,
    private installationService: Installation,
    private storage: LocalStorage) {

    super(injector);
  }

  enableMenuSwipe() {
    return true;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
  }

  async onChangeIsPushEnabled(event: CustomEvent) {

    if (!event) return;

    const isPushEnabled = event.detail.checked;

    try {

      const id = await this.installationService.getId();

      await this.installationService.save(id, {
        isPushEnabled: isPushEnabled
      });

      this.storage.setIsPushEnabled(isPushEnabled);
      this.preference.isPushEnabled = isPushEnabled;

    } catch (error) {
      console.warn(error);
    }

  }

  onChangeUnit(event: CustomEvent) {

    if (!event) return;

    const unit = event.detail.value;

    this.storage.setUnit(unit);
    this.preference.unit = unit;
  }

  onChangeLang(event: CustomEvent) {

    if (!event) return;

    const lang = event.detail.value;
    window.dispatchEvent(new CustomEvent("lang:change", { detail: lang }));
  }

  async presentWalkthroughModal() {

    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: WalkthroughPage
    });

    await modal.present();

    this.dismissLoadingView();

  }

}
