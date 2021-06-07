import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MapPage } from './map';
import { SharedModule } from '../../shared.module';
import { IonBottomDrawerModule } from 'ion-bottom-drawer';
 
@NgModule({
  declarations: [
    MapPage,
  ],
  imports: [
    SharedModule,
    IonBottomDrawerModule,
    RouterModule.forChild([
      {
        path: '',
        component: MapPage
      }
    ])
  ]
})
export class MapPageModule {}
