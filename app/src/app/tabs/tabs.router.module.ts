import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';
import { AuthGuard } from '../services/auth-guard/auth.guard';

const routes: Routes = [
  {
    path: '1',
    component: TabsPage,
    children: [
      {
        path: 'home',
        data: { tab: 'home' },
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule)
          },
          {
            path: 'search',
            loadChildren: () => import('../pages/search/search.module').then(m => m.SearchPageModule)
          },
          {
            path: 'categories',
            loadChildren: () => import('../pages/category-list/category-list.module').then(m => m.CategoryListPageModule)
          },
          {
            path: 'places',
            loadChildren: () => import('../pages/place-list/place-list.module').then(m => m.PlaceListPageModule)
          },
          {
            path: 'places/map',
            loadChildren: () => import('../pages/map/map.module').then(m => m.MapPageModule)
          },
          {
            path: 'places/add',
            loadChildren: () => import('../pages/place-add/place-add.module').then(m => m.PlaceAddPageModule)
          },
          {
            path: 'places/:id/:slug/reviews',
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places/:id/reviews',
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places/:id',
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          },
          {
            path: 'places/:id/:slug',
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          },
          {
            path: 'posts/:id',
            loadChildren: () => import('../pages/post-detail/post-detail.module').then(m => m.PostDetailPageModule)
          },
          {
            path: 'posts/:id/:slug',
            loadChildren: () => import('../pages/post-detail/post-detail.module').then(m => m.PostDetailPageModule)
          },
        ]
      },
      {
        path: 'categories',
        data: { tab: 'categories' },
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/category-list/category-list.module').then(m => m.CategoryListPageModule)
          },
          {
            path: 'places',
            loadChildren: () => import('../pages/place-list/place-list.module').then(m => m.PlaceListPageModule)
          },
          {
            path: 'places/map',
            loadChildren: () => import('../pages/map/map.module').then(m => m.MapPageModule)
          },
          {
            path: 'places/:id/:slug/reviews',
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places/:id/reviews',
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places/:id',
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          },
          {
            path: 'places/:id/:slug',
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          }
        ]
      },
      {
        path: 'posts',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/post-list/post-list.module').then(m => m.PostListPageModule)
          },
          {
            path: 'places/:id/reviews',
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places/:id/:slug/reviews',
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places/:id',
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          },
          {
            path: 'places/:id/:slug',
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          },
          {
            path: ':id',
            loadChildren: () => import('../pages/post-detail/post-detail.module').then(m => m.PostDetailPageModule)
          },
          {
            path: ':id/:slug',
            loadChildren: () => import('../pages/post-detail/post-detail.module').then(m => m.PostDetailPageModule)
          },
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/profile/profile.module').then(m => m.ProfilePageModule)
          },
          {
            path: 'help',
            loadChildren: () => import('../pages/about/about.module').then(m => m.AboutPageModule)
          },
          {
            path: 'pages/:id/:slug',
            loadChildren: () => import('../pages/page/page.module').then(m => m.PageViewModule)
          },
          {
            path: 'reviews',
            canActivate: [AuthGuard],
            loadChildren: () => import('../pages/review-user-list/review-user-list.module').then(m => m.ReviewUserListPageModule)
          },
          {
            path: 'likes',
            canActivate: [AuthGuard],
            loadChildren: () => import('../pages/favorite-list/favorite-list.module').then(m => m.FavoriteListPageModule)
          },
          {
            path: 'likes/:id',
            canActivate: [AuthGuard],
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          },
          {
            path: 'likes/:id/reviews',
            canActivate: [AuthGuard],
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places',
            canActivate: [AuthGuard],
            loadChildren: () => import('../pages/place-user-list/place-user-list.module').then(m => m.PlaceUserListPageModule)
          },
          {
            path: 'places/add',
            loadChildren: () => import('../pages/place-add/place-add.module').then(m => m.PlaceAddPageModule)
          },
          {
            path: 'places/:id/reviews',
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places/:id/:slug/reviews',
            loadChildren: () => import('../pages/review-list/review-list.module').then(m => m.ReviewListPageModule)
          },
          {
            path: 'places/:id',
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          },
          {
            path: 'places/:id/:slug',
            loadChildren: () => import('../pages/place-detail/place-detail.module').then(m => m.PlaceDetailPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/1/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/1/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
