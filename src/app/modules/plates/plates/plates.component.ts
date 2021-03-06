import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit} from '@angular/core';
import {ItemEvent, mode, PlateInterface, PlateItemStatus} from "../plate.interface";
import {I18nService} from "../../../services/i18n.service";
import {Plate} from "../plate/plate.model";
import {ApiConnector} from "../../../services/api-connector";
import {PlateQueueManagerService} from "../services/plate-queue-manager.service";
import {Subscription} from "rxjs";
import {Order} from "../../orders/order";
import {PlateIndexDbService} from "../../../services/plate-index-db.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'plates',
  templateUrl: './plates.component.html',
  styleUrls: ['./plates.component.scss']
})
export class PlatesComponent implements OnInit, AfterViewInit, OnDestroy {

  public readonly i18n: any;
  public readonly DISPLAY_CHUNK = 3;

  public plateMode: typeof PlateInterface = mode();
  public hidePrevious: boolean = true;
  public hideNext: boolean = true;
  public plateList!: Plate[];
  public currentPage: number = 0;
  public totalPages: number = 0;
  public showOverlay: boolean = false;
  public showPlateList: boolean = false;
  public unassignedItems: Order[] = [];
  public pages: number[] = [];

  private readonly _MIN_DELTA_SWIPE = 90;

  private _start: number | null = 0;
  private _end: number = 0;
  private _total: number = 0;
  private _queue$: Subscription = new Subscription();
  private _currentItem?: Order;

  constructor(public i18nService: I18nService,
              public plateQueueManagerService: PlateQueueManagerService,
              private _elementRef: ElementRef,
              @Inject('ApiConnector') private _apiConnector: ApiConnector,
              private _plateIndexDbService: PlateIndexDbService,
              private _messageService: MessageService) {
    this.i18n = i18nService.instance;
  }

  public ngOnInit(): void {
    this._loadPlatesConfig();
    this._queue$.add(
      this.plateQueueManagerService.getQueue(PlateQueueManagerService.UNASSIGNED_QUEUE)
        .values$?.subscribe((items: Order[]) => {
        this.unassignedItems = items;
      })
    );
  }

  public ngAfterViewInit(): void {
    // mobile swipe touch hooks
    this._elementRef.nativeElement.querySelector('.plates-carousel')
      .addEventListener('touchstart', () => this._swipeStart(this._normalizeEvent(event)));

    this._elementRef.nativeElement.querySelector('.plates-carousel')
      .addEventListener('touchmove', () => this._swipeMove(this._normalizeEvent(event)));

    this._elementRef.nativeElement.querySelector('.plates-carousel')
      .addEventListener('touchend', () => this._swipeEnd());

    // mouse click swipe hooks
    this._elementRef.nativeElement.querySelector('.plates-carousel')
      .addEventListener('mousedown', () => this._swipeStart(this._normalizeEvent(event)));

    this._elementRef.nativeElement.querySelector('.plates-carousel')
      .addEventListener('mousemove', () => this._swipeMove(this._normalizeEvent(event)));

    this._elementRef.nativeElement.querySelector('.plates-carousel')
      .addEventListener('mouseup', () => this._swipeEnd());
  }

  public ngOnDestroy(): void {
    this._queue$.unsubscribe();
  }

  public onNextPage(): void {
    if ((this.currentPage + 1) === this.totalPages) {
      return
    }

    this.currentPage++;
  }

  public onPreviousPage(): void {
    if (this.currentPage === 0) {
      return
    }

    if (this.currentPage !== 0)
      this.currentPage--;
    else
      this.currentPage = 0;
  }

  public onNewPlate(config: Plate) {
    this._plateIndexDbService.exist(config.name!)
      .then((result: boolean) => {
        if (!result) {
          this._apiConnector.addPlate(config).subscribe(() => this._loadPlatesConfig())
        } else {
          this._messageService
            .add({severity:'error', summary:'Errore', detail:'Il nome della piastra ?? gi?? stato inserito'});
        }
      })
  }

  public handleItemEvent(event: ItemEvent): void {
    this.plateQueueManagerService.onItemAction(event.plateId, event.item, event.action, event.nextId);
  }

  public onUnassignedRun(item: Order): void {
    this.showPlateList = true;
    this._currentItem = item;
  }

  public onUnassignedExecuteRun(plate: Plate): void {
    this.plateQueueManagerService.onItemAction(PlateQueueManagerService.UNASSIGNED_QUEUE, this._currentItem!, PlateItemStatus.Moved, plate.name);
    this.showPlateList = false;
  }

  public toggleNoQueuedItemsOverlay() {
    this.showOverlay = !this.showOverlay;
    this.showPlateList = false;
  }

  public getEnabledPlateList(skip: Plate | null): Plate[] {
    return this.plateList.filter(p => p.mode === PlateInterface.On && p.name !== skip?.name);
  }

  private _swipeStart(event: Touch) {
    this._start = event.screenX;
  }

  private _swipeMove(event: Touch) {
    this._end = event.screenX;

    const delta = this._getDeltaSwipe();

    if (this._start != null) {
      if (delta != null && delta < 0) {
        this.hideNext = false;
        document.getElementById("carousel__next-page")?.classList.add("carousel__next-page-event");
      } else {
        this.hidePrevious = false;
        document.getElementById("carousel__previous-page")?.classList.add("carousel__left-page-event");
      }
    }
  }

  private _swipeEnd(): void {
    const delta: number | null = this._getDeltaSwipe();

    if (!this.hideNext) {
      document.getElementById("carousel__next-page")?.classList.remove("carousel__next-page-event");
      this.hideNext = true;
    }

    if (!this.hidePrevious) {
      document.getElementById("carousel__previous-page")?.classList.remove("carousel__left-page-event");
      this.hidePrevious = true;
    }

    this._start = null;

    if (!delta)
      return;

    delta < 0 ? this.onNextPage() : this.onPreviousPage();
  }

  private _getDeltaSwipe(): number | null {
    const delta: number = this._end - this._start!;

    if (Math.abs(delta) < this._MIN_DELTA_SWIPE)
      return null;
    else
      return delta;
  }

  private _normalizeEvent(event: any): any {
    return event.changedTouches ? event.changedTouches[0] : event;
  }

  private _loadPlatesConfig(): void {
    this.plateList = [];
    this._apiConnector.getPlates()
      .subscribe((plates: Plate[]) => {
        this.plateList = [
          ...plates,
          {
            mode: PlateInterface.Skeleton
          }
        ];
        this._total = this.plateList.length;
        this.totalPages = Math.ceil(this._total / this.DISPLAY_CHUNK);
        this.pages = Array.from(Array(this.totalPages).keys())
      });
  }
}
