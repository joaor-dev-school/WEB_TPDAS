import { EditProfileStateDataModel } from '../models/edit-profile-state-data.model';
import { EditProfileStatesEnum } from '../models/edit-profile-states.enum';
import { EditProfileMenuState } from './edit-profile-menu-state';
import { EditProfileStateAdapter } from './edit-profile-state-adapter';
import { IEditProfileState } from './i-edit-profile-state';

export class EditProfilePreferencesState extends EditProfileStateAdapter {
  constructor(data: EditProfileStateDataModel) {
    super(data, EditProfileStatesEnum.PREFERENCES);
  }

  back(): IEditProfileState {
    return new EditProfileMenuState(this.data);
  }
}
