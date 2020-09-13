import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertModalManagerService } from '../shared/alert-manager/alert-modal-manager.service';
import { createFormErrorAlert } from '../shared/alert-manager/models/alert-modal.model';
import { AuthService } from '../shared/auth/auth.service';
import { Router } from '@angular/router';
import { EditProfileStateDataModel, initialEditProfileStateData } from '../shared/edit-profile/models/edit-profile-state-data.model';
import { EditProfileStatesEnum } from '../shared/edit-profile/models/edit-profile-states.enum';
import { EditProfileInitialState } from '../shared/edit-profile/state-machine/edit-profile-initial-state';
import { IEditProfileState } from '../shared/edit-profile/state-machine/i-edit-profile-state';

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

  get stateType(): EditProfileStatesEnum {
    return this.state?.getType();
  }

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService, private readonly router: Router,
              private readonly alertService: AlertModalManagerService) {
  }

  ngOnInit(): void {
    this.userProfileForm = this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.min(5)]),
      password: this.fb.control('', [Validators.required, Validators.min(5)]),
      confirmPassword: this.fb.control('', [Validators.required, Validators.min(5)])
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
}
