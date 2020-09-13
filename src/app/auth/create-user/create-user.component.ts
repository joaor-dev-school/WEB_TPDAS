import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlertModalManagerService } from '../../shared/alert-manager/alert-modal-manager.service';
import { createFormSuccessAlert } from '../../shared/alert-manager/models/alert-modal.model';
import { AuthService } from '../../shared/auth/auth.service';
import { CreateUserModel } from '../../shared/auth/models/create-user.model';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
})
export class CreateUserComponent implements OnInit {

  createUserForm: FormGroup;

  errorMessage: string;

  isSubmitting: boolean;

  constructor(private fb: FormBuilder, private authService: AuthService, private readonly alertService: AlertModalManagerService) {
  }

  ngOnInit(): void {
    this.createUserForm = this.fb.group({
      username: this.fb.control('', [Validators.required, Validators.min(5)]),
      password: this.fb.control('', [Validators.required, Validators.min(5)]),
      confirmpassword: this.fb.control('', [
        Validators.required,
        Validators.min(5),
      ]),
      name: this.fb.control('', [Validators.required, Validators.min(5)]),
    });
  }

  createUser(): void {
    const password: string = this.createUserForm.get('password').value;
    const confirmpassword: string = this.createUserForm.get('confirmpassword').value;
    if (confirmpassword !== password) {
      this.errorMessage = 'The passwords don\'t match!';
      return;
    }

    const userSubmit: CreateUserModel = {
      username: this.createUserForm.get('username').value,
      name: this.createUserForm.get('name').value,
      password
    };

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.createUser(userSubmit)
      .then(() => this.handleCreateUserSuccess(userSubmit))
      .catch((error: HttpErrorResponse) => this.handleCreateUserError(error));
  }

  // HANDLERS
  handleCreateUserSuccess(userSubmit: CreateUserModel): void {
    this.authService.login(userSubmit)
      .then(() => {
        this.authService
          .redirectToPreviousUrl()
          .catch((error: any) => console.error(error));
        this.isSubmitting = false;
      })
      .catch((error: HttpErrorResponse) => {
        console.error(error);
        this.alertService.next(createFormSuccessAlert('User created with success!'));
        this.isSubmitting = false;
      });
    this.errorMessage = null;
  }

  handleCreateUserError(error: HttpErrorResponse): void {
    console.error(error);
    if (error.error.errors?.[0]?.code === 'UniqueUsername') {
      this.errorMessage = 'Username already exists! Please try another...';
    } else {
      this.errorMessage = 'Error creating a new user. Please try again later';
    }
    this.isSubmitting = false;
  }
}
