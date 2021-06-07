import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlaceListPage } from './place-list';
import { SharedModule } from '../../shared.module'; 
import { SignInPageModule } from '../sign-in/sign-in.module';
import { FilterPlacePageModule } from '../filter-place/filter-place.module';
import { LocationSelectPageModule } from '../location-select/location-select.module';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    PlaceListPage,
  ],
  imports: [
    SharedModule,
    SignInPageModule,
    FormsModule,
    FilterPlacePageModule,
    LocationSelectPageModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlaceListPage
      }
    ])
  ]
})
export class PlaceListPageModule {}
