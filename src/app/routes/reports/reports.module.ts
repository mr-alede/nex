import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared';

import { ReportsRoutingModule } from './reports-routing.module';

import { ReportsComponent } from './reports.component';
import { OverviewComponent } from './revenue/overview/overview.component';
import { RevenueComponent } from './revenue/revenue.component';
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

@NgModule({
  imports: [
    CommonModule,

    SharedModule,
    ReportsRoutingModule
  ],
  declarations: [

    ReportsComponent,
    OverviewComponent,
    RevenueComponent,
    GaragesComponent,
    GaragesDashboardComponent,
    CamerasComponent,
    CamerasOverviewComponent,
    CamerasGridComponent,
    GaragesIncidentsComponent,
    IncidentsByLocationComponent,
    IncidentsByMonthsComponent,
    IncidentsByValueComponent,
    IncidentsAgentMetricsComponent,
    ReportsStartComponent,
    RevenueTransactionsAnalysisComponent,
    RevenueAnalysisComponent,
    GridViewRevenueComponent,
    GaragesCallStatsComponent,
    CamerasEventsComponent
  ]
})
export class ReportsModule { }
