import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';
import { BACKGROUND_REQUEST } from './background-request';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(BACKGROUND_REQUEST)) return next(req);

  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // A 404 is not an outage: the page shows its own "not found" state, and Retry can't help.
      if (error.status !== 404) errorHandler.setError(friendlyMessage(error));
      return throwError(() => error);
    })
  );
};

/** Angular's own error.message ("Http failure response for <url>: ...") is not meant for users. */
function friendlyMessage(error: HttpErrorResponse): string {
  if (error.status === 0) return "Can't reach the server. Check your connection and try again.";
  return error.error?.status_message || error.error?.message || 'Something went wrong. Please try again.';
}
