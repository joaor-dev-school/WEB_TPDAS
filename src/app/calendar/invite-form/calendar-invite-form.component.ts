import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { addDays } from 'date-fns';
import { formatDate, parseDate } from 'ngx-bootstrap/chronos';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { filter, map, take, withLatestFrom } from 'rxjs/operators';
import { AuthService } from '../../shared/auth/auth.service';
import { EventPeriodicityDaysTypeEnum } from '../../shared/events/event-periodicity-days-type.enum';
import { EventsService } from '../../shared/events/events.service';
import { EventSubmitModel } from '../../shared/events/models/event-submit.model';
import { formattedTime, FormType, mapPeriodicityRulesToFormControls } from '../../shared/events/utils/event-form.utils';
import { emptyEventDetails, EventDetailsModel } from '../../shared/events/models/event-details.model';
import { EventParticipantModel } from '../../shared/events/models/event-participant.model';
import { emptyEventPeriodicityRule, EventPeriodicityRuleModel } from '../../shared/events/models/event-periodicity-rule.model';
import { DateModel } from '../../shared/models/date.model';
import { SelectItemModel } from '../../shared/models/select-item.model';
import { UserModel } from '../../shared/users/models/user.model';
import { UsersListModel } from '../../shared/users/models/users-list.model';
import { UsersService } from '../../shared/users/users.service';

@Component({
  selector: 'app-invite-form',
  templateUrl: './calendar-invite-form.component.html',
  styleUrls: ['./calendar-invite-form.component.scss']
})
export class CalendarInviteFormComponent implements OnInit, OnDestroy {

  @Input() event: EventDetailsModel;

  @Input() submitObservable: Observable<void>;

  @Output() closeEmitter: EventEmitter<boolean>;

  @Input() type: FormType;

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
    return this.event.dates.map((date: DateModel) => `${formatDate(new Date(date.timestamp), this.inputDateFormat)} (${formattedTime(date.duration, this.durationFormat).split(':').join('h ')}m)`);
  }

  eventForm: FormGroup;

  usersItems$: Observable<SelectItemModel[]>;

  isLoading: boolean;

  get userItemsDetails(): string {
    return this.usersListSubject.value?.items.map((item: UserModel) => item.username).join(', ');
  }

  readonly inputDateFormat: string;
  readonly durationFormat: string;

  private readonly usersListSubject: BehaviorSubject<UsersListModel>;
  private readonly subscriptions: Subscription[];

  constructor(private readonly cd: ChangeDetectorRef, private readonly fb: FormBuilder, private readonly eventsService: EventsService,
              private readonly usersService: UsersService, private readonly authService: AuthService) {
    this.closeEmitter = new EventEmitter();
    this.isLoading = true;
    this.inputDateFormat = 'MMMM Do YYYY, h:mm:ss a';
    this.durationFormat = 'h:mm';
    this.subscriptions = [];
    this.usersListSubject = new BehaviorSubject(null);
    this.usersItems$ = this.usersListSubject.pipe(map((usersList: UsersListModel) =>
      usersList.items.map((user: UserModel) => ({ label: user.username, value: user.id }))));
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchUsers();
    this.subscriptions.push(this.submitObservable.subscribe(() => this.submit()));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
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

  private fetchUsers(): void {
    this.subscriptions.push(
      this.usersService.fetchAll()
        .pipe(take(1))
        .subscribe((users: UsersListModel) => {
          this.usersListSubject.next(users);
          this.buildEventForm(this.event || emptyEventDetails());
          this.isLoading = false;
        })
    );
  }

  private getSubmitModel(): EventSubmitModel {
    const startTime: number = this.getControlValue('startDate')
      && parseDate(this.getControlValue('startDate'), this.inputDateFormat).getTime() || 0;
    const endTime: number = this.getControlValue('endDate')
      && parseDate(this.getControlValue('endDate'), this.inputDateFormat).getTime() || startTime;
    return {
      eventName: this.getControlValue('name'),
      creatorId: this.authService.userId,
      date: {
        timestamp: startTime,
        duration: Math.abs(startTime - endTime)
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

  private buildEventForm(event: EventDetailsModel): void {
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

  // HANDLERS
  private handleSubmitSuccess(): void {
    this.closeEmitter.emit(true);
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    console.error('Error submitting an new invite event', error);
  }
}
