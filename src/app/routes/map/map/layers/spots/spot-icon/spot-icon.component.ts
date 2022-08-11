import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { SpotPolicyType } from '../../../../../../model';

const PolicyTypeCssClass = {
  'Unknown': '',
  'General': 'general',
  'Commercial': 'commercial',
  'ShortTerm': 'short-term',
  'Motorcycle': 'moto',
  'TourBus': 'tour-bus',
  'SixWheeled': 'six-wheeled',
  'BoatTrailer': 'boat-trailer'
};

@Component({
  selector: 'app-spot-icon',
  templateUrl: './spot-icon.component.html',
  styleUrls: ['./spot-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotIconComponent {
  @Input() policyType: SpotPolicyType | undefined;

  policyTypes = PolicyTypeCssClass;

  spotPolicyType = SpotPolicyType;

  constructor() { }
}
