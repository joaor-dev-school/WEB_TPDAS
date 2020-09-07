import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { formatDate, parseDate } from 'ngx-bootstrap/chronos';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AlertModalManagerService } from '../../shared/alert-manager/alert-modal-manager.service';
import { createFormErrorAlert, createFormSuccessAlert } from '../../shared/alert-manager/models/alert-modal.model';
import { AuthService } from '../../shared/auth/auth.service';
import { EventTypeEnum } from '../../shared/events/event-type.enum';
import { EventsService } from '../../shared/events/events.service';
import { EventForm } from '../../shared/events/form/event-form';
import { EventDetailsModel } from '../../shared/events/models/event-details.model';
import { EventParticipantModel } from '../../shared/events/models/event-participant.model';
import { InviteSubmitModel } from '../../shared/events/models/invite-submit.model';
import { SchedulingSubmitModel } from '../../shared/events/models/scheduling-submit.model';
import { formattedTime, FormType } from '../../shared/events/utils/event-form.utils';
import { DateModel } from '../../shared/models/date.model';
import { UserModel } from '../../shared/users/models/user.model';
import { UsersService } from '../../shared/users/users.service';

@Component({
  selector: 'app-scheduling-form',
  templateUrl: './scheduling-form.component.html',
  styleUrls: ['./scheduling-form.component.scss']
})
export class SchedulingFormComponent extends EventForm implements OnInit, OnDestroy {

  @Input() eventDetails: EventDetailsModel;

  @Input() eventType: EventTypeEnum;

  @Input() submitObservable: Observable<void>;

  @Output() closeEmitter: EventEmitter<boolean>;

  @Input() type: FormType;

  get submit$(): Observable<void> {
    return this.submitObservable;
  }

  get event(): EventDetailsModel {
    return this.eventDetails;
  }

  get dates(): string[] {
    return this.event.dates.map((date: DateModel) => `${formatDate(new Date(date.timestamp), this.inputDateFormat)} (${formattedTime(date.duration, this.durationFormat).split(':').join('h ')}m)`);
  }

  get userItemsDetails(): string {
    return this.usersListSubject.value?.items.map((item: UserModel) => item.username).join(', ');
  }

  get datesControl(): FormArray {
    return this.eventForm.get('dates') as FormArray;
  }

  constructor(private readonly fb: FormBuilder, private readonly eventsService: EventsService,
              private readonly _usersService: UsersService, private readonly authService: AuthService,
              private readonly _alertService: AlertModalManagerService) {
    super(_usersService, _alertService);
    this.closeEmitter = new EventEmitter();
  }

  ngOnInit(): void {
    super.onInit();
  }

  ngOnDestroy(): void {
    super.onDestroy();
  }

  buildEventForm(event: EventDetailsModel): void {
    this.eventForm = this.fb.group({
      name: this.fb.control(event.name, Validators.required),
      participants: this.fb.control(event.participants.map((participant: EventParticipantModel) => participant.participantId)),
      dates: this.fb.array(event.dates.map((date: DateModel) => this.fb.group({
        startDate: this.fb.control(formatDate(new Date(date.timestamp), this.inputDateFormat)),
        endDate: this.fb.control(formatDate(new Date(date.timestamp + date.duration),
          this.inputDateFormat)),
      })))
    });
  }

  submit(): void {
    (this.type === 'create'
        ? this.eventsService.createScheduling(this.getSubmitModel())
        : this.eventsService.editScheduling(this.event.eventId, this.getSubmitModel())
    )
      .pipe(take(1))
      .subscribe(
        () => this.handleSubmitSuccess(),
        (error: HttpErrorResponse) => this.handleSubmitError(error)
      );
  }

  addDateControl(): void {
    this.datesControl.push(this.fb.group({
      startDate: this.fb.control(''),
      endDate: this.fb.control('')
    }));
  }

  removeDateControl(index: number): void {
    this.datesControl.removeAt(index);
  }

  private getSubmitModel(): SchedulingSubmitModel {
    return {
      eventName: this.getControlValue('name'),
      creatorId: this.authService.userId,
      dates: this.datesControl.controls.map((dateGroup: AbstractControl) => this.resolveDateModel(dateGroup)),
      participantsIds: this.getControlValue('participants'),
      type: this.eventType
    };
  }

  private resolveDateModel(dateGroup: AbstractControl): DateModel {
    const startTime: number = dateGroup.get('startDate').value
      && parseDate(dateGroup.get('startDate').value, this.inputDateFormat).getTime() || 0;
    const endTime: number = dateGroup.get('endDate').value
      && parseDate(dateGroup.get('endDate').value, this.inputDateFormat).getTime() || startTime;
    return {
      timestamp: startTime,
      duration: endTime - startTime
    };
  }

  // HANDLERS
  private handleSubmitSuccess(): void {
    this.alertService.next(createFormSuccessAlert('Scheduling event submitted with success!'));
    this.closeEmitter.emit(true);
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    console.error('Error submitting an new invite event', error);
    this.alertService.next(createFormErrorAlert('Error submitting the scheduling form! Please try again later'));
  }

}
