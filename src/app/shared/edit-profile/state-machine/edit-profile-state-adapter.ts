import { AbstractControl, FormGroup } from '@angular/forms';

import { AlertModalManagerService } from '../../alert-manager/alert-modal-manager.service';
import { AuthService } from '../../auth/auth.service';
import { EditProfileStateDataModel } from '../models/edit-profile-state-data.model';
import { EditProfileStatesEnum } from '../models/edit-profile-states.enum';
import { UserSchedulingPreferencesModel } from '../models/user-scheduling-preferences.model';
import { IEditProfileState } from './i-edit-profile-state';

export abstract class EditProfileStateAdapter implements IEditProfileState {
  type: EditProfileStatesEnum;
  data: EditProfileStateDataModel;

  get formUsername(): AbstractControl {
    return this.data?.form.get('username');
  }

  get formPassword(): AbstractControl {
    return this.data?.form.get('password');
  }

  get formConfirmPassword(): AbstractControl {
    return this.data?.form.get('confirmPassword');
  }

  get authService(): AuthService {
    return this.data?.authService;
  }

  get alertService(): AlertModalManagerService {
    return this.data?.alertService;
  }

  get userProfileForm(): FormGroup {
    return this.data?.form;
  }

  constructor(stateData: EditProfileStateDataModel, stateType: EditProfileStatesEnum) {
    this.data = stateData;
    this.type = stateType;
  }

  changePass(password: string): Promise<IEditProfileState> {
    return Promise.resolve(this);
  }

  changePreferences(preferences: UserSchedulingPreferencesModel): IEditProfileState {
    return this;
  }

  changeUser(name: string): Promise<IEditProfileState> {
    return Promise.resolve(this);
  }

  checkPassword(password: string): Promise<IEditProfileState> {
    return Promise.resolve(this);
  }

  enterChangePass(): IEditProfileState {
    return this;
  }

  enterChangePreferences(): IEditProfileState {
    return this;
  }

  enterChangeUser(): IEditProfileState {
    return this;
  }

  exitChangeProfile(): Promise<IEditProfileState> {
    return Promise.resolve(this);
  }

  getType(): EditProfileStatesEnum {
    return this.type;
  }
}
