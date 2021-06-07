import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlaceUserListPage } from './place-user-list';
import { SharedModule } from '../../shared.module'; 
import { PayModalPageModule } from '../pay-modal/pay-modal.module';
@NgModule({
  declarations: [
    PlaceUserListPage,
  ],
  imports: [
    SharedModule,
    PayModalPageModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlaceUserListPage
      }
    ])
  ]
})
export class PlaceUserListPageModule {}
