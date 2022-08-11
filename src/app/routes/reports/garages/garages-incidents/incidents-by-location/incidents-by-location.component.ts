import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-incidents-by-location',
  templateUrl: './incidents-by-location.component.html',
  styleUrls: ['./incidents-by-location.component.scss']
})
export class IncidentsByLocationComponent {
  reportUrl = `https://app.powerbi.com/reportEmbed?reportId=02d3c8d4-0d65-493d-9f7f-b0968da3defa&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;

  constructor() { }
}