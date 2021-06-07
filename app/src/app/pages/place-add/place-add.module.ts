import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlaceAddPage } from './place-add';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SignInPageModule } from '../sign-in/sign-in.module';
import { PayModalPageModule } from '../pay-modal/pay-modal.module';

@NgModule({
  declarations: [
    PlaceAddPage,
  ],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SignInPageModule,
    PayModalPageModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlaceAddPage
      }
    ])
  ]
})
export class PlaceAddPageModule {}
