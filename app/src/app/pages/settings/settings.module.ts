import { NgModule } from '@angular/core';
import { SettingsPage } from './settings';
import { SharedModule } from '../../shared.module';
import { WalkthroughPageModule } from '../walkthrough/walkthrough.module';
import { FormsModule } from '@angular/forms';
 
@NgModule({
  declarations: [
    SettingsPage,
  ],
  imports: [
    SharedModule,
    WalkthroughPageModule,
    FormsModule,
  ]
})
export class SettingsPageModule {}
