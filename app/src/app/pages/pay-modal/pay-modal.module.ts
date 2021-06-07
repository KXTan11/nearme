import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayModalPage } from './pay-modal.page';
import { SharedModule } from 'src/app/shared.module';
import { NgxStripeModule } from "ngx-stripe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    NgxStripeModule,
  ],
  declarations: [PayModalPage]
})
export class PayModalPageModule {}
