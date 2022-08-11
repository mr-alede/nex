import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-incidents-by-value',
  templateUrl: './incidents-by-value.component.html',
  styleUrls: ['./incidents-by-value.component.scss']
})
export class IncidentsByValueComponent {
  reportUrl = `https://app.powerbi.com/reportEmbed?reportId=dcdb00fa-ffcf-4f8a-9008-e3d30a56f7bc&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;

  constructor() { }
}