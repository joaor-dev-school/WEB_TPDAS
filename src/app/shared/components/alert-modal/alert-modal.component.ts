import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertModalManagerService } from '../../alert-manager/alert-modal-manager.service';
import { AlertModalModel } from '../../alert-manager/models/alert-modal.model';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent {

  alerts$: Observable<AlertModalModel[]>;

  constructor(private readonly alertService: AlertModalManagerService) {
    this.alerts$ = this.alertService.alerts$;
  }

  onClose(alert: AlertModalModel): void {
    this.alertService.delete(alert);
  }

  trackByFn(index: number, item: AlertModalModel): number {
    return item.id;
  }

}
