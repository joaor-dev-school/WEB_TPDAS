import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../shared/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  isSubmitting: boolean;

  hasError: boolean;

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.logout()
      .catch((error: HttpErrorResponse) => console.error(error));
    this.buildLoginForm();
  }

  submit(): void {
    this.hasError = false;
    this.isSubmitting = false;
    this.authService.login({ username: this.getControlValue('username'), password: this.getControlValue('password') })
      .then(() => this.handleLoginSuccess())
      .catch((error: HttpErrorResponse) => this.handleLoginError(error));
  }

  private getControlValue(name: string): string {
    return this.loginForm.get(name).value;
  }

  private buildLoginForm(): void {
    this.loginForm = this.fb.group({
      username: this.fb.control('', [Validators.required, Validators.min(5)]),
      password: this.fb.control('', [Validators.required, Validators.min(5)])
    });
  }

  // HANDLERS
  private handleLoginSuccess(): void {
    this.hasError = false;
    this.isSubmitting = false;
    this.authService.redirectToPreviousUrl()
      .catch((error: any) => console.error(error));
  }

  private handleLoginError(error: HttpErrorResponse): void {
    console.error(error);
    this.hasError = true;
    this.isSubmitting = false;
  }

}
