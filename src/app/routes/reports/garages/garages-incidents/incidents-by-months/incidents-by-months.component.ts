import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-incidents-by-months',
  templateUrl: './incidents-by-months.component.html',
  styleUrls: ['./incidents-by-months.component.scss']
})
export class IncidentsByMonthsComponent {
  reportUrl = `https://app.powerbi.com/reportEmbed?reportId=5b92ef45-3326-456b-965a-d3bf38f07471&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;

  constructor() { }
}