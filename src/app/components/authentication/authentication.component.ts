import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { StorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'app-authentication',
  imports: [ButtonModule, Message, AvatarModule, ProgressBarModule, CommonModule, PasswordModule, FormsModule, ReactiveFormsModule, CheckboxModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {
  loadingEntrar = signal(false);
  error = signal(false);
  intentosFallidos = signal(0);

  formulario?: FormGroup;

  constructor(private fb: FormBuilder, private storageService: StorageService) {
    this.formulario = this.fb.group({
        contrasena: ['', Validators.required],
        recordarContrasena: [false]
    });
  }

  entrar() {
    this.loadingEntrar.set(true);
    if (this.formulario?.invalid) {
      this.formulario?.markAllAsTouched();
      this.error.set(true);
      this.loadingEntrar.set(false);
      this.intentosFallidos.update((anterior) => ++anterior);
    } else {
      this.storageService.existeDocumento(`herramientas-enaire/${this.formulario?.get('contrasena')?.value}`).then((resp) => {
        if (resp) {
          if (this.formulario?.get('recordarContrasena')?.value) {
            localStorage.setItem('contrasenaAcceso', this.formulario?.get('contrasena')?.value);
          }
          sessionStorage.setItem('contrasenaAcceso', this.formulario?.get('contrasena')?.value);
        } else {
          this.error.set(true);
          this.intentosFallidos.update((anterior) => ++anterior);
        }
      }).catch(() => {
        this.error.set(true);
        this.intentosFallidos.update((anterior) => ++anterior);
      }).finally(() => this.loadingEntrar.set(false));
    }
  }
}
