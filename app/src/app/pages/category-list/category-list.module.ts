import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared.module';

import { CategoryListPage } from './category-list';

@NgModule({
  declarations: [
    CategoryListPage,
  ],
  imports: [
    IonicModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: CategoryListPage
      }
    ])
  ],
  exports: [
    CategoryListPage
  ]
})
export class CategoryListPageModule {}
