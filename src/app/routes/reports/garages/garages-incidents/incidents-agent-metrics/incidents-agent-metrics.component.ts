import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-incidents-agent-metrics',
  templateUrl: './incidents-agent-metrics.component.html',
  styleUrls: ['./incidents-agent-metrics.component.scss']
})
export class IncidentsAgentMetricsComponent {
  reportUrl = `https://app.powerbi.com/reportEmbed?reportId=93a6aab4-2e62-49cc-9b0a-2cb8c9aab64e&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;

  constructor() { }
}
