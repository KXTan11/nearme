import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostDetailPage } from './post-detail';
import { SharedModule } from '../../shared.module';
import { SharePageModule } from '../share/share.module';
@NgModule({
  declarations: [
    PostDetailPage,
  ],
  imports: [
    SharedModule,
    SharePageModule,
    RouterModule.forChild([
      {
        path: '',
        component: PostDetailPage
      }
    ])
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PostDetailPageModule {}
