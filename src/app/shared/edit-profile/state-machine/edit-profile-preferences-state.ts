import { HttpErrorResponse } from '@angular/common/http';
import { createFormErrorAlert, createFormSuccessAlert } from '../../alert-manager/models/alert-modal.model';
import { EditProfileStateMessage } from '../messages/edit-profile-state.message';
import { EditProfileStateDataModel } from '../models/edit-profile-state-data.model';
import { EditProfileStatesEnum } from '../models/edit-profile-states.enum';
import { UserSchedulingPreferencesModel } from '../models/user-scheduling-preferences.model';
import { EditProfileMenuState } from './edit-profile-menu-state';
import { EditProfileStateAdapter } from './edit-profile-state-adapter';
import { IEditProfileState } from './i-edit-profile-state';

export class EditProfilePreferencesState extends EditProfileStateAdapter {
  constructor(data: EditProfileStateDataModel) {
    super(data, EditProfileStatesEnum.PREFERENCES);
  }

  changePreferences(preferences: UserSchedulingPreferencesModel): Promise<IEditProfileState> {
    return new Promise((resolve: EditProfileStateMessage): void => {
      this.authService.changePreferences(preferences)
        .then(() => {
          this.data.isSubmitting = true;
          this.data.errorMessage = null;
          this.alertService.next(createFormSuccessAlert('Preferences changed with success'));
          resolve(new EditProfileMenuState(this.data));
        })
        .catch((error: HttpErrorResponse) => {
          console.error(error);
          this.data.isSubmitting = false;
          this.data.errorMessage = null;
          this.alertService.next(createFormErrorAlert('Unable to change preferences! Please try again later...'));
          resolve(this);
        });
    });
  }

  back(): IEditProfileState {
    return new EditProfileMenuState(this.data);
  }
}
