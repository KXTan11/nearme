import { Component, Input, Injector, OnInit, ViewChild } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
  PaymentIntent,
} from '@stripe/stripe-js';

import { UserPackage } from 'src/app/services/user-package';
import { Place } from 'src/app/services/place-service';

@Component({
  selector: 'app-pay-modal',
  templateUrl: './pay-modal.page.html',
  styleUrls: ['./pay-modal.page.scss'],
})
export class PayModalPage extends BasePage implements OnInit {

  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  @Input() userPackage: UserPackage;
  @Input() place: Place;

  public isSaving: boolean;

  public cardOptions: StripeCardElementOptions = {
    hidePostalCode: true,
  };

  public elementsOptions: StripeElementsOptions = {};

  constructor(injector: Injector, private stripeService: StripeService) {
    super(injector);
    this.elementsOptions.locale = this.preference.lang;
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  ngOnInit() { }

  onDismiss(paymentIntent: PaymentIntent = null) {
    return this.modalCtrl.dismiss(paymentIntent);
  }

  async onSubmit() {

    try {

      this.isSaving = true;

      const secret = await this.userPackage.createStripePaymentIntent(this.place.id);

      this.stripeService.confirmCardPayment(secret, {
        payment_method: {
          card: this.card.element,
        }
      }).subscribe((result: any) => {

        if (result.error) {
          this.showAlert(result.error.message);
        } else {
          this.onDismiss(result.paymentIntent);
        }

        this.isSaving = false;
      });

    } catch (error) {
      this.isSaving = false;
      this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));
    }

  }

}
