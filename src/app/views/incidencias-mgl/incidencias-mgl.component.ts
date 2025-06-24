import { Component, inject } from '@angular/core';
import { ConfirmationService, MessageService, SortMeta } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TramoMGL } from '../../shared/interfaces/tramoMGL';
import { StorageService } from '../../shared/services/storage.service';
import { DialogModule } from 'primeng/dialog';
import { normalizarCadena, ponerFocusInputPrincipal, obtenerFechaString } from '../../shared/util/util';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { Usuario } from '../../shared/interfaces/usuario';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-incidencias-mgl',
  imports: [TableModule, ButtonModule, TooltipModule, DialogModule, ReactiveFormsModule, FloatLabel, DatePicker, MessageModule, AutoComplete, CommonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './incidencias-mgl.component.html',
  styleUrl: './incidencias-mgl.component.css'
})
export class IncidenciasMglComponent {
  storageService = inject(StorageService);
  defaultSort: SortMeta[] = [{ field: 'tramo', order: -1 }]; // Descendiente
  sortMeta: SortMeta[] = this.defaultSort;
  tramoDialog: boolean = false;
  tramosMGL = inject(StorageService).tramosMGL;
  usuarios = inject(StorageService).usuariosNoExentos;
  listaFiltradaUsuariosEncargados: Usuario[] = [];
  limiteSprintsVecesMGL = inject(StorageService).limiteSprintsVecesMGL;
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  formTramo: FormGroup = this.fb.group({
    tramo: [, [Validators.required]],
    usuariosEncargados: [[]],

    id: [],
    tramoAnterior: [],
  });

  ponerDatosTramo(tramo: TramoMGL) {
    this.formTramo.get('tramo')?.setValue(tramo?.tramo);
    this.formTramo.get('usuariosEncargados')?.setValue(tramo?.usuariosEncargados);

    this.formTramo.get('id')?.setValue(tramo?.id);
    this.formTramo.get('tramoAnterior')?.setValue(tramo?.tramo);
    this.tramoDialog = true;
  }

  aplicarTramo() {
    const sonTramosIguales = (a: Date[], b: Date[]) =>
    Array.isArray(a) && Array.isArray(b) &&
    a[0]?.getTime?.() === b[0]?.getTime?.() &&
    a[1]?.getTime?.() === b[1]?.getTime?.();

    if (this.formTramo?.invalid) {
      this.formTramo.markAllAsTouched();
    } else if (this.tramosMGL().filter(tramo => tramo?.tramo != this.formTramo?.get('tramoAnterior')?.value)?.some(tramo => sonTramosIguales(tramo.tramo, this.formTramo?.get('tramo')?.value))) {
      this.messageService.add({ severity: 'error', summary: 'Ya existe un tramo con las mismas fechas', detail: 'Ponga otro rango de fechas', life: 3000 });
    } else {
      this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/tramosMGL/`, {
        id: this.formTramo?.get('id')?.value,
        tramo: this.formTramo?.get('tramo')?.value,
        usuariosEncargados: this.formTramo?.get('usuariosEncargados')?.value
      } as TramoMGL).then((resp) => {
        this.messageService.add({ severity: 'info', summary: 'Éxito', detail: this.formTramo?.get('id')?.value ? 'Cambios guardados con éxito' : 'Tramo añadido con éxito', life: 3000 });
        this.tramoDialog = false;
      }).catch((err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
      });
    }
  }

  eliminarTramo(tramo: TramoMGL) {
    this.confirmationService.confirm({
        header: 'Atención',
        message: `¿Seguro que desea eliminar este tramo: ${obtenerFechaString(tramo?.tramo[0]) + ' - ' + obtenerFechaString(tramo?.tramo[1])}?`,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonStyleClass: '!bg-white !border-none !text-black !p-button-sm hover:!bg-gray-100',
        acceptButtonStyleClass: '!bg-red-500 !border-none !p-button-sm hover:!bg-red-400',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Eliminar',
        accept: () => {
          this.storageService.deleteDocumentById(`${sessionStorage.getItem('contrasenaAcceso')!}/tramosMGL`, tramo.id).then((resp) => {
            this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Tramo borrado con éxito', life: 3000 });
          }).catch((err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
          });
        }
    });
  }

  filterUsuariosEncargados(event: AutoCompleteCompleteEvent) {
      let filtered: Usuario[] = [];
      let query = event.query;

      for (let i = 0; i < (this.usuarios() as any[]).length; i++) {
          let responsable = (this.usuarios() as any[])[i];
          if ((responsable?.alias && normalizarCadena(responsable?.alias).includes(normalizarCadena(query))) || (responsable?.nombre && normalizarCadena(responsable?.nombre).includes(normalizarCadena(query)))) {
              filtered.push(responsable);
          }
      }

      /* Ordenamos por veces responsable de menor a mayor */
      filtered.sort((u1, u2) => (u1?.vecesMGLUltimosSprints || 0) - (u2?.vecesMGLUltimosSprints || 0));

      this.listaFiltradaUsuariosEncargados = filtered;
  }

  obtenerFechaString(fecha: Date) {
    return obtenerFechaString(fecha);
  }

  ponerFocusInputPrincipal() {
    ponerFocusInputPrincipal();
  }
}
