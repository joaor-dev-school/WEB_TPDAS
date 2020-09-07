import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { formatDate, parseDate } from 'ngx-bootstrap/chronos';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AlertModalManagerService } from '../../shared/alert-manager/alert-modal-manager.service';
import { createFormErrorAlert, createFormSuccessAlert } from '../../shared/alert-manager/models/alert-modal.model';
import { AuthService } from '../../shared/auth/auth.service';
import { EventPeriodicityDaysTypeEnum } from '../../shared/events/event-periodicity-days-type.enum';
import { EventsService } from '../../shared/events/events.service';
import { EventForm } from '../../shared/events/form/event-form';
import { InviteSubmitModel } from '../../shared/events/models/invite-submit.model';
import { formattedTime, FormType, mapPeriodicityRulesToFormControls } from '../../shared/events/utils/event-form.utils';
import { EventDetailsModel } from '../../shared/events/models/event-details.model';
import { EventParticipantModel } from '../../shared/events/models/event-participant.model';
import { emptyEventPeriodicityRule, EventPeriodicityRuleModel } from '../../shared/events/models/event-periodicity-rule.model';
import { DateModel } from '../../shared/models/date.model';
import { UserModel } from '../../shared/users/models/user.model';
import { UsersService } from '../../shared/users/users.service';

@Component({
  selector: 'app-invite-form',
  templateUrl: './calendar-invite-form.component.html',
  styleUrls: ['./calendar-invite-form.component.scss']
})
export class CalendarInviteFormComponent extends EventForm implements OnInit, OnDestroy {

  @Input() eventDetails: EventDetailsModel;

  @Input() submitObservable: Observable<void>;

  @Output() closeEmitter: EventEmitter<boolean>;

  @Input() type: FormType;

  get submit$(): Observable<void> {
    return this.submitObservable;
  }

  get event(): EventDetailsModel {
    return this.eventDetails;
  }

  get eventPeriodicityDaysTypeEnums(): EventPeriodicityDaysTypeEnum[] {
    return [
      EventPeriodicityDaysTypeEnum.DAY,
      EventPeriodicityDaysTypeEnum.WEEK
    ];
  }

  get periodicityRulesControl(): FormArray {
    return this.eventForm?.get('periodicityRules') as FormArray;
  }

  get dates(): string[] {
    return this.event.dates.map((date: DateModel) => `${
      formatDate(new Date(date.timestamp), this.inputDateFormat)} (${
      formattedTime(date.duration, this.durationFormat).split(':').join('h ')}m)`);
  }

  get userItemsDetails(): string {
    return this.usersListSubject.value?.items.map((item: UserModel) => item.username).join(', ');
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

  getControlValue(name: string): any {
    return this.eventForm.get(name)?.value;
  }

  getRuleDaysControl(ruleGroup: AbstractControl): FormArray {
    return ruleGroup.get('days') as FormArray;
  }

  addDayControl(ruleGroup: AbstractControl): void {
    this.getRuleDaysControl(ruleGroup).push(this.fb.group({
      day: this.fb.control(null),
      include: this.fb.control(true)
    }));
  }

  addPeriodicityRule(): void {
    const newRuleControls: AbstractControl[] = mapPeriodicityRulesToFormControls(this.fb, [emptyEventPeriodicityRule()]);
    newRuleControls.forEach((newRuleControl: AbstractControl) => this.periodicityRulesControl.push(newRuleControl));
  }

  buildEventForm(event: EventDetailsModel): void {
    this.eventForm = this.fb.group({
      name: this.fb.control(event.name, Validators.required),
      participants: this.fb.control(event.participants.map((participant: EventParticipantModel) => participant.participantId)),
      startDate: this.fb.control(formatDate(new Date(event.dates[0].timestamp), this.inputDateFormat)),
      endDate: this.fb.control(formatDate(new Date(event.dates[0].timestamp + event.dates[0].duration),
        this.inputDateFormat)),
      periodicityActive: this.fb.control(!!event.periodicity),
      periodicityRules: this.fb.array(mapPeriodicityRulesToFormControls(this.fb,
        event.periodicity?.rules || [emptyEventPeriodicityRule()])),
      periodicityRange: this.fb.control(event.periodicity &&
        formatDate(new Date(event.periodicity.rangeTimestamp), this.inputDateFormat))
    });
  }

  removeDayControl(ruleGroup: AbstractControl, dayControlIndex: number): void {
    this.getRuleDaysControl(ruleGroup).removeAt(dayControlIndex);
  }

  removePeriodicityRule(ruleIndex: number): void {
    this.periodicityRulesControl.removeAt(ruleIndex);
  }

  submit(): void {
    (this.type === 'create'
        ? this.eventsService.createInvite(this.getSubmitModel())
        : this.eventsService.editInvite(this.event.eventId, this.getSubmitModel())
    )
      .pipe(take(1))
      .subscribe(
        () => this.handleSubmitSuccess(),
        (error: HttpErrorResponse) => this.handleSubmitError(error)
      );
  }

  private getSubmitModel(): InviteSubmitModel {
    const startTime: number = this.getControlValue('startDate')
      && parseDate(this.getControlValue('startDate'), this.inputDateFormat).getTime() || 0;
    const endTime: number = this.getControlValue('endDate')
      && parseDate(this.getControlValue('endDate'), this.inputDateFormat).getTime() || startTime;
    return {
      eventName: this.getControlValue('name'),
      creatorId: this.authService.userId,
      date: {
        timestamp: startTime,
        duration: endTime - startTime
      },
      participantsIds: this.getControlValue('participants'),
      periodicity: !this.getControlValue('periodicityActive') ? undefined : {
        rangeTimestamp: parseDate(this.getControlValue('periodicityRange'), this.inputDateFormat).getTime(),
        rules: this.periodicityRulesControl.controls.map((ruleControl: AbstractControl) =>
          this.resolveRuleControlToSubmitRule(ruleControl))
      }
    };
  }

  private resolveRuleControlToSubmitRule(ruleControl: AbstractControl): EventPeriodicityRuleModel {
    const days: number[] = [];
    const daysNot: number[] = [];

    for (const dayControl of this.getRuleDaysControl(ruleControl).controls) {
      if (dayControl.get('include').value) {
        days.push(dayControl.get('day').value);
      } else {
        daysNot.push(dayControl.get('day').value);
      }
    }

    return {
      daysType: ruleControl.get('daysType').value,
      step: ruleControl.get('step').value,
      days: days.length ? days : undefined,
      daysNot: daysNot.length ? daysNot : undefined
    };
  }

  // HANDLERS
  private handleSubmitSuccess(): void {
    this.alertService.next(createFormSuccessAlert('Invite submitted with success!'));
    this.closeEmitter.emit(true);
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    console.error('Error submitting an new invite event', error);
    this.alertService.next(createFormErrorAlert('Error submitting the invite form! Please try again later'));
  }
}
