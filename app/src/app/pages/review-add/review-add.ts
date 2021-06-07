
import { Component, Injector, Input } from '@angular/core';
import { Review } from '../../services/review-service';
import { BasePage } from '../base-page/base-page';
import { Place } from 'src/app/services/place-service';


@Component({
  selector: 'page-review-add',
  templateUrl: './review-add.html',
  styleUrls: ['./review-add.scss']
})
export class ReviewAddPage extends BasePage {

  @Input() place: Place;

  public review: any = {
    rating: 3,
    comment: ''
  };

  constructor(injector: Injector,
    private reviewService: Review) {
    super(injector);
  }

  enableMenuSwipe() {
    return false;
  }

  async onSubmit() {

    if (!this.review.rating) {
      const message = await this.getTrans('PLEASE_SELECT_A_RATING');
      this.showToast(message);
      return;
    }

    try {

      await this.showLoadingView({ showOverlay: false });

      this.review.place = this.place;

      const review = await this.reviewService.create(this.review);

      this.translate.get('REVIEW_ADDED')
        .subscribe(str => this.showToast(str));

      this.showContentView();

      if (review.status === 'Published') {
        this.onDismiss(review);
      } else {
        this.onDismiss();
      }

    } catch (err) {

      this.showContentView();

      if (err.code === 5000) {
        this.translate.get('REVIEW_ALREADY_EXISTS')
        .subscribe(str => this.showToast(str));
      } else if (err.code === 5003) {
        this.translate.get('REVIEWS_DISABLED')
        .subscribe(str => this.showToast(str));
      } else {
        this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));
      }
    }
  }

  onDismiss(review: Review = null) {
    this.modalCtrl.dismiss(review);
  }

}
