import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FilterPlacePage } from './filter-place.page';
import { SharedModule } from 'src/app/shared.module';
import { AccordionComponentModule } from 'src/app/components/accordion/accordion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AccordionComponentModule,
  ],
  declarations: [FilterPlacePage]
})
export class FilterPlacePageModule {}
