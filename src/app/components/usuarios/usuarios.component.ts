import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { StorageService } from '../../shared/services/storage.service';
import { normalizarCadena, obtenerFechaCumpleString, ponerFocusInputPrincipal } from '../../shared/util/util';
import { Usuario } from '../../shared/interfaces/usuario';
import { ConfirmationService, MessageService, SortMeta, TableState } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-usuarios',
  imports: [TableModule, FormsModule, CommonModule, TooltipModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, DialogModule, ConfirmDialogModule, MessageModule, AutoCompleteModule, ReactiveFormsModule, DatePickerModule, ToastModule, HighlightPipe, FloatLabelModule, CheckboxModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {
  constructor (private storageService: StorageService) {}
  private confirmationService = inject(ConfirmationService);

  limiteSprintsContarSubidas = inject(StorageService).limiteSprintsContarSubidas;
  limiteVecesResponsable = inject(StorageService).limiteSprintsVecesResponsable;
  limiteTramosContadosMGL = inject(StorageService).limiteTramosContadosMGL;
  usuarios = inject(StorageService).usuarios;
  usuariosTabla = computed(() => this.usuarios().map(u => {
    const cumpleanosSinAnio: Date = u?.cumpleanos;
    if (cumpleanosSinAnio) {
      cumpleanosSinAnio.setFullYear(2025); // No nos interesa el anio
    }
    /* Devolvemos los datos formateados */
    return {
      ...u, // Para mantener una copia superficial
      cumpleanosSinAnio,
      cumpleanosStr:
        typeof u.cumpleanos === 'string'
          ? u.cumpleanos
          : obtenerFechaCumpleString(u.cumpleanos as any)
    }
  }));
  isSorted: boolean = true;

  fb = inject(FormBuilder); // Inyectamos el form builder
  formUsuario?: FormGroup = this.fb.group({
    id: [], // Si lo ponemos es porque estamos editando
    nombre: ['', [Validators.required]],
    alias: [],
    cumpleanos: [],
    vacaciones: [],
    asuntosPropios: [],
    enfermedad: [],
    otrasAusencias: [],

    exentoSubidas: [false]
  });
  usuarioDialog: boolean = false;
  diasLibresDialog: boolean = false;
  filtroSimple: string = '';

  /* Configuracion */
  defaultSort: SortMeta[] = [{ field: 'alias', order: 1 }];
  /* se rellena si había algo en localStorage */
  sortMeta: SortMeta[] = this.defaultSort;
  onStateRestored(state: TableState | undefined) {
    if (state?.multiSortMeta?.length) {
      // Si el usuario ya tenía un orden guardado
      this.sortMeta = state.multiSortMeta;
    }
  }

  ponerDatosUsuario(usuario: Usuario) {
    this.formUsuario?.get('id')?.setValue(usuario?.id);
    this.formUsuario?.get('nombre')?.setValue(usuario?.nombre);
    this.formUsuario?.get('alias')?.setValue(usuario?.alias);
    this.formUsuario?.get('cumpleanos')?.setValue(usuario?.cumpleanos);
    this.formUsuario?.get('vacaciones')?.setValue(usuario?.vacaciones?.length ? usuario?.vacaciones : null);
    this.formUsuario?.get('asuntosPropios')?.setValue(usuario?.asuntosPropios?.length ? usuario?.asuntosPropios : null);
    this.formUsuario?.get('enfermedad')?.setValue(usuario?.enfermedad?.length ? usuario?.enfermedad : null);
    this.formUsuario?.get('otrasAusencias')?.setValue(usuario?.otrasAusencias?.length ? usuario?.otrasAusencias : null);

    this.formUsuario?.get('exentoSubidas')?.setValue(usuario?.exentoSubidas);
  }

  private messageService = inject(MessageService);
  aplicarUsuario() {
    if (this.formUsuario?.invalid) {
      this.formUsuario.markAllAsTouched();
      this.formUsuario.get('nombre')?.markAsDirty();
    } else if (!this.formUsuario?.get('id')?.value && this.usuarios().find(usu => normalizarCadena(usu?.nombre) == normalizarCadena(this.formUsuario?.get('nombre')?.value))) {
      this.messageService.add({ severity: 'error', summary: 'Ya existe un usuario con el mismo nombre', detail: 'Ponga otro nombre', life: 3000 });
    } else {
      this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/usuarios/`, {
        id: this.formUsuario?.get('id')?.value,
        nombre: this.formUsuario?.get('nombre')?.value,
        alias: this.formUsuario?.get('alias')?.value,
        cumpleanos: this.formUsuario?.get('cumpleanos')?.value,
        vacaciones: this.formUsuario?.get('vacaciones')?.value || [],
        asuntosPropios: this.formUsuario?.get('asuntosPropios')?.value || [],
        enfermedad: this.formUsuario?.get('enfermedad')?.value || [],
        otrasAusencias: this.formUsuario?.get('otrasAusencias')?.value || [],

        exentoSubidas: this.formUsuario?.get('exentoSubidas')?.value || false,
      } as Usuario).then((resp) => {
        this.messageService.add({ severity: 'info', summary: 'Éxito', detail: this.formUsuario?.get('id')?.value ? 'Cambios guardados con éxito' : 'Usuario añadido con éxito', life: 3000 });
        this.usuarioDialog = false;
        this.diasLibresDialog = false;
      }).catch((err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
      });
    }
  }

  eliminarUsuario(usuario: Usuario) {
    this.confirmationService.confirm({
        header: 'Atención',
        message: `¿Seguro que desea eliminar a ${usuario.nombre}?`,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonStyleClass: '!bg-white !border-none !text-black !p-button-sm hover:!bg-gray-100',
        acceptButtonStyleClass: '!bg-red-500 !border-none !p-button-sm hover:!bg-red-400',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Eliminar',
        accept: () => {
          this.storageService.deleteDocumentById(`${sessionStorage.getItem('contrasenaAcceso')!}/usuarios`, usuario.id).then((resp) => {
            this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Usuario borrado con éxito', life: 3000 });
          }).catch((err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
          });
        }
    });
  }

  obtenerFechaCumpleString(cumpleanos: any) {
    return obtenerFechaCumpleString(cumpleanos);
  }

  ponerFocusInputPrincipal() {
    ponerFocusInputPrincipal();
  }
}
