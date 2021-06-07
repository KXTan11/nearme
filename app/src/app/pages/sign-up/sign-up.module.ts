import { NgModule } from '@angular/core';
import { SignUpPage } from './sign-up';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
 
@NgModule({
  declarations: [
    SignUpPage,
  ],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SignUpPageModule {}
