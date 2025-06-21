import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../shared/services/storage.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Sprint } from '../../shared/interfaces/sprint';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { EntornoEnum } from '../../shared/enums/entorno';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { ElementoSubida, Subida } from '../../shared/interfaces/subida';
import { CheckboxModule } from 'primeng/checkbox';

import { esMismoDia, obtenerFechaString } from '../../shared/util/util';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-sprint',
  imports: [ToastModule, ProgressSpinnerModule, TableModule, ToolbarModule, ButtonModule, IconFieldModule, InputIconModule, ConfirmDialogModule, DialogModule, CommonModule, TooltipModule, CheckboxModule, FormsModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sprint.component.html',
  styleUrl: './sprint.component.css'
})
export class SprintComponent {
  sprintSeleccionado = inject(StorageService).sprintSeleccionado;
  sprint = signal<Sprint | null>(null);
  fechaActual: Date = new Date();
  
  /* Util */
  entornos = EntornoEnum;

  constructor(private activatedRoute: ActivatedRoute, private storageService: StorageService, private messageService: MessageService) {
    this.activatedRoute.params.subscribe((params) => this.sprintSeleccionado.set(params['id']));

    this.storageService.getDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')}/sprints/${this.sprintSeleccionado()}`).subscribe({
      next: (resp) => {
        if (resp) {
          this.sprint.set(resp);
        } else {
          this.messageService.add({ severity: 'error', summary: 'No se pudo obtener la información', detail: 'Vuelva a iniciar sesión', life: 3000 });
          sessionStorage.removeItem('contrasenaAcceso');
          sessionStorage.removeItem('contrasenaAdmin');
          
        }
      }, error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se puedo obtener la información', life: 3000 });
        sessionStorage.removeItem('contrasenaAcceso');
        sessionStorage.removeItem('contrasenaAdmin');
      }
    });
  }

  /* TODO: Las subidas ordenarlas por fecha descendente. Si no tiene fecha, se colocara primero */
  nuevaSubida() {
    
  }

  nuevoElementoSubida(elementosSubida: ElementoSubida[]) {
    
  }
  
  editarElementoSubida(elemento: ElementoSubida) {

  }
  
  eliminarElementoSubida(elemento: ElementoSubida, elementosSubida: ElementoSubida[]) {

  }

  editarSubida(subida: Subida) {
    
  }
  
  eliminarSubida(subida: Subida) {

  }

  toPedirSubida() {

  }

  obtenerFechaString(fecha: Date) {
    if (fecha) {
      return obtenerFechaString(fecha);
    } else {
      return '';
    }
  }

  esMismoDia(fechaSubida: Date | Timestamp | undefined | null) {
    return esMismoDia(fechaSubida, this.fechaActual);
  }

}
