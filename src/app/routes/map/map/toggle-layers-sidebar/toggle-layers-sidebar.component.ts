import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { mergeMap, Subscription, tap } from 'rxjs';

import { AppStateService, AreasService, IAreaType } from '../../../../services';
import { LayerName, RevenueType } from '../../../../model';
import { LayersVisibilityService, MapStateService, ILayersVisibility, AreasProcessorService, AREA_LEVEL_NONE } from '../../services';

interface IAreaLevel {
  id: number;
  layers: Array<LayerName>;
  name: string;
  level: number;
}

@Component({
  selector: 'app-toggle-layers-sidebar',
  templateUrl: './toggle-layers-sidebar.component.html',
  styleUrls: ['./toggle-layers-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleLayersSidebarComponent implements OnInit, OnDestroy {
  subscriptions = new Array<Subscription>();

  sidebarVisible = false;

  private _layers: ILayersVisibility = {};
  layers: ILayersVisibility = {};

  areaTypeLevels: Array<IAreaLevel> = [];
  layerName = LayerName;

  revenuePeriods = [
    { id: RevenueType.Day, name: 'Day' },
    { id: RevenueType.Week, name: 'Week' },
    { id: RevenueType.Month, name: 'Month' },
    { id: RevenueType.Quarter, name: 'Quarter' },
  ];

  constructor(
    private layersVisibility: LayersVisibilityService,
    public mapState: MapStateService,
    private appState: AppStateService,
    private areasService: AreasService,
    public areasProcessor: AreasProcessorService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.mapState.sidebarVisible$
        .subscribe(visible => {
          this.sidebarVisible = visible === 'layers';
          this.layers = { ...this._layers };
        })
    );

    this.subscriptions.push(
      this.appState.currentCity$
        .pipe(
          tap(city => {
            this.disableLayer(LayerName.Areas);
            this.areasProcessor.onCityChanged(city);
          }),
          mergeMap(city => this.areasService.getAllTypes())
        )
        .subscribe(areaTypes => {
          this.areasProcessor.onLevelChanged(AREA_LEVEL_NONE.level);

          this.areaTypeLevels = this.getAreaTypes(areaTypes);
          this.areasProcessor.setTypes(areaTypes);
        })
    );

    this.subscriptions.push(
      this.layersVisibility.layers$
        .subscribe(layers => this._layers = layers)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  toggleLayer(name: LayerName) {
    this.layers[name] = !this.layers[name];
    this.layersVisibility.applyLayers(this.layers);
    if (!this.layers[name]) {
      this.mapState.clearSelectedEntityByLayerName(name);
    }
  }

  disableLayer(name: LayerName) {
    if (this.layers[name]) {
      this.layers[name] = false;
      this.layersVisibility.applyLayers(this.layers);
    }
  }
  enableLayer(name: LayerName) {
    if (!this.layers[name]) {
      this.layers[name] = true;
      this.layersVisibility.applyLayers(this.layers);
    }
  }

  close() {
    this.mapState.closeSidebar();
  }

  onAreaLevelSelected(level: IAreaLevel | null) {
    this.subscriptions.push(this.areasProcessor.selectedAreaTypeLevel$.subscribe((currentLevel) => {
      if (!!level && level.level !== currentLevel) {
        this.mapState.clearSelectedEntityByLayerName(LayerName.Areas);
      }
    }))

    if (!!level && level.level > -1) {
      this.enableLayer(LayerName.Areas);
    } else {
      this.disableLayer(LayerName.Areas);
    }

    this.areasProcessor.onLevelChanged(level?.level);
  }

  onRevenuePeriodSelected(period: { id: RevenueType, name: string }) {
    this.mapState.setRevenueType(period.id);
  }

  private getAreaTypes(areaTypes: Array<IAreaType>): Array<IAreaLevel> {
    let result: Array<IAreaLevel> = [];

    let names: Array<string> = [];
    let level: number | null = null;

    areaTypes.forEach(t => {
      if ((level === null || level === t.Level) && t.PluralName) {
        names.push(t.PluralName);
        level = t.Level;
      }

      if (t.Descendants && t.Descendants.length > 0) {
        result = result.concat(this.getAreaTypes(t.Descendants).filter(x => x.level > -1));
      }
    });

    if (names.length > 0 && level !== null) {
      result.unshift({
        id: level,
        layers: names.map(l => <LayerName>l.toLowerCase()),
        name: names.join(', '),
        level: level
      });
    }

    if (level === 0) {
      result.unshift(AREA_LEVEL_NONE);
    }

    return result;
  }
}
