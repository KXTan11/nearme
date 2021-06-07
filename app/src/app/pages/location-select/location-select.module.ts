import { NgModule } from '@angular/core';
import { LocationSelectPage } from './location-select';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  declarations: [
    LocationSelectPage,
  ],
  imports: [
    SharedModule,
  ],
})
export class LocationSelectPageModule {}
