import { Component } from '@angular/core';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';

/* Imports primeng */
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FooterComponent, RouterOutlet, RouterLink, AuthenticationComponent, TooltipModule, ButtonModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  sprintSeleccionado: number = 42;
  cargado: boolean = false;

  public get contrasenaAcceso(): string | undefined | null {
    return sessionStorage.getItem('contrasenaAcceso') || null; // Si no hay contrasena, no entras. Sacarla del localStorage si hay tambien
  }
  
  public set contrasenaAcceso(v: string) {
    this.contrasenaAcceso = v;
  }
  
}
