import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { parseDate } from 'ngx-bootstrap/chronos';

import { AlertModalManagerService } from '../shared/alert-manager/alert-modal-manager.service';
import { AuthService } from '../shared/auth/auth.service';
import { EditProfileStateDataModel, initialEditProfileStateData } from '../shared/edit-profile/models/edit-profile-state-data.model';
import { EditProfileStatesEnum } from '../shared/edit-profile/models/edit-profile-states.enum';
import {
  UserSchedulingPreferenceTypeEnum,
  userSchedulingPreferenceTypes
} from '../shared/edit-profile/models/user-scheduling-preference-type.enum';
import { UserSchedulingPreferenceModel } from '../shared/edit-profile/models/user-scheduling-preference.model';
import { UserSchedulingPreferencesModel } from '../shared/edit-profile/models/user-scheduling-preferences.model';
import { EditProfileInitialState } from '../shared/edit-profile/state-machine/edit-profile-initial-state';
import { IEditProfileState } from '../shared/edit-profile/state-machine/i-edit-profile-state';
import { INPUT_DATE_FORMAT } from '../shared/events/utils/events.utils';

type PrefType = 'preferred' | 'acceptable';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {

  states: typeof EditProfileStatesEnum = EditProfileStatesEnum;
  state: IEditProfileState;
  stateData: EditProfileStateDataModel;
  userProfileForm: FormGroup;

  preferenceTypes: UserSchedulingPreferenceTypeEnum[];

  get preferencesFormArray(): FormArray {
    return this.userProfileForm.get('preferences') as FormArray;
  }

  get stateType(): EditProfileStatesEnum {
    return this.state?.getType();
  }

  readonly inputDateFormat: string;

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService, private readonly router: Router,
              private readonly alertService: AlertModalManagerService) {
    this.inputDateFormat = INPUT_DATE_FORMAT;
    this.preferenceTypes = userSchedulingPreferenceTypes();
  }

  ngOnInit(): void {
    this.userProfileForm = this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.min(5)]),
      password: this.fb.control('', [Validators.required, Validators.min(5)]),
      confirmPassword: this.fb.control('', [Validators.required, Validators.min(5)]),
      preferences: this.fb.array([this.createEmptyPreferenceControl()])
    });
    this.stateData = initialEditProfileStateData(this.router, this.authService, this.alertService, this.userProfileForm);
    this.state = new EditProfileInitialState(this.stateData);
  }

  async checkPassword(): Promise<void> {
    this.state = await this.state.checkPassword(this.userProfileForm.get('password').value);
  }

  enterChangeUser(): void {
    this.state = this.state.enterChangeUser();
  }

  enterChangePass(): void {
    this.state = this.state.enterChangePass();
  }

  enterChangePreferences(): void {
    this.state = this.state.enterChangePreferences();
  }

  exitChangeProfile(): void {
    this.router.navigate(['calendar'])
      .catch((error: any) => console.error(error));
  }

  back(): void {
    this.state = this.state.back();
  }

  async changeUser(): Promise<void> {
    this.state = await this.state.changeUser(this.userProfileForm.get('name').value);
  }

  async changePassword(): Promise<void> {
    this.state = await this.state.changePass(this.userProfileForm.get('password').value);
  }

  async changePreferences(): Promise<void> {
    this.state = await this.state.changePreferences(this.getPreferencesModel());
  }

  addPreference(): void {
    this.preferencesFormArray.push(this.createEmptyPreferenceControl());
  }

  removePreference(prefIndex: number): void {
    this.preferencesFormArray.removeAt(prefIndex);
  }

  private getPreferencesModel(): UserSchedulingPreferencesModel {
    const preferred: UserSchedulingPreferenceModel[] = [];
    const acceptable: UserSchedulingPreferenceModel[] = [];
    for (const preferenceControl of this.preferencesFormArray.controls) {
      const pref: UserSchedulingPreferenceModel = {
        fromTimestamp: parseDate(preferenceControl.get('from').value, this.inputDateFormat).getTime(),
        toTimestamp: parseDate(preferenceControl.get('to').value, this.inputDateFormat).getTime(),
        type: preferenceControl.get('type').value
      };

      preferenceControl.get('prefType').value === 'preferred' ? preferred.push(pref) : acceptable.push(pref);
    }
    return { userId: this.authService.userId, preferred, acceptable };
  }

  private createEmptyPreferenceControl(): AbstractControl {
    return this.fb.group({
      type: this.fb.control(''),
      from: this.fb.control(''),
      to: this.fb.control(''),
      prefType: this.fb.control('preferred')
    });
  }
}
