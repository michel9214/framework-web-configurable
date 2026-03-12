import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, throwError, BehaviorSubject, filter, take, switchMap, catchError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  // Don't attach token to auth routes
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  const token = tokenService.getAccessToken();
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return from(authService.refresh()).pipe(
            switchMap((newToken: string) => {
              isRefreshing = false;
              refreshTokenSubject.next(newToken);
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              }));
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => refreshError);
            }),
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => {
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
              }));
            }),
          );
        }
      }
      return throwError(() => error);
    }),
  );
};
