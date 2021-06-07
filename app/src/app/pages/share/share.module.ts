import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharePage } from './share.page';
import { TranslateModule } from '@ngx-translate/core';
import { ShareButtonModule } from '@ngx-share/button';
import { ShareModule } from '@ngx-share/core';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ShareModule,
    ShareButtonModule,
  ],
  declarations: [SharePage],
})
export class SharePageModule {}
