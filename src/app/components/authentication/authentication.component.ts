import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-authentication',
  imports: [ButtonModule, Message, AvatarModule, ProgressBarModule, CommonModule, PasswordModule, FormsModule, ReactiveFormsModule, CheckboxModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {
  loadingEntrar = signal(false);
  error = signal(false);

  formulario?: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
        contrasena: ['', Validators.required],
        recordarContrasena: [false]
    });
  }

  entrar() {
    // this.error.set(true);
  }
}
