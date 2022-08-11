import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-garages-dashboard',
  templateUrl: './garages-dashboard.component.html',
  styleUrls: ['./garages-dashboard.component.scss']
})
export class GaragesDashboardComponent {
  reportUrl = `https://app.powerbi.com/reportEmbed?reportId=e20c94e1-01c3-4574-b679-4dfb4e59330e&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;

  constructor() { }
  
}
