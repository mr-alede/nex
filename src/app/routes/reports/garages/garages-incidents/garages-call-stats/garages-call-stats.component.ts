import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-garages-call-stats',
  templateUrl: './garages-call-stats.component.html',
  styleUrls: ['./garages-call-stats.component.scss']
})
export class GaragesCallStatsComponent {
  reportUrl = `https://app.powerbi.com/reportEmbed?reportId=4a929837-6b9b-45f9-99e9-5b60d3061846&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;

  constructor() { }
}

