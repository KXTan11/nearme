import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProfilePage } from './profile';
import { SharedModule } from '../../shared.module';
import { ProfileEditPageModule } from '../profile-edit/profile-edit.module';
import { ChangePasswordPageModule } from '../change-password/change-password.module';
import { SignInPageModule } from '../sign-in/sign-in.module';
import { SettingsPageModule } from '../settings/settings.module';
 
@NgModule({
  declarations: [
    ProfilePage,
  ],
  imports: [
    SharedModule,
    ProfileEditPageModule,
    ChangePasswordPageModule,
    SignInPageModule,
    SettingsPageModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProfilePage
      }
    ])
  ]
})
export class ProfilePageModule {}
