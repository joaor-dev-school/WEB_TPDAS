import { HttpErrorResponse } from '@angular/common/http';
import { createFormErrorAlert } from '../../alert-manager/models/alert-modal.model';
import { EditProfileStateMessage } from '../messages/edit-profile-state.message';
import { EditProfileStateDataModel } from '../models/edit-profile-state-data.model';
import { EditProfileStatesEnum } from '../models/edit-profile-states.enum';
import { EditProfileMenuState } from './edit-profile-menu-state';
import { EditProfileStateAdapter } from './edit-profile-state-adapter';
import { IEditProfileState } from './i-edit-profile-state';

export class EditProfileInitialState extends EditProfileStateAdapter {
  constructor(data: EditProfileStateDataModel) {
    super(data, EditProfileStatesEnum.INITIAL);
  }

  changePass(password: string): Promise<IEditProfileState> {
    return new Promise((resolve: EditProfileStateMessage) => {
      console.log(password)
      this.data.isSubmitting = true;
      this.authService.checkPassword(password)
        .then(() => {
          this.data.isSubmitting = false;
          this.data.errorMessage = null;
          this.formPassword.setValue(null);
          resolve(new EditProfileMenuState(this.data));
        })
        .catch((error: HttpErrorResponse) => {
          console.error(error);
          this.data.isSubmitting = false;
          this.data.errorMessage = null;
          this.alertService.next(createFormErrorAlert('Wrong password! Try again...'));
          resolve(this);
        });
    });
  }
}
