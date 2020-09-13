import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCheckSquare, faMinusSquare } from '@fortawesome/free-solid-svg-icons';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { ActionsModalService } from '../../shared/actions-modal/actions-modal.service';
import { FilenamesListModel } from '../../shared/actions-modal/models/filenames-list.model';
import { AlertModalManagerService } from '../../shared/alert-manager/alert-modal-manager.service';
import { createFormErrorAlert, createFormSuccessAlert } from '../../shared/alert-manager/models/alert-modal.model';

@Component({
  selector: 'app-actions-modal',
  templateUrl: './actions-modal.component.html',
  styleUrls: ['./actions-modal.component.scss']
})
export class ActionsModalComponent implements OnInit, OnDestroy {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  filenameValue: string;

  checkIcon: IconDefinition = faCheckSquare;

  minusIcon: IconDefinition = faMinusSquare;

  isLoading: boolean;

  hasError: boolean;

  filenames: string[];

  private modalRef: BsModalRef;
  private readonly subscriptions: Subscription[];

  constructor(private modalService: BsModalService, private readonly actionsModalService: ActionsModalService,
              private readonly alertService: AlertModalManagerService) {
    this.subscriptions = [];
  }

  ngOnInit(): void {
    this.subscriptions.push(this.modalService.onHide.subscribe(() => this.modalRef = null));
    this.subscribeForOpenModal();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  closeModal(): void {
    this.modalRef?.hide();
  }

  saveCalendar(): void {
    if (this.filenameValue) {
      this.actionsModalService.save(this.filenameValue)
        .pipe(take(1))
        .subscribe(
          () => this.handleSaveCalendarSuccess(),
          (error: HttpErrorResponse) => this.handleSaveCalendarError(error)
        );
    }
  }

  loadCalendar(filename: string): void {
    this.actionsModalService.load(filename)
      .pipe(take(1))
      .subscribe(
        () => this.handleLoadCalendarSuccess(),
        (error: HttpErrorResponse) => this.handleLoadCalendarError(error)
      );
  }

  removeCalendar(filename: string): void {
    this.actionsModalService.delete(filename)
      .pipe(take(1))
      .subscribe(
        () => this.handleDeleteCalendarSuccess(),
        (error: HttpErrorResponse) => this.handleDeleteCalendarError(error)
      );
  }

  resetCalendar(): void {
    this.actionsModalService.reset()
      .pipe(take(1))
      .subscribe(
        () => this.handleResetCalendarSuccess(),
        (error: HttpErrorResponse) => this.handleResetCalendarError(error)
      );
  }

  private fetchFilenames(): void {
    this.isLoading = true;
    this.hasError = false;

    this.actionsModalService.filenames()
      .pipe(take(1))
      .subscribe(
        (filenamesList: FilenamesListModel) => this.handleFetchFilenamesSuccess(filenamesList),
        (error: HttpErrorResponse) => this.handleFetchFilenamesError(error)
      );
  }

  private subscribeForOpenModal(): void {
    this.subscriptions.push(this.actionsModalService.openModal$.subscribe(() => {
      if (!this.modalRef) {
        this.modalRef = this.modalService.show(this.modalContent, { class: 'modal-md' });
        this.fetchFilenames();
      }
    }));
  }

  // HANDLERS
  private handleFetchFilenamesSuccess(filenamesList: FilenamesListModel): void {
    this.filenames = filenamesList.filenames;
    this.hasError = false;
    this.isLoading = false;
  }

  private handleFetchFilenamesError(error: HttpErrorResponse): void {
    console.error(error);
    this.hasError = true;
    this.isLoading = false;
  }

  private handleSaveCalendarSuccess(): void {
    this.alertService.next(createFormSuccessAlert('Calendar saved with success'));
    this.filenameValue = null;
    this.fetchFilenames();
  }

  private handleSaveCalendarError(error: HttpErrorResponse): void {
    console.error(error);
    this.alertService.next(createFormErrorAlert('Error saving the calendar! Try again later...'));
  }

  private handleLoadCalendarSuccess(): void {
    this.alertService.next(createFormSuccessAlert('Calendar loaded with success'));
    this.actionsModalService.changesMade.next();
  }

  private handleLoadCalendarError(error: HttpErrorResponse): void {
    console.error(error);
    this.alertService.next(createFormErrorAlert('Error loading the calendar! Try again later...'));
  }

  private handleDeleteCalendarSuccess(): void {
    this.alertService.next(createFormSuccessAlert('Calendar deleted with success'));
    this.fetchFilenames();
  }

  private handleDeleteCalendarError(error: HttpErrorResponse): void {
    console.error(error);
    this.alertService.next(createFormErrorAlert('Error deleting the calendar! Try again later...'));
  }

  private handleResetCalendarSuccess(): void {
    this.alertService.next(createFormSuccessAlert('Calendar reset with success'));
    this.actionsModalService.changesMade.next();
  }

  private handleResetCalendarError(error: HttpErrorResponse): void {
    console.error(error);
    this.alertService.next(createFormErrorAlert('Error reset the calendar! Try again later...'));
  }

}
