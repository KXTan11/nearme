
import { Component, Injector, ViewChild } from '@angular/core';
import { LocalStorage } from '../../services/local-storage';
import { BasePage } from '../base-page/base-page';
import { SlideIntro } from 'src/app/services/slide-intro.service';
import { environment } from 'src/environments/environment';
import { HeaderColor } from '@ionic-native/header-color/ngx';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'page-walkthrough',
  templateUrl: './walkthrough.html',
  styleUrls: ['./walkthrough.scss']
})
export class WalkthroughPage extends BasePage {

  @ViewChild(IonSlides) ionSlides: IonSlides;

  public slidesOptions = {
    grabCursor: true,
    touchStartPreventDefault: false,
    zoom: false,
  };

  public slides: SlideIntro[] = [];

  constructor(injector: Injector,
    private headerColor: HeaderColor,
    private slideIntroService: SlideIntro,
    private storage: LocalStorage) {
    super(injector);
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  ngOnInit() {
    this.showLoadingView({ showOverlay: false });
  }

  ionViewDidEnter() {
    this.loadData();
  }

  async onSlideDidChange() {
    const index = await this.ionSlides.getActiveIndex();
    const slide = this.slides[index];
    this.headerColor.tint(slide.bgColor);
  }

  async loadData() {
    try {
      this.slides = await this.slideIntroService.load();

      if (this.slides && this.slides.length) {
        const slide = this.slides[0];
        this.headerColor.tint(slide.bgColor);
        this.showContentView();
      } else {
        this.showEmptyView();
      }
      
    } catch (err) {
      this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));
      this.showErrorView();
    }
  }

  async skip() {
    try {
      await this.storage.setSkipIntroPage(true);
    } catch (error) {
      console.log(error.message);
    }

    this.headerColor.tint(environment.androidHeaderColor);
    this.modalCtrl.dismiss();
  }

}
