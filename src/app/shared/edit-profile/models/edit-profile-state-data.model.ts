import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertModalManagerService } from '../../alert-manager/alert-modal-manager.service';
import { AuthService } from '../../auth/auth.service';

export interface EditProfileStateDataModel {
  form: FormGroup;
  authService: AuthService;
  router: Router;
  alertService: AlertModalManagerService;
  isSubmitting: boolean;
  errorMessage: string;
}

export function initialEditProfileStateData(router: Router, authService: AuthService, alertService: AlertModalManagerService,
                                            form: FormGroup): EditProfileStateDataModel {
  return {
    form,
    authService,
    router,
    alertService,
    isSubmitting: false,
    errorMessage: null
  };
}
