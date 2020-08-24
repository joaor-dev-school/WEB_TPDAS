import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { merge, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { EventTypeEnum } from '../../shared/events/event-type.enum';
import { EventsService } from '../../shared/events/events.service';
import { EventDetailsModel } from '../../shared/events/models/event-details.model';
import { FormType } from '../../shared/events/utils/event-form.utils';
import { OpenModalModel } from '../../shared/events/utils/events.utils';

@Component({
  selector: 'app-event-modal',
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.scss']
})
export class EventModalComponent implements OnInit, OnDestroy {

  @Input() openModal: Observable<OpenModalModel>;

  @Output() changesMade: EventEmitter<void>;

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  event: EventDetailsModel;

  type: FormType;

  eventTypeSelected: EventTypeEnum;

  isLoading: boolean;

  submit$: Observable<void>;

  get EventTypeEnum(): typeof EventTypeEnum {
    return EventTypeEnum;
  }

  get eventTypes(): EventTypeEnum[] {
    return [
      EventTypeEnum.INVITE,
      EventTypeEnum.SCHEDULING_COLLABORATIVE,
      EventTypeEnum.SCHEDULING_AUTOMATIC
    ];
  }

  private modalRef: BsModalRef;
  private readonly openModalSubject: Subject<OpenModalModel>;
  private readonly submitSubject: Subject<void>;
  private readonly subscriptions: Subscription[];

  constructor(private modalService: BsModalService, private readonly eventsService: EventsService) {
    this.changesMade = new EventEmitter();
    this.subscriptions = [];
    this.openModalSubject = new Subject();
    this.submitSubject = new Subject();
    this.submit$ = this.submitSubject.asObservable();
  }

  ngOnInit(): void {
    this.subscribeForOpenModal();
    this.subscribeForDeleteAction();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  closeModal(changed: boolean): void {
    if (changed) {
      this.changesMade.emit();
    }
    this.modalRef?.hide();
    this.modalRef = null;
  }

  handleEventTypeChanged(eventType: EventTypeEnum): void {
    this.openModalSubject.next({ type: 'create', eventType });
  }

  submitModal(): void {
    this.submitSubject.next();
  }

  private deleteEvent(): void {
    this.eventsService.delete(this.event?.eventId)
      .pipe(take(1))
      .subscribe(
        () => this.handleDeleteEventSuccess(),
        (error: HttpErrorResponse) => this.handleDeleteEventError(error)
      );
  }

  private subscribeForOpenModal(): void {
    this.subscriptions.push(
      merge(
        this.openModal,
        this.openModalSubject
      )
        .pipe(
          tap((formAction: OpenModalModel) => {
            this.isLoading = true;
            this.type = formAction.type;
            this.eventTypeSelected = formAction.eventType;
          }),
          switchMap((formAction: OpenModalModel) => !isNaN(Number(`${formAction.eventId}`))
            ? this.eventsService.fetch(formAction.eventId) : of(null))
        )
        .subscribe((eventDetails: EventDetailsModel) => {
          this.eventTypeSelected = this.eventTypeSelected || this.event?.type || EventTypeEnum.INVITE;
          this.event = eventDetails;
          if (!this.modalRef) {
            this.modalRef = this.modalService.show(this.modalContent, { class: 'modal-xl' });
          }
          this.isLoading = false;
        })
    );
  }

  private subscribeForDeleteAction(): void {
    this.subscriptions.push(this.submit$.pipe(filter(() => this.type === 'delete'))
      .subscribe(() => this.deleteEvent()));
  }

  private handleDeleteEventSuccess(): void {
    this.closeModal(true);
  }

  private handleDeleteEventError(error: HttpErrorResponse): void {
    console.error(error);
    // TODO: implement this.
  }
}
