import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injector } from '@angular/core';

import { Observable } from 'rxjs';

// Interceptor Constants
const CONTENT_TYPE: string = 'Content-Type';
const ACCEPT: string = 'Accept';
const AUTHORIZATION: string = 'Authorization';
const APPLICATION_JSON_MIME_TYPE: string = 'application/json';

type StringFunction = (value: string) => string;
type HasHeaderFunction = (request: HttpRequest<any>, header: string) => boolean;
type HasBodyFunction = (request: HttpRequest<any>) => boolean;

const bearer: StringFunction = (value: string): string => {
  return `Bearer ${value}`;
};

const hasHeader: HasHeaderFunction = (request: HttpRequest<any>, header: string): boolean => {
  return request && request.headers && request.headers.has(header);
};

const hasBody: HasBodyFunction = (request: HttpRequest<any>): boolean => {
  return request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH';
};

export class Interceptor implements HttpInterceptor {
  constructor(private readonly injector: Injector) {
  }

  /**
   * Intercepts all HTTP requests and injects the access token. When a 401 HTTP code is detected then it will try to
   * refresh the access token and retry the request. If the authentication it's not possible it will send the user to
   * the login page.
   * @param request the request being executed.
   * @param next the HTTP handler to chain the request.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const nextRequest: HttpRequest<any> = this.setHeaders(request);
    return next.handle(nextRequest);
  }

  private setHeaders(request: HttpRequest<any>): HttpRequest<any> {
    const headers: any = {};
    let mutate: boolean = false;

    if (!hasHeader(request, CONTENT_TYPE) && hasBody(request) && !(request.body instanceof FormData)) {
      headers[CONTENT_TYPE] = APPLICATION_JSON_MIME_TYPE;
      mutate = true;
    }
    if (!hasHeader(request, ACCEPT)) {
      headers[ACCEPT] = APPLICATION_JSON_MIME_TYPE;
      mutate = true;
    }

    return mutate ? request.clone({ setHeaders: headers }) : request;
  }
}
