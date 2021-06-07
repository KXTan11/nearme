import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FavoriteListPage } from './favorite-list';
import { SharedModule } from '../../shared.module';
 
@NgModule({
  declarations: [
    FavoriteListPage,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: FavoriteListPage
      }
    ])
  ]
})
export class FavoriteListPageModule {}
