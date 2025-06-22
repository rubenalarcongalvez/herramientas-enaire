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
  numerosSprints = inject(StorageService).numerosSprints;
  sprintSeleccionado = inject(StorageService).sprintSeleccionado;
  sprint = signal<Sprint | null>(null);
  fechaActual: Date = new Date();
  
  /* Util */
  entornos = EntornoEnum;

  confirmationService = inject(ConfirmationService);
  constructor(private activatedRoute: ActivatedRoute, private storageService: StorageService, private messageService: MessageService) {
    this.activatedRoute.params.subscribe((params) => this.sprintSeleccionado.set(params['id'] || this.sprintSeleccionado()));

    this.storageService.getDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')}/sprints/${this.sprintSeleccionado()}`).subscribe({
      next: (resp) => {
        if (resp) {
          let sprint: Sprint = resp;
          // Ordenamos de mas nuevo a mas antiguo. Si no tiene fechaSubida, va primero
          sprint?.subidas?.sort((a, b) => {
            const d1 = a.fechaSubida as Date | undefined;
            const d2 = b.fechaSubida as Date | undefined;

            /* Comprobamos que los que no tengan fecha vayan primero */
            if (!d1 && !d2) return 0;
            if (!d1) return -1;
            if (!d2) return 1;
          
            // Si ambos tienen fecha van por orden cronológico descendente
            return d2.getTime() - d1.getTime();
          });
          this.sprint.set(sprint); 
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
    const mensajeTIPO: string = `Buenas tardes, 

Se solicita una subida para [FECHA] para realizar unas pruebas pendientes en dicho entorno. 

En las máquinas de ETNAJ zzvx0708/zzvx0709 desplegar el EAR (ETNAJ_EAR-2.39.ear) 

Se ha dejado el EAR de pruebas en la ruta: 

\\\\repositorio.nav.es\\Fuentes_de_aplicaciones\\ETNAJ\\[ENTORNO]\\SERVIDOR_ETNA 

Necesitamos también que se despliegue el WAR (etnaApp.war) que corresponde a los servicios web en las máquinas zzvx1031/zzvx1032 

Se ha dejado el WAR de pruebas en la ruta: 

\\\\repositorio.nav.es\\Fuentes_de_aplicaciones\\ETNAJ\\[ENTORNO]\\ETNAJ_WSREST 

Adicionalmente a ello necesitamos que se copien los ficheros del módulo [MÓDULOS] en el directorio del FILESYSTEM en las máquinas zzvx1029/zzvx1030 

Se ha dejado el fichero en la ruta: 
\\\\repositorio.nav.es\\Fuentes_de_aplicaciones\\ETNAJ\\PREPRODUCCION\\FILESYSTEM\\[MÓDULO]

Eliminar la cache y reiniciar los WL 

Muchas gracias de antemano por vuestra colaboración. 

Un saludo`;

    // Copiamos al portapapeles el mensaje TIPO para pedir la subida
    this.confirmationService.confirm({
        header: '¿Desea copiar el mensaje de ejemplo a su portapapeles? (sustituya lo que hay entre corchetes [CONTENIDO])',
        message: mensajeTIPO,
        rejectButtonStyleClass: '!bg-white !border-none !text-black !p-button-sm hover:!bg-gray-100',
        acceptButtonStyleClass: '!bg-blue-500 !border-none !p-button-sm hover:!bg-blue-400',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Pedir subida',
        accept: () => {
          window.open('https://helpo.enaire.es');
        },
    });
  }

  copiarMensajePortapapeles(mensaje: string) {
    navigator.clipboard.writeText(mensaje);
    this.messageService.add({ severity: 'info', summary: 'Mensaje copiado', life: 3000 });
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
