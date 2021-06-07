import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostListPage } from './post-list';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [
    PostListPage,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: PostListPage
      }
    ])
  ]
})
export class PostListPageModule {}
