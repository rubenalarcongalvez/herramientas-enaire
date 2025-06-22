import { Component, computed, inject, signal } from '@angular/core';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';

/* Imports primeng */
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from './shared/services/storage.service';
import { ToastModule } from 'primeng/toast';
import { DrawerModule } from 'primeng/drawer';
import { MessageService } from 'primeng/api';
import { esMismoDiaCumple } from './shared/util/util';
import { Usuario } from './shared/interfaces/usuario';

@Component({
  selector: 'app-root',
  imports: [FooterComponent, RouterOutlet, RouterLink, RouterLinkActive, AuthenticationComponent, TooltipModule, ButtonModule, CommonModule, ProgressSpinnerModule, ToastModule, DrawerModule],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  sprintSeleccionado = inject(StorageService).sprintSeleccionado;
  numerosSprints = inject(StorageService).numerosSprints;
  usuarios = inject(StorageService).usuarios;
  cargado = signal(false);
  visibleSidebar: boolean = false;
  fechaActual: Date = new Date();
  personasQueCumplenAnoHoy = computed(() => this.usuarios().filter(usu => esMismoDiaCumple(usu.cumpleanos as any, this.fechaActual)).map(usu => usu?.alias ? usu?.alias : usu?.nombre).join(' y '));

  constructor(private storageService: StorageService, private messageService: MessageService, private router: Router) {}

  ngOnInit() {
    const contrasenaAcceso = localStorage.getItem('contrasenaAcceso');
    if (contrasenaAcceso) {
      this.storageService.obtenerNumerosSprints(contrasenaAcceso).subscribe({
        next: (resp) => {
          this.numerosSprints.set(resp);
          this.sprintSeleccionado.set(resp[0] || null);
          sessionStorage.setItem('contrasenaAcceso', contrasenaAcceso);
          this.cargado.set(true);
          if (this.router.url == '/') {
            this.router.navigateByUrl(`/sprint/${this.sprintSeleccionado()}`);
          }
        }, error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'No se pudo obtener la información', detail: 'Vuelva a iniciar sesión', life: 3000 });
          sessionStorage.removeItem('contrasenaAcceso');
          sessionStorage.removeItem('contrasenaAdmin');
          this.cargado.set(true);
        }
      });
      
      /* Obtenemos los usuarios tambien */
      this.storageService.getCollectionByAddress(`${contrasenaAcceso}/usuarios`).subscribe({
        next: (resp) => {
          this.usuarios.set(resp as Usuario[]);
        }, error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'No se pudieron cargar los usuarios', detail: 'Vuelva a iniciar sesión si el problema persiste', life: 3000 });
        }
      });
    } else {
      this.cargado.set(true);
    }
  }

  get contrasenaAcceso(): string | undefined | null {
    return sessionStorage.getItem('contrasenaAcceso') || null; // Si no hay contrasena, no entras. Sacarla del localStorage si hay tambien
  }

  redirigir(url: string) {
    this.visibleSidebar = false;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(url);
    });
  }

  cerrarSesion() {
    sessionStorage.removeItem('contrasenaAcceso');
    localStorage.removeItem('contrasenaAcceso');
    sessionStorage.removeItem('contrasenaAdmin');
    localStorage.removeItem('contrasenaAdmin');
  }
}
