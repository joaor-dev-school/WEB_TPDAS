import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { EditProfileRoutingModule } from './edit-profile-routing.module';
import { EditProfileComponent } from './edit-profile.component';


@NgModule({
  declarations: [EditProfileComponent],
  imports: [
    SharedModule,
    EditProfileRoutingModule
  ]
})
export class EditProfileModule {
}
