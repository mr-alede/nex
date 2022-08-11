import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input } from "@angular/core";
import { FullScreenModalService, IFullScreenModalData } from "../services/full-screen-modal.service";

@Component({
  selector: 'app-full-screen-modal',
  templateUrl: 'full-screen-modal.component.html',
  styleUrls: ['full-screen-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FullScreenModalComponent {
  pictureUrl: string | null = null;
  videoUrl: string | null = null;
  actualUrl: string | null = null;
  videoState: 'play' | 'pause'
  busy = false;


  private _data: IFullScreenModalData;
  @Input() set data(value: IFullScreenModalData) {

    this._data = value;
    this.actualUrl = this._data.ActualUrl
    this.videoUrl = this._data.VideoUrl;
    this.pictureUrl = this._data.PictureUrl;
    this.videoState = this.actualUrl === this.videoUrl ? 'play' : 'pause'

    this.showLoader();
  }

  get data() {
    return this._data;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    this.closeModal();
  }


  constructor(public fullScreenModalService: FullScreenModalService, private cdr: ChangeDetectorRef) {
  }

  closeModal() {
    this.fullScreenModalService.closeFullScreenModal({VideoUrl: this.videoUrl, PictureUrl: this.pictureUrl, ActualUrl: this.actualUrl});
  }

  togglePlay() {
    this.videoState = this.videoState === 'pause' ? 'play' : 'pause';
    this.actualUrl = this.actualUrl === this.videoUrl ? this.pictureUrl : this.videoUrl;
    this.showLoader();
  }

  private showLoader() {
    this.busy = true;
    setTimeout(() => {
      this.busy = false;
      this.cdr.detectChanges();
    },500)
  }
}
