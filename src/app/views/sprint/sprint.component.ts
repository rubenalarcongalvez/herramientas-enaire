import { Component, computed, inject, signal } from '@angular/core';
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

import { esMismoDia, normalizarCadena, obtenerFechaString, ponerFocusInputPrincipal } from '../../shared/util/util';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { Usuario } from '../../shared/interfaces/usuario';

@Component({
  selector: 'app-sprint',
  imports: [ToastModule, ProgressSpinnerModule, TableModule, ToolbarModule, ButtonModule, IconFieldModule, InputIconModule, ConfirmDialogModule, DialogModule, CommonModule, TooltipModule, CheckboxModule, FormsModule, FloatLabelModule, ReactiveFormsModule, DatePickerModule, MessageModule, InputTextModule, AutoCompleteModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sprint.component.html',
  styleUrl: './sprint.component.css'
})
export class SprintComponent {
  usuarios = inject(StorageService).usuarios;
  usuariosElegir = computed(() => this.usuarios().map(usu => {
    return {
      nombre: usu?.nombre,
      alias: usu?.alias
    }
  }));
  listaFiltradaResponsables: Usuario[] = [];
  limiteSprintsContarSubidas = inject(StorageService).limiteSprintsContarSubidas;

  numerosSprints = inject(StorageService).numerosSprints;
  sprintSeleccionado = inject(StorageService).sprintSeleccionado;
  sprint = signal<Sprint | null>(null);
  subidasSprint = computed<Subida[]>(() => this.sprint()?.subidas || []);
  fechaActual: Date = new Date();
  subidaDialog: boolean = false;
  
  /* Util */
  entornos = EntornoEnum;
  fb = inject(FormBuilder);
  confirmationService = inject(ConfirmationService);

  formSubida: FormGroup = this.fb.group({
    entorno: ['', [Validators.required]],
    fechaSubida: [, [Validators.required]],
    responsable: [, [Validators.required]],
    idReferencia: [''],
  });
  listaEntornos = [EntornoEnum.DES, EntornoEnum.PRE, EntornoEnum.PRO];
  listaFiltradaEntornos = [EntornoEnum.DES, EntornoEnum.PRE, EntornoEnum.PRO];

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

  anadirSubida() {
    if (this.formSubida?.invalid) {
      this.formSubida.markAllAsTouched();
    } else if (this.subidasSprint().some(subida => esMismoDia(subida?.fechaSubida, this.formSubida?.get('fechaSubida')?.value))) {
      this.messageService.add({ severity: 'error', summary: 'Atención', detail: 'Ya hay una subida programada para esa fecha', life: 3000 });
    } else {
      // Hacemos los cambios en la subida
      const nuevasSubidas = [
        ...this.subidasSprint(),
        {
          entorno: this.formSubida?.get('entorno')?.value,
          fechaSubida: this.formSubida?.get('fechaSubida')?.value,
          idReferencia: this.formSubida?.get('entorno')?.value == EntornoEnum.DES ? '' : this.formSubida?.get('idReferencia')?.value,
          elementosSubida: [],
        } as Subida
      ];
      // Creamos un nuevo objeto sprint con el array actualizado
      this.sprint.set({
        ...this.sprint(),
        subidas: nuevasSubidas
      });

      // Actualizamos cambios
      this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints/${this.sprintSeleccionado()}`, this.sprint() as Sprint, true).then((resp) => {
        this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Subida añadida con éxito', life: 3000 });
        this.subidaDialog = false;
      }).catch((err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
      });
    }
  }

  editarSubida(subida: Subida) {
    // if (this.formSubida?.invalid) {
    //   this.formSubida.markAllAsTouched();
    // } else if (this.subidasSprint().some(subida => esMismoDia(subida?.fechaSubida, this.formSubida?.get('fechaSubida')?.value))) {
    //   this.messageService.add({ severity: 'error', summary: 'Atención', detail: 'Ya hay una subida programada para esa fecha', life: 3000 });
    // } else {
    //   // Hacemos los cambios en la subida
    //   if (this.subidasSprint().some(subida => esMismoDia(subida?.fechaSubida, this.formSubida?.get('fechaSubida')?.value)))

    //   this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/sprint/${this.sprintSeleccionado}`, this.sprint as Sprint).then((resp) => {
    //     this.messageService.add({ severity: 'info', summary: 'Éxito', detail: this.formSubida?.get('id')?.value ? 'Cambios guardados con éxito' : 'Subida añadida con éxito', life: 3000 });
    //     this.subidaDialog = false;
    //   }).catch((err) => {
    //     console.error(err);
    //     this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
    //   });
    // }
  }

  eliminarSubida(fechaSubida: Date) {
    
  }

  nuevoElementoSubida(elementosSubida: ElementoSubida[]) {
    
  }
  
  editarElementoSubida(elemento: ElementoSubida) {

  }
  
  eliminarElementoSubida(elemento: ElementoSubida, elementosSubida: ElementoSubida[]) {

  }

  filterEntornos(event: AutoCompleteCompleteEvent) {
      let query = event.query;

      this.listaFiltradaEntornos = this.listaEntornos.filter(entorno => !query || normalizarCadena(entorno)?.includes(normalizarCadena(query)));
  }

  filterResponsables(event: AutoCompleteCompleteEvent) {
      let filtered: any[] = [];
      let query = event.query;

      for (let i = 0; i < (this.usuariosElegir() as any[]).length; i++) {
          let responsable = (this.usuariosElegir() as any[])[i];
          if (normalizarCadena(responsable?.alias).includes(normalizarCadena(query)) || normalizarCadena(responsable?.nombre).includes(normalizarCadena(query))) {
              filtered.push(responsable);
          }
      }

      this.listaFiltradaResponsables = filtered;
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

  ponerFocusInputPrincipal() {
    ponerFocusInputPrincipal();
  }

}
