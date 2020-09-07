import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCheckSquare, faMinusSquare } from '@fortawesome/free-solid-svg-icons';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { ActionsModalService } from '../../shared/actions-modal/actions-modal.service';
import { FilenamesListModel } from '../../shared/actions-modal/models/filenames-list.model';

@Component({
  selector: 'app-actions-modal',
  templateUrl: './actions-modal.component.html',
  styleUrls: ['./actions-modal.component.scss']
})
export class ActionsModalComponent implements OnInit, OnDestroy {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  checkIcon: IconDefinition = faCheckSquare;

  minusIcon: IconDefinition = faMinusSquare;

  isLoading: boolean;

  hasError: boolean;

  filenames: string[];

  private modalRef: BsModalRef;
  private readonly subscriptions: Subscription[];

  constructor(private modalService: BsModalService, private readonly actionsModalService: ActionsModalService) {
    this.subscriptions = [];
  }

  ngOnInit(): void {
    this.subscribeForOpenModal();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  closeModal(): void {
    this.modalRef?.hide();
    this.modalRef = null;
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

}
