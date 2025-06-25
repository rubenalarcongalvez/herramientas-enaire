import { Component, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { StorageService } from '../../shared/services/storage.service';
import { DialogModule } from 'primeng/dialog';
import { normalizarCadena, ponerFocusInputPrincipal, obtenerFechaString } from '../../shared/util/util';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { Usuario, UsuarioSimple } from '../../shared/interfaces/usuario';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Modulo } from '../../shared/interfaces/modulo';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-modulos',
  imports: [TableModule, ButtonModule, TooltipModule, DialogModule, ReactiveFormsModule, FloatLabel, MessageModule, AutoComplete, CommonModule, ToastModule, ConfirmDialogModule, InputText],
  providers: [MessageService, ConfirmationService],
  templateUrl: './modulos.component.html',
  styleUrl: './modulos.component.css'
})
export class ModulosComponent {
  storageService = inject(StorageService);
  moduloDialog: boolean = false;
  modulos = inject(StorageService).modulos;
  usuariosTotales = inject(StorageService).usuarios;
  desarrolladores = inject(StorageService).usuariosNoExentos;
  gestores = inject(StorageService).usuariosExentos;
  listaFiltradaGestores: UsuarioSimple[] = [];
  listaFiltradaDesarrolladores: UsuarioSimple[] = [];
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  formModulo: FormGroup = this.fb.group({
    nombre: [, [Validators.required]],
    gestores: [[]],
    lider: [],
    desarrolladores: [[]],

    id: [],
    nombreAnterior: [],
  });

  ponerDatosModulo(modulo: Modulo) {
    this.formModulo.get('nombre')?.setValue(modulo?.nombre);
    this.formModulo.get('gestores')?.setValue(modulo?.gestores);
    this.formModulo.get('lider')?.setValue(modulo?.lider);
    this.formModulo.get('desarrolladores')?.setValue(modulo?.desarrolladores);

    this.formModulo.get('id')?.setValue(modulo?.id);
    this.formModulo.get('nombreAnterior')?.setValue(modulo?.nombre);
    this.moduloDialog = true;
  }

  filtrarDesarrolladoresMenosLider() {
    if (this.formModulo?.get('lider')?.value?.id && this.formModulo?.get('desarrolladores')?.value?.some((u: UsuarioSimple) => u.id == this.formModulo?.get('lider')?.value?.id)) {
      this.formModulo?.get('desarrolladores')?.setValue(this.formModulo?.get('desarrolladores')?.value.filter((u: UsuarioSimple) => u?.id != this.formModulo?.get('lider')?.value?.id));
    }
  }

  aplicarModulo() {
    if (this.formModulo?.invalid) {
      this.formModulo.markAllAsTouched();
    } else if (this.modulos().filter(modulo => modulo.nombre != this.formModulo.get('nombreAnterior')?.value).some(modulo => normalizarCadena(modulo?.nombre) == normalizarCadena(this.formModulo.get('nombre')?.value))) {
      this.messageService.add({ severity: 'error', summary: 'Ya existe un módulo con el mismo nombre', detail: 'Ponga otro nombre', life: 3000 });
    } else {
      // Si el lider estaba tambien en desarrolladores, lo quitamos de ahi
      this.filtrarDesarrolladoresMenosLider();

      this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/modulos/`, {
        id: this.formModulo?.get('id')?.value,
        nombre: this.formModulo?.get('nombre')?.value,
        gestores: this.formModulo?.get('gestores')?.value,
        lider: this.formModulo?.get('lider')?.value,
        desarrolladores: this.formModulo?.get('desarrolladores')?.value
      } as Modulo).then((resp) => {
        this.messageService.add({ severity: 'info', summary: 'Éxito', detail: this.formModulo?.get('id')?.value ? 'Cambios guardados con éxito' : 'Módulo añadido con éxito', life: 3000 });
        this.moduloDialog = false;
      }).catch((err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
      });
    }
  }

  eliminarModulo(modulo: Modulo) {
    this.confirmationService.confirm({
        header: 'Atención',
        message: `¿Seguro que desea eliminar el módulo de ${modulo.nombre}?`,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonStyleClass: '!bg-white !border-none !text-black !p-button-sm hover:!bg-gray-100',
        acceptButtonStyleClass: '!bg-red-500 !border-none !p-button-sm hover:!bg-red-400',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Eliminar',
        accept: () => {
          this.storageService.deleteDocumentById(`${sessionStorage.getItem('contrasenaAcceso')!}/modulos`, modulo.id).then((resp) => {
            this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Módulo borrado con éxito', life: 3000 });
          }).catch((err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
          });
        }
    });
  }

  filterDesarrolladores(event: AutoCompleteCompleteEvent, seleccionLider: boolean = false) {
      let filtered: Usuario[] = [];
      let query = event.query;

      for (let i = 0; i < (this.desarrolladores() as any[]).length; i++) {
          let responsable = (this.desarrolladores() as any[])[i];
          if ((responsable?.alias && normalizarCadena(responsable?.alias).includes(normalizarCadena(query))) || (responsable?.nombre && normalizarCadena(responsable?.nombre).includes(normalizarCadena(query)))) {
              filtered.push(responsable);
          }
      }

      /* Si no estamos en el autocomplete para seleccionar el lider, lo filtramos de la lista */
      if (!seleccionLider) {
        filtered = filtered.filter(u => u.id != this.formModulo.get('lider')?.value?.id); // Filtramos si ya esta puesto el lider
      }
      /* Ordenamos alfabeticamente */
      filtered.sort((u1, u2) => (u1?.alias || u1.nombre).localeCompare((u2?.alias || u2.nombre)));
      this.listaFiltradaDesarrolladores = filtered.map(u => {
        return {
          id: u?.id,
          nombre: u?.nombre,
          alias: u?.alias,
          cumpleanos: u?.cumpleanos,
          exentoSubidas: u?.exentoSubidas
        } as UsuarioSimple
      }); // Solo queremos estos datos y evitamos referencias ciclicas
  }
  
  filterGestores(event: AutoCompleteCompleteEvent) {
      let filtered: Usuario[] = [];
      let query = event.query;

      for (let i = 0; i < (this.gestores() as any[]).length; i++) {
          let responsable = (this.gestores() as any[])[i];
          if ((responsable?.alias && normalizarCadena(responsable?.alias).includes(normalizarCadena(query))) || (responsable?.nombre && normalizarCadena(responsable?.nombre).includes(normalizarCadena(query)))) {
              filtered.push(responsable);
          }
      }

      /* Ordenamos alfabeticamente */
      filtered.sort((u1, u2) => (normalizarCadena(u1?.alias || u1.nombre)).localeCompare((normalizarCadena(u2?.alias || u2.nombre))));

      this.listaFiltradaGestores = filtered.map(u => {
        return {
          id: u?.id,
          nombre: u?.nombre,
          alias: u?.alias,
          cumpleanos: u?.cumpleanos,
          exentoSubidas: u?.exentoSubidas
        } as UsuarioSimple
      }); // Solo queremos estos datos y evitamos referencias ciclicas
  }

  obtenerFechaString(fecha: Date) {
    return obtenerFechaString(fecha);
  }

  ponerFocusInputPrincipal() {
    ponerFocusInputPrincipal();
  }
}
