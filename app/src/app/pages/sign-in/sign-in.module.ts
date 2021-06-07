import { NgModule } from '@angular/core';
import { SignInPage } from './sign-in';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordPageModule } from '../forgot-password/forgot-password.module';
import { SignUpPageModule } from '../sign-up/sign-up.module';
 
@NgModule({
  declarations: [
    SignInPage,
  ],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ForgotPasswordPageModule,
    SignUpPageModule,
  ],
})
export class SignInPageModule {}
