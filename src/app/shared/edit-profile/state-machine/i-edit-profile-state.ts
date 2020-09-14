import { EditProfileStatesEnum } from '../models/edit-profile-states.enum';
import { UserSchedulingPreferencesModel } from '../models/user-scheduling-preferences.model';

export interface IEditProfileState {
  checkPassword(password: string): Promise<IEditProfileState>;

  enterChangeUser(): IEditProfileState;

  changeUser(name: string): Promise<IEditProfileState>;

  enterChangePass(): IEditProfileState;

  changePass(password: string): Promise<IEditProfileState>;

  enterChangePreferences(): IEditProfileState;

  changePreferences(preferences: UserSchedulingPreferencesModel): Promise<IEditProfileState>;

  exitChangeProfile(): Promise<IEditProfileState>;

  back(): IEditProfileState;

  getType(): EditProfileStatesEnum;
}
