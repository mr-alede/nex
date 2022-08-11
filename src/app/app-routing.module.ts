import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { DEFAULT_ANONYMOUS_ROUTE } from './constants';

import { HomeComponent } from './routes/home/home.component';
import { OnlyAnonymousGuard, TenantGuard } from './services';

const appRoutes: Routes = [
  {
    path: '', component: HomeComponent, pathMatch: 'full',
    canActivate: [OnlyAnonymousGuard]
  },
  {
    path: 'login-failed', component: HomeComponent,
    canActivate: [OnlyAnonymousGuard]
  },
  {
    path: 'map', loadChildren: () => import('./routes/map/map.module').then(m => m.MapModule),
    canActivate: [MsalGuard, TenantGuard],
    data: { navSidebar: false }
  },
  {
    path: 'reports', loadChildren: () => import('./routes/reports/reports.module').then(m => m.ReportsModule),
    canActivate: [MsalGuard, TenantGuard],
    data: { navSidebar: true }
  },
  {
    path: 'forecasting', loadChildren: () => import('./routes/forecasting/forecasting.module').then(m => m.ForecastingModule),
    canActivate: [MsalGuard, TenantGuard],
    data: { navSidebar: true }
  },
  {
    path: 'settings', loadChildren: () => import('./routes/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [MsalGuard, TenantGuard],
    data: { navSidebar: true }
  },

  { path: '', redirectTo: DEFAULT_ANONYMOUS_ROUTE, pathMatch: 'full' },
  { path: '**', redirectTo: DEFAULT_ANONYMOUS_ROUTE }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
