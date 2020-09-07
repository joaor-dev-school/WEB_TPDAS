import { NgModule } from '@angular/core';
import { AlertModule } from 'ngx-bootstrap/alert';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [],
  imports: [
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    BsDropdownModule.forRoot(),
    FontAwesomeModule
  ],
  exports: [
    BsDatepickerModule,
    ModalModule,
    AlertModule,
    BsDropdownModule,
    FontAwesomeModule
  ]
})
export class NgxBootstrapModule {
}
