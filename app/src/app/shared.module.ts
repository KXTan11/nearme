import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyViewModule } from './components/empty-view/empty-view.module';
import { ImgFallbackModule } from 'ngx-img-fallback';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image';
import { ComponentsModule } from './components/components.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BarRatingModule } from 'ngx-bar-rating';
import { PipesModule } from './pipes/pipes.module';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    EmptyViewModule,
    ImgFallbackModule,
    LazyLoadImageModule,
    ComponentsModule,
    NgxSkeletonLoaderModule,
    BarRatingModule,
    PipesModule,
  ],
  exports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    EmptyViewModule,
    ImgFallbackModule,
    LazyLoadImageModule,
    ComponentsModule,
    NgxSkeletonLoaderModule,
    BarRatingModule,
    PipesModule,
  ],
  providers: [{ provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks }],
})
export class SharedModule {}
