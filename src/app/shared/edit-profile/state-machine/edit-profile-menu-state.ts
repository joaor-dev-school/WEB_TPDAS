import { EditProfileStateDataModel } from '../models/edit-profile-state-data.model';
import { EditProfileStatesEnum } from '../models/edit-profile-states.enum';
import { EditProfilePasswordState } from './edit-profile-password-state';
import { EditProfilePreferencesState } from './edit-profile-preferences-state';
import { EditProfileStateAdapter } from './edit-profile-state-adapter';
import { EditProfileNameState } from './edit-profile-name-state';
import { IEditProfileState } from './i-edit-profile-state';

export class EditProfileMenuState extends EditProfileStateAdapter {
  constructor(data: EditProfileStateDataModel) {
    super(data, EditProfileStatesEnum.MENU);
    this.formUsername.setValue(null);
    this.formPassword.setValue(null);
    this.formConfirmPassword.setValue(null);
    this.data.isSubmitting = false;
    this.data.errorMessage = null;
  }

  enterChangeUser(): IEditProfileState {
    return new EditProfileNameState(this.data);
  }

  enterChangePass(): IEditProfileState {
    return new EditProfilePasswordState(this.data);
  }

  enterChangePreferences(): IEditProfileState {
    return new EditProfilePreferencesState(this.data);
  }
}
