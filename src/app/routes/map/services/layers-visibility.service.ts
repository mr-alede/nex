import { BehaviorSubject, Observable } from "rxjs";

import { LayerName } from "../../../model";

export interface ILayersVisibility {
  [key: string]: boolean;
}

export class LayersVisibilityService {
  private _layers$ = new BehaviorSubject<ILayersVisibility>({});

  public get layers$(): Observable<ILayersVisibility> {
    return this._layers$.asObservable();
  }

  public cursorStyle = '';

  constructor() { }

  public registerLayer(name: LayerName, visible: boolean) {
    const layer: ILayersVisibility = {};
    layer[name] = visible;
    this._layers$.next({ ...layer, ...this._layers$.value });
  }

  public toggleLayer(name: LayerName) {
    const layer: ILayersVisibility = {};
    layer[name] = !this._layers$.value[name];
    this._layers$.next({ ...this._layers$.value, ...layer });
  }

  public clear() {
    Object.getOwnPropertyNames(this._layers$.value).forEach(x => {
      this._layers$.value[x] = false;
    })
    this._layers$.next({ ...this._layers$.value });
  }

  public applyLayers(layers: ILayersVisibility) {
    this._layers$.next({ ...this._layers$.value, ...layers });
  }

  public isLayerVisible(name: LayerName): boolean {
    return this._layers$.value[name] || false;
  }

  public isAnyLayerVisible(): boolean {
    console.log(this._layers$.value)
    return Object.keys(this._layers$.value).filter(x => this._layers$.value[x]).length > 0;
  }

  public layerMouseEnter() {
    this.cursorStyle = 'pointer';
  }

  public layerMouseLeave() {
    this.cursorStyle = '';
  }
}
