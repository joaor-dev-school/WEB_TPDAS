import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarComponent } from './calendar.component';
import { CalendarInviteFormComponent } from './invite-form/calendar-invite-form.component';
import { EventModalComponent } from './event-modal/event-modal.component';
import { SchedulingFormComponent } from './scheduling-form/scheduling-form.component';
import { UserEventsTableComponent } from './user-events-table/user-events-table.component';


@NgModule({
  declarations: [
    CalendarComponent,
    CalendarInviteFormComponent,
    EventModalComponent,
    SchedulingFormComponent,
    UserEventsTableComponent
  ],
  imports: [
    SharedModule,
    CalendarRoutingModule
  ]
})
export class CalendarModule {
}
