import { UserSchedulingPreferenceModel } from './user-scheduling-preference.model';

export interface UserSchedulingPreferencesModel {
  userId: number;
  preferred: UserSchedulingPreferenceModel[];
  acceptable: UserSchedulingPreferenceModel[];
}
