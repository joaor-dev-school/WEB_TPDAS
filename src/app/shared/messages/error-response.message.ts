import { HttpErrorResponse } from '@angular/common/http';

export type ErrorResponseMessage = (value: HttpErrorResponse) => void;
