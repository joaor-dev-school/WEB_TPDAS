import { HttpErrorResponse } from '@angular/common/http';

import { createFormErrorAlert, createFormSuccessAlert } from '../../alert-manager/models/alert-modal.model';
import { EditProfileStateMessage } from '../messages/edit-profile-state.message';
import { EditProfileStateDataModel } from '../models/edit-profile-state-data.model';
import { EditProfileStatesEnum } from '../models/edit-profile-states.enum';
import { EditProfileMenuState } from './edit-profile-menu-state';
import { EditProfileStateAdapter } from './edit-profile-state-adapter';
import { IEditProfileState } from './i-edit-profile-state';

export class EditProfilePasswordState extends EditProfileStateAdapter {
  constructor(data: EditProfileStateDataModel) {
    super(data, EditProfileStatesEnum.PASSWORD);
  }

  changePass(password: string): Promise<IEditProfileState> {
    return new Promise((resolve: EditProfileStateMessage): void => {
      console.log(password, this.formConfirmPassword.value !== password);
      if (this.formConfirmPassword.value !== password) {
        this.data.errorMessage = 'The passwords don\'t match!';
        return resolve(this);
      }

      this.data.isSubmitting = true;
      this.authService.changeUserPassword(password)
        .then(() => {
          this.data.isSubmitting = true;
          this.data.errorMessage = null;
          this.alertService.next(createFormSuccessAlert('Password changed with success'));
          resolve(new EditProfileMenuState(this.data));
        })
        .catch((error: HttpErrorResponse) => {
          console.error(error);
          this.data.isSubmitting = false;
          this.data.errorMessage = null;
          this.alertService.next(createFormErrorAlert('Unable to change password! Please try again later...'));
          resolve(this);
        });
    });
  }

  back(): IEditProfileState {
    return new EditProfileMenuState(this.data);
  }
}
