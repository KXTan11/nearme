import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { InfoWindowComponent } from './info-window/info-window';
import { TranslateModule } from '@ngx-translate/core';
import { UploadBoxComponent } from './upload-box/upload-box.component';
import { PlaceCardComponent } from './place-card/place-card.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { BarRatingModule } from "ngx-bar-rating";

@NgModule({
	declarations: [
		InfoWindowComponent,
		UploadBoxComponent,
		PlaceCardComponent
	],
	imports: [
		CommonModule,
		IonicModule,
		RouterModule,
		TranslateModule,
    LazyLoadImageModule,
    BarRatingModule
	],
	exports: [
		InfoWindowComponent,
		UploadBoxComponent,
		PlaceCardComponent,
	]
})
export class ComponentsModule {}
