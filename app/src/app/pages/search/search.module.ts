import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchPage } from './search';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [
    SearchPage,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: SearchPage
      }
    ])
  ],
})
export class SearchPageModule {}
