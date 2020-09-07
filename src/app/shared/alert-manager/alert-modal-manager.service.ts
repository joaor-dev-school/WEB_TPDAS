import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertModalModel } from './models/alert-modal.model';

@Injectable({
  providedIn: 'root'
})
export class AlertModalManagerService {
  private static countAlerts: number = 0;

  private alertSubject: BehaviorSubject<AlertModalModel[]>;

  get alerts$(): Observable<AlertModalModel[]> {
    return this.alertSubject.asObservable();
  }

  constructor() {
    this.alertSubject = new BehaviorSubject([]);
  }

  next(alert: AlertModalModel): void {
    alert.id = ++AlertModalManagerService.countAlerts;
    this.alertSubject.next([...this.alertSubject.value, alert]);
  }

  delete(alert: AlertModalModel): void {
    this.alertSubject.next(this.alertSubject.value.filter((a: AlertModalModel) => a !== alert));
  }

}
