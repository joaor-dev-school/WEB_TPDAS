import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FilenamesListModel } from './models/filenames-list.model';

@Injectable({
  providedIn: 'root'
})
export class ActionsModalService {

  changesMade: Subject<void> = new Subject();

  openModal$: Subject<void> = new Subject();

  constructor(private readonly httpClient: HttpClient) {
  }

  filenames(): Observable<FilenamesListModel> {
    return this.httpClient.get<FilenamesListModel>(`${environment}/store/list`);
  }

  save(filename: string): Observable<void> {
    return this.httpClient.put<void>(`${environment}/store/${filename}/save`, null);
  }

  load(filename: string): Observable<void> {
    return this.httpClient.put<void>(`${environment}/store/${filename}/load`, null);
  }
}
