import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AlertModalManagerService } from '../../alert-manager/alert-modal-manager.service';
import { createListErrorAlert } from '../../alert-manager/models/alert-modal.model';
import { DateModel } from '../../models/date.model';
import { SelectItemModel } from '../../models/select-item.model';
import { UserModel } from '../../users/models/user.model';
import { UsersListModel } from '../../users/models/users-list.model';
import { UsersService } from '../../users/users.service';
import { emptyEventDetails, EventDetailsModel } from '../models/event-details.model';
import { DURATION_FORMAT, INPUT_DATE_FORMAT } from '../utils/events.utils';

export abstract class EventForm {

  abstract get submit$(): Observable<void>;

  abstract get event(): EventDetailsModel;

  eventForm: FormGroup;

  usersItems$: Observable<SelectItemModel[]>;

  isLoading: boolean;

  readonly inputDateFormat: string;
  readonly durationFormat: string;
  readonly usersListSubject: BehaviorSubject<UsersListModel>;
  readonly subscriptions: Subscription[];

  constructor(readonly usersService: UsersService, readonly alertService: AlertModalManagerService) {
    this.isLoading = true;
    this.inputDateFormat = INPUT_DATE_FORMAT;
    this.durationFormat = DURATION_FORMAT;
    this.subscriptions = [];
    this.usersListSubject = new BehaviorSubject(null);
    this.usersItems$ = this.usersListSubject.pipe(map((usersList: UsersListModel) =>
      usersList.items.map((user: UserModel) => ({ label: user.username, value: user.id }))));
  }

  onInit(): void {
    this.isLoading = true;
    this.fetchUsers();
    this.subscriptions.push(this.submit$.subscribe(() => this.submit()));
  }

  onDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  getControlValue(name: string): any {
    return this.eventForm.get(name)?.value;
  }

  abstract submit(): void;

  abstract buildEventForm(event: EventDetailsModel): void;

  private fetchUsers(): void {
    this.subscriptions.push(
      this.usersService.fetchAll()
        .pipe(take(1))
        .subscribe((users: UsersListModel) => {
            const eventModel: EventDetailsModel = this.event || emptyEventDetails();
            eventModel.dates.sort((dateA: DateModel, dateB: DateModel) => dateA.timestamp - dateB.timestamp);
            this.usersListSubject.next(users);
            this.buildEventForm(eventModel);
            this.isLoading = false;
          },
          (error: HttpErrorResponse) => {
            console.error('Error fetching users', error);
            this.alertService.next(createListErrorAlert('Error fetching users! Please try again later'));
          })
    );
  }
}
