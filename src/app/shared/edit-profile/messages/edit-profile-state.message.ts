import { IEditProfileState } from '../state-machine/i-edit-profile-state';

export type EditProfileStateMessage = (value: IEditProfileState) => void;
