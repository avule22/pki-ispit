import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localeSr from '@angular/common/locales/sr';

import { AppComponent } from './app/app.component';

import { routes } from './app/app.routes';
import { MatSnackBarModule } from '@angular/material/snack-bar';


registerLocaleData(localeSr, 'sr');

bootstrapApplication(AppComponent, {
  providers: [

    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'sr' },
    MatSnackBarModule
  ]
}).catch(err => console.error(err));
