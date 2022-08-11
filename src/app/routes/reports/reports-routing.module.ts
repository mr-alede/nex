import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsComponent } from './reports.component';
import { RevenueComponent } from './revenue/revenue.component';
import { OverviewComponent } from './revenue/overview/overview.component';
import { GaragesComponent } from './garages/garages.component';
import { GaragesDashboardComponent } from './garages/garages-dashboard/garages-dashboard.component';
import { CamerasComponent } from './cameras/cameras.component';
import { CamerasOverviewComponent } from './cameras/cameras-overview/cameras-overview.component';
import { CamerasGridComponent } from './cameras/cameras-grid/cameras-grid.component';
import { GaragesIncidentsComponent } from './garages/garages-incidents/garages-incidents.component';
import { IncidentsByLocationComponent } from './garages/garages-incidents/incidents-by-location/incidents-by-location.component';
import { IncidentsByMonthsComponent } from './garages/garages-incidents/incidents-by-months/incidents-by-months.component';
import { IncidentsByValueComponent } from './garages/garages-incidents/incidents-by-value/incidents-by-value.component';
import { IncidentsAgentMetricsComponent } from './garages/garages-incidents/incidents-agent-metrics/incidents-agent-metrics.component';
import { ReportsStartComponent } from './reports-start/reports-start.component';
import { RevenueTransactionsAnalysisComponent } from './revenue/revenue-transactions-analysis/revenue-transactions-analysis.component';
import { RevenueAnalysisComponent } from './revenue/revenue-analysis/revenue-analysis.component';
import { GridViewRevenueComponent } from './revenue/grid-view-revenue/grid-view-revenue.component';
import { GaragesCallStatsComponent } from './garages/garages-incidents/garages-call-stats/garages-call-stats.component';
import { CamerasEventsComponent } from './cameras/cameras-events/cameras-events.component';

import { OnlyLouisvilleGuard } from '../../services';

const routes: Routes = [
  {
    path: '', component: ReportsComponent,
    data: { breadcrumb: 'Reports' },
    children: [
      {
        path: 'start', component: ReportsStartComponent
      },

      {
        path: 'revenue', component: RevenueComponent,
        data: { breadcrumb: 'Revenue' },
        children: [
          {
            path: 'overview', component: OverviewComponent,
            data: { breadcrumb: 'Overview' }
          },
          {
            path: 'analysis', component: RevenueAnalysisComponent,
            data: { breadcrumb: 'Revenue Analysis' }
          },
          {
            path: 'transactions', component: RevenueTransactionsAnalysisComponent,
            data: { breadcrumb: 'Transaction Analysis' }
          },
          {
            path: 'grid-view', component: GridViewRevenueComponent,
            data: { breadcrumb: 'Grid View' }
          },

          { path: '', redirectTo: 'overview' },
          { path: '**', redirectTo: 'overview' }
        ]
      },

      {
        path: 'command-center', component: GaragesComponent,
        canActivate: [OnlyLouisvilleGuard],
        runGuardsAndResolvers: 'always',
        data: { breadcrumb: 'Garages' },
        children: [
          {
            path: 'dashboard', component: GaragesDashboardComponent,
            data: { breadcrumb: 'Dashboard' }
          },

          {
            path: 'incidents', component: GaragesIncidentsComponent,
            data: { breadcrumb: 'Incidents' },
            children: [
              {
                path: 'by-location', component: IncidentsByLocationComponent,
                data: { breadcrumb: 'By Location' }
              },
              {
                path: 'by-months', component: IncidentsByMonthsComponent,
                data: { breadcrumb: 'By Months' }
              },
              {
                path: 'by-value', component: IncidentsByValueComponent,
                data: { breadcrumb: 'By Value' }
              },
              {
                path: 'agent-metrics', component: IncidentsAgentMetricsComponent,
                data: { breadcrumb: 'Agent Metrics' }
              },
              {
                path: 'call-stats', component: GaragesCallStatsComponent,
                data: { breadcrumb: 'Call Stats' }
              },

              { path: '', redirectTo: 'by-location' },
              { path: '**', redirectTo: 'by-location' }
            ]
          },

          { path: '', redirectTo: 'dashboard' },
          { path: '**', redirectTo: 'dashboard' }
        ]
      },

      {
        path: 'cameras', component: CamerasComponent,
        data: { breadcrumb: 'Cameras' },
        children: [
          {
            path: 'overview', component: CamerasOverviewComponent,
            data: { breadcrumb: 'Overview' }
          },
          {
            path: 'grid-view', component: CamerasGridComponent,
            data: { breadcrumb: 'Grid View' }
          },

          { path: '', redirectTo: 'overview' },
          { path: '**', redirectTo: 'overview' }
        ]
      },

      { path: '', redirectTo: 'start' },
      { path: '**', redirectTo: 'start' }
    ]
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
