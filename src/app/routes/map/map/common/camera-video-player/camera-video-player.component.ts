import { ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { FrontendApiCamerasService } from "../../../../../services";
import { FullScreenModalService } from "../../../../../shared/services/full-screen-modal.service";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { MapStateService } from "../../../services";

@Component({
  selector: 'app-camera-video-player',
  templateUrl: 'camera-video-player.component.html',
  styleUrls: ['camera-video-player.component.scss']
})

export class CameraVideoPlayerComponent implements OnDestroy {
  subscriptionExpandPanel: Subscription;
  subscriptionPopupVisible: Subscription;
  pictureUrl: string | null = null;
  videoUrl: string | null = null;
  actualUrl: string | null = null;
  videoState: 'play' | 'pause' = 'pause'

  private _cameraId: number;
  @Input() set cameraId(value: number | undefined) {
    this._cameraId = value || 0;
    this.videoState = 'play';
    if (this._cameraId && this._cameraId !== 0) {
      this.pictureUrl = !!value ? `{FRONTEND_API}/camera/${this._cameraId}/snapshot` : null;
      this.camerasService.get(this._cameraId).subscribe((res) => {
        this.videoUrl = res.VideoUrl;
        this.actualUrl = this.videoUrl;
        this.cdr.detectChanges();
      })
    }
    this.subscriptionPopupVisible = this.mapState.popupVisible$.subscribe((visible) => {
      if (!visible) {
        this.actualUrl = null;
        this.videoUrl = null;
        this.pictureUrl = null;
      }
    })
  }

  constructor(public camerasService: FrontendApiCamerasService, public cdr: ChangeDetectorRef,
              public fullScreenModalService: FullScreenModalService, private mapState: MapStateService) {
  }

  togglePlay() {
    this.videoState = this.videoState === 'pause' ? 'play' : 'pause';
    this.actualUrl = this.actualUrl === this.videoUrl ? this.pictureUrl : this.videoUrl;
  }

  expandModal() {
    this.subscriptionExpandPanel = this.fullScreenModalService.openFullScreenModal$({
      VideoUrl: this.videoUrl,
      PictureUrl: this.pictureUrl,
      ActualUrl: this.actualUrl
    })
      .pipe((filter((x) => x !== null)))
      .subscribe((data) => {
        if (data) {
          this.pictureUrl = data?.PictureUrl;
          this.videoUrl = data?.VideoUrl;
          this.actualUrl = data?.ActualUrl;
          this.videoState = this.actualUrl === this.videoUrl ? 'play' : 'pause'
          this.cdr.detectChanges();
          this.clearSubscription();
        }
      })
  }

  private clearSubscription() {
    this.subscriptionExpandPanel.unsubscribe();
  }

  ngOnDestroy() {
    this.subscriptionExpandPanel.unsubscribe();
    this.subscriptionPopupVisible.unsubscribe();
  }
}
