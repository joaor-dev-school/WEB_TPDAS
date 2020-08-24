import { NgModule } from '@angular/core';
import { AlertModule } from 'ngx-bootstrap/alert';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [],
  imports: [
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot()
  ],
  exports: [
    BsDatepickerModule,
    ModalModule,
    AlertModule
  ]
})
export class NgxBootstrapModule {
}
