import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeng/themes/material';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()), provideFirebaseApp(() => initializeApp({ projectId: "miscellaneous-fts", appId: "1:852596679231:web:4c2de8ae40caf3d0de4e8a", storageBucket: "miscellaneous-fts.firebasestorage.app", apiKey: "AIzaSyD-LQSRgvUBtAQP4-nXc4gbf6f91DTSQ34", authDomain: "miscellaneous-fts.firebaseapp.com", messagingSenderId: "852596679231", measurementId: "G-VBPXJD3S5K" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Material,
        options: { darkModeSelector: 'light' }
      },
      ripple: true
    })
  ]
};
