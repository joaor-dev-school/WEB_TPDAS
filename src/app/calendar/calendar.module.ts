import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarComponent } from './calendar.component';
import { CalendarInviteFormComponent } from './invite-form/calendar-invite-form.component';
import { EventModalComponent } from './event-modal/event-modal.component';


@NgModule({
  declarations: [
    CalendarComponent,
    CalendarInviteFormComponent,
    EventModalComponent
  ],
  imports: [
    SharedModule,
    CalendarRoutingModule
  ]
})
export class CalendarModule {
}
