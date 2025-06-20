import { Component, signal } from '@angular/core';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';

/* Imports primeng */
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from './shared/services/storage.service';

@Component({
  selector: 'app-root',
  imports: [FooterComponent, RouterOutlet, RouterLink, AuthenticationComponent, TooltipModule, ButtonModule, CommonModule, ProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  sprintSeleccionado: number = 42;
  cargado = signal(false);

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    const contrasenaAcceso = localStorage.getItem('contrasenaAcceso') + '/sprints/42';
    if (contrasenaAcceso) {
      this.storageService.existeDocumento(`herramientas-enaire/${contrasenaAcceso}`).then((resp) => {
        if (resp) {
          sessionStorage.setItem('contrasenaAcceso', contrasenaAcceso);
        } else {
          sessionStorage.removeItem('contrasenaAcceso');
          sessionStorage.removeItem('contrasenaAdmin');
        }
      }).catch((err) => {
        console.error(err);
        sessionStorage.removeItem('contrasenaAcceso');
        sessionStorage.removeItem('contrasenaAdmin');
      }).finally(() => this.cargado.set(true));
    } else {
      this.cargado.set(true);
    }
  }

  get contrasenaAcceso(): string | undefined | null {
    return sessionStorage.getItem('contrasenaAcceso') || null; // Si no hay contrasena, no entras. Sacarla del localStorage si hay tambien
  }

  cerrarSesion() {
    sessionStorage.removeItem('contrasenaAcceso');
    localStorage.removeItem('contrasenaAcceso');
    sessionStorage.removeItem('contrasenaAdmin');
    localStorage.removeItem('contrasenaAdmin');
  }
}
