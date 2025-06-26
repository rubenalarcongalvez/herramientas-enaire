import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { InputNumberModule } from 'primeng/inputnumber';

import { esMismoDia, normalizarCadena, obtenerFechaString, ponerFocusInputPrincipal } from '../../shared/util/util';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { Usuario } from '../../shared/interfaces/usuario';
import { TipoElementoEnum } from '../../shared/enums/tipo-elemento';
import { requiredSiOtroCampoEsDist } from '../../shared/validators/validadores';
import { Modulo } from '../../shared/interfaces/modulo';

@Component({
  selector: 'app-sprint',
  imports: [ToastModule, ProgressSpinnerModule, TableModule, ToolbarModule, ButtonModule, IconFieldModule, InputIconModule, ConfirmDialogModule, DialogModule, CommonModule, TooltipModule, CheckboxModule, FormsModule, FloatLabelModule, ReactiveFormsModule, DatePickerModule, MessageModule, InputTextModule, AutoCompleteModule, InputNumberModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sprint.component.html',
  styleUrl: './sprint.component.css'
})
export class SprintComponent {
  usuarios = inject(StorageService).usuariosNoExentos;
  modulos = inject(StorageService).modulos;
  listaFiltradaResponsables: Usuario[] = [];
  listaFiltradaUsuariosSubida: Usuario[] = [];
  limiteSprintsContarSubidas = inject(StorageService).limiteSprintsContarSubidas;
  limiteSprintsVecesResponsable = inject(StorageService).limiteSprintsVecesResponsable;

  numerosSprints = inject(StorageService).numerosSprints;
  sprintSeleccionado = inject(StorageService).sprintSeleccionado;
  sprint = signal<Sprint | null>(null);
  subidasSprint = computed<Subida[]>(() => this.sprint()?.subidas || []);
  fechaActual: Date = new Date();
  subidaDialog: boolean = false;
  elementoDialog: boolean = false;
  numeroSprintDialog: boolean = false;
  
  /* Util */
  entornos = EntornoEnum;
  tiposElementos = TipoElementoEnum;
  fb = inject(FormBuilder);
  router = inject(Router);
  confirmationService = inject(ConfirmationService);

  formSubida: FormGroup = this.fb.group({
    entorno: ['', [Validators.required]],
    fechaSubida: [, [Validators.required]],
    horaSubida: [],
    responsable: [, [Validators.required]],
    idReferencia: [''],

    elementosSubida: [[]],
    fechaSubidaAnterior: [],
  });
  formElemento: FormGroup = this.fb.group({
    tipo: ['', [Validators.required]],
    moduloSubido: ['', [requiredSiOtroCampoEsDist('tipo')]],
    completado: [false],
    usuariosSubida: [[]],

    // Lo usaremos para buscar la subida que debemos cambiar
    fechaSubida: [],

    tipoAnterior: [],
    moduloSubidoAnterior: [],
  });
  formNumeroSprint: FormGroup = this.fb.group({
    numeroSprint: [, [Validators.min(1)]],
    numeroSprintAnterior: [, [Validators.min(1)]],
  });
  listaEntornos = [EntornoEnum.DES, EntornoEnum.PRE, EntornoEnum.PRO];
  listaFiltradaEntornos = [EntornoEnum.DES, EntornoEnum.PRE, EntornoEnum.PRO];
  listaTiposElementos: TipoElementoEnum[] = [TipoElementoEnum.dist, TipoElementoEnum.war, TipoElementoEnum.ear];
  listaFiltradaTiposElementos: TipoElementoEnum[] = [TipoElementoEnum.dist, TipoElementoEnum.war, TipoElementoEnum.ear];
  listaFiltradaModulos: Modulo[] = [];

  constructor(private activatedRoute: ActivatedRoute, private storageService: StorageService, private messageService: MessageService) {
    this.activatedRoute.params.subscribe((params) => this.sprintSeleccionado.set(params['id'] || this.sprintSeleccionado()));

    if (this.sprintSeleccionado()) {
      this.buscarInfo();
    }

    this.formElemento.get('tipo')?.valueChanges.subscribe(() => {
      this.formElemento.get('moduloSubido')?.updateValueAndValidity({ onlySelf: true });
    });
  }

  private buscarInfo() {
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
            /* Si solo estamos modificando el sprint actual, hacemos esto */      
            this.sprint.set(sprint);
          } else {
            this.storageService.obtenerNumerosSprints(sessionStorage?.getItem('contrasenaAcceso')!).subscribe({
              next: (resp) => {
                this.numerosSprints.set(resp);
                this.sprintSeleccionado.set(resp[0] || null);
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigateByUrl(`/sprint/${this.sprintSeleccionado()}`);
                });
              }, error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'No se pudo obtener la información', detail: 'Vuelva a iniciar sesión', life: 3000 });
                sessionStorage.removeItem('contrasenaAcceso');    
              }
            });
          }
        }, error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'No se pudo obtener la información', detail: 'Vuelva a iniciar sesión', life: 3000 });
          sessionStorage.removeItem('contrasenaAcceso');
        }
      });
  }

  aplicarHoraSubidaActual() {
    if (!this.formSubida?.get('horaSubida')?.value) {
      this.formSubida?.get('horaSubida')?.setValue(new Date());
    }
  }

  abrirEditarSubida(subida: Subida) {
    this.formSubida?.get('entorno')?.setValue(subida?.entorno);
    this.formSubida?.get('fechaSubida')?.setValue(subida?.fechaSubida);
    this.formSubida?.get('horaSubida')?.setValue(subida?.horaSubida);
    this.formSubida?.get('fechaSubidaAnterior')?.setValue(subida?.fechaSubida);
    this.formSubida?.get('responsable')?.setValue(subida?.responsable);
    this.formSubida?.get('idReferencia')?.setValue(subida?.idReferencia);
    this.formSubida?.get('elementosSubida')?.setValue(subida?.elementosSubida || []);

    this.subidaDialog = true;
  }

  aplicarSubida() {
    if (this.formSubida?.invalid) {
      this.formSubida.markAllAsTouched();
      /* No puede coincidir con otra fecha, si ya tenia una fecha, esta queda excluida porque se modifica */
    } else if ((this.formSubida?.get('fechaSubidaAnterior')?.value && (this.formSubida?.get('fechaSubidaAnterior')?.value != this.formSubida?.get('fechaSubida')?.value) && this.subidasSprint().some(subida => esMismoDia(subida?.fechaSubida, this.formSubida?.get('fechaSubida')?.value))) || (!this.formSubida?.get('fechaSubidaAnterior')?.value && this.subidasSprint().some(subida => esMismoDia(subida?.fechaSubida, this.formSubida?.get('fechaSubida')?.value)))) {
      this.messageService.add({ severity: 'error', summary: 'Atención', detail: 'Ya hay una subida programada para esa fecha', life: 3000 });
    } else {
      // Hacemos los cambios en la subida
      /* Si estamos editando, lo debemos sustituir, si no, anadimos */
      let nuevasSubidas: Subida[] = [...this.subidasSprint()];
      if (this.formSubida.get('fechaSubidaAnterior')?.value) {
        const subidaExistente = nuevasSubidas.find(subida =>
          subida.fechaSubida == this.formSubida.get('fechaSubidaAnterior')?.value
        );
        
        if (subidaExistente) {
          subidaExistente.entorno = this.formSubida.get('entorno')?.value;
          subidaExistente.fechaSubida = this.formSubida.get('fechaSubida')?.value;
          subidaExistente.horaSubida = this.formSubida.get('horaSubida')?.value || null;
          subidaExistente.responsable = this.formSubida.get('responsable')?.value;
          subidaExistente.idReferencia = subidaExistente.entorno === EntornoEnum.DES ? '' : this.formSubida.get('idReferencia')?.value;
          subidaExistente.elementosSubida = this.formSubida.get('elementosSubida')?.value || [];
        } else {
          console.error('No se ha encontrado la subida existente');
        }
      } else {
        nuevasSubidas.push({
          entorno: this.formSubida?.get('entorno')?.value,
          fechaSubida: this.formSubida?.get('fechaSubida')?.value,
          horaSubida: this.formSubida?.get('horaSubida')?.value || null,
          responsable: this.formSubida?.get('responsable')?.value,
          idReferencia: this.formSubida?.get('entorno')?.value == EntornoEnum.DES ? '' : this.formSubida?.get('idReferencia')?.value,
          elementosSubida: this.formSubida?.get('elementosSubida')?.value || [],
        } as Subida);
      }

      // Creamos un nuevo objeto sprint con el array actualizado
      this.sprint.set({
        ...this.sprint(),
        subidas: nuevasSubidas
      });

      // Actualizamos cambios
      this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints/${this.sprintSeleccionado()}`, this.sprint() as Sprint, true).then((resp) => {
        this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Subida ' + (this.formSubida.get('fechaSubidaAnterior')?.value ? 'editada' : 'añadida') + ' con éxito', life: 3000 });
        this.subidaDialog = false;
      }).catch((err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
      });
    }
  }

  eliminarSubida(fechaSubida: Date) {
    this.confirmationService.confirm({
        header: '¿Seguro que desea eliminar esta subida?',
        message: 'Esta elección no podrá deshacerse',
        rejectButtonStyleClass: '!bg-white !border-none !text-black !p-button-sm hover:!bg-gray-100',
        acceptButtonStyleClass: '!bg-red-500 !border-none !p-button-sm hover:!bg-red-400',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Eliminar',
        accept: () => {
          const subidasFiltradas = [...this.subidasSprint()].filter(subida => subida?.fechaSubida != fechaSubida);
          this.sprint.set({
            ...this.sprint(),
            subidas: subidasFiltradas
          });

          // Actualizamos cambios
          this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints/${this.sprintSeleccionado()}`, this.sprint() as Sprint, true).then((resp) => {
            this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Subida eliminada con éxito', life: 3000 });
            this.subidaDialog = false;
          }).catch((err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
          });
        },
    });
  }
  
  abrirAnadirEditarElementoSubida(fechaSubida: Date, elemento?: ElementoSubida) {
    this.formElemento.get('fechaSubida')?.setValue(fechaSubida);
    if (elemento) {
      this.formElemento.get('tipo')?.setValue(elemento?.tipo);
      this.formElemento.get('moduloSubido')?.setValue(elemento?.moduloSubido);
      this.formElemento.get('completado')?.setValue(elemento?.completado);
      this.formElemento.get('usuariosSubida')?.setValue(elemento?.usuariosSubida);

      this.formElemento.get('tipoAnterior')?.setValue(elemento?.tipo);
      this.formElemento.get('moduloSubidoAnterior')?.setValue(elemento?.tipo);
    }

    this.elementoDialog = true;
  }

  aplicarElementoSubida() {
    // Primero, obtenemos la subida correspondiente
    let subidaEnlazada = computed<Subida>(() => this.subidasSprint().find(subida => subida?.fechaSubida == this.formElemento.get('fechaSubida')?.value)!);
    // Comprobamos que no se pongan datos erroneos
    if (this.formElemento?.valid && this.formElemento.get('tipo')?.value != TipoElementoEnum.dist) {
      this.formElemento.get('moduloSubido')?.setValue('');
    }

    if (this.formElemento?.invalid) {
      this.formElemento.markAllAsTouched();
      this.formElemento.get('moduloSubido')?.markAsDirty();
      /* No puede coincidir con otro elemento existente a no ser que estemos editando */
    } else if (this.formElemento?.get('tipoAnterior')?.value && (subidaEnlazada().elementosSubida?.filter(ele => !((ele.tipo == this.formElemento?.get('tipoAnterior')?.value) &&       (ele.tipo == this.formElemento?.get('moduloSubidoAnterior')?.value))).some(ele => (normalizarCadena(ele.tipo || '') == normalizarCadena(this.formElemento?.get('tipo')?.value || '')) && (normalizarCadena(ele.moduloSubido || '') == normalizarCadena(this.formElemento?.get('moduloSubido')?.value || ''))))
        ||
      (!this.formElemento?.get('tipoAnterior')?.value && subidaEnlazada().elementosSubida?.some(ele => (normalizarCadena(ele.tipo || '') == normalizarCadena(this.formElemento?.get('tipo')?.value || '')) && (normalizarCadena(ele.moduloSubido || '') == normalizarCadena(this.formElemento?.get('moduloSubido')?.value || ''))))
    ) {
      this.messageService.add({ severity: 'error', summary: 'Atención', detail: 'Ya hay un elemento asignado con este tipo y modulo', life: 3000 });
    } else {
      // Hacemos los cambios
      /* Si estamos editando, lo debemos sustituir, si no, anadimos, pero la subida siempre es en edicion */
      let nuevasSubidas: Subida[] = [...this.subidasSprint()];
      const subidaExistente = nuevasSubidas.find(subida =>
        subida.fechaSubida == this.formElemento.get('fechaSubida')?.value
      );
      
      if (subidaExistente) {
        /* Si estamos editando o si estamos anadiendo */
        if (this.formElemento.get('tipoAnterior')?.value) {
          const elementoExistente = subidaExistente?.elementosSubida?.find(elemento =>
            (elemento.tipo == this.formElemento.get('tipoAnterior')?.value) && (elemento.tipo == this.formElemento.get('moduloSubidoAnterior')?.value)
          );

          if (elementoExistente) {
            elementoExistente.tipo = this.formElemento.get('tipo')?.value;
            elementoExistente.moduloSubido = this.formElemento.get('moduloSubido')?.value;
            elementoExistente.usuariosSubida = this.formElemento.get('usuariosSubida')?.value;
          } else {
            console.error('No se ha encontrado el elemento existente');
          }
        } else {
          subidaExistente.elementosSubida?.push({
            tipo: this.formElemento.get('tipo')?.value,
            moduloSubido: this.formElemento.get('moduloSubido')?.value,
            completado: false,
            usuariosSubida: this.formElemento.get('usuariosSubida')?.value
          });
        }
      } else {
        console.error('No se ha encontrado la subida existente');
      }

      // Creamos un nuevo objeto sprint con el array actualizado
      this.sprint.set({
        ...this.sprint(),
        subidas: nuevasSubidas
      });

      // Actualizamos cambios
      this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints/${this.sprintSeleccionado()}`, this.sprint() as Sprint, true).then((resp) => {
        this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Elemento ' + (this.formElemento.get('tipoAnterior')?.value ? 'editado' : 'añadido') + ' con éxito', life: 3000 });
        this.elementoDialog = false;
      }).catch((err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
      });
    }
  }

  eliminarElementoSubida(fechaSubida: Date, elemento: ElementoSubida) {
    this.confirmationService.confirm({
        header: `¿Seguro que desea eliminar este ${elemento.tipo}${elemento?.moduloSubido ? ' de ' + elemento.moduloSubido : ''}?`,
        message: 'Esta elección no podrá deshacerse',
        rejectButtonStyleClass: '!bg-white !border-none !text-black !p-button-sm hover:!bg-gray-100',
        acceptButtonStyleClass: '!bg-red-500 !border-none !p-button-sm hover:!bg-red-400',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Eliminar',
        accept: () => {
          const subidas = [...this.subidasSprint()];
          subidas.map(subida => {
            let subidaRes = subida;
            subidaRes.elementosSubida = subidaRes?.elementosSubida?.filter(ele => !(subidaRes?.fechaSubida == fechaSubida && ele?.tipo == elemento?.tipo && ele?.moduloSubido == elemento?.moduloSubido));
            return subidaRes;
          }); // Quitamos el elemento
          this.sprint.set({
            ...this.sprint(),
            subidas: subidas
          });

          // Actualizamos cambios
          this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints/${this.sprintSeleccionado()}`, this.sprint() as Sprint, true).then((resp) => {
            this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Subida eliminada con éxito', life: 3000 });
            this.subidaDialog = false;
          }).catch((err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
          });
        },
    });
  }

  guardarCambiosElemento() {
    this.storageService.setDocumentByAddress(
      `${sessionStorage.getItem('contrasenaAcceso')!}/sprints/${this.sprintSeleccionado()}`,
      this.sprint(),
      true
    ).catch(() => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron guardar los cambios', life: 2000 });
    });
  }

  abrirEditarNumeroSprint() {
    this.formNumeroSprint.get('numeroSprint')?.setValue(this.sprintSeleccionado());
    this.formNumeroSprint.get('numeroSprintAnterior')?.setValue(this.sprintSeleccionado());
    this.numeroSprintDialog = true;
  }

  aplicarEditarNumeroSprint() {
    if (this.formNumeroSprint.invalid) {
      this.formNumeroSprint.markAllAsTouched();
    } else {
      if (this.numerosSprints().some(nSP => nSP == this.formNumeroSprint.get('numeroSprint')?.value)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ya existe un Sprint con ese número', life: 2000 });
      } else {
        this.sprint()!.id = this.formNumeroSprint.get('numeroSprint')?.value;

        // Actualizamos cambios
        // Creamos el sprint en el otro sitio
        this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints/${this.formNumeroSprint.get('numeroSprint')?.value}`, this.sprint() as Sprint, true).then(() => {
          // Por ultimo, eliminamos el anterior si es que estamos editando
          this.storageService.deleteDocumentById(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints`, this.formNumeroSprint.get('numeroSprintAnterior')?.value).then(() => {
            this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Número de Sprint modificado con éxito', life: 3000 });
            this.sprintSeleccionado.set(this.formNumeroSprint.get('numeroSprint')?.value);
            // this.router.navigateByUrl(`/sprint/${this.formNumeroSprint.get('numeroSprint')?.value}`); // TODO Por ahora no es viable
            const arrLocation = location.href.split('/');
            arrLocation.pop();
            location.href = arrLocation.join('/') + '/' + this.formNumeroSprint.get('numeroSprint')?.value;
            location.reload();
            this.numeroSprintDialog = false;
          }).catch((err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
          });
        }).catch((err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
        });
      }
    }
  }

  filterEntornos(event: AutoCompleteCompleteEvent) {
      let query = event.query;

      this.listaFiltradaEntornos = this.listaEntornos.filter(entorno => !query || normalizarCadena(entorno)?.includes(normalizarCadena(query)));
  }

  filterModulos(event: AutoCompleteCompleteEvent) {
      let query = event.query;

      let listaFinal = this.modulos().filter(modulo => !query || normalizarCadena(modulo?.nombre)?.includes(normalizarCadena(query)));
      listaFinal.sort((m1, m2) => normalizarCadena(m1.nombre).localeCompare(normalizarCadena(m2.nombre))); // Asc

      this.listaFiltradaModulos = this.modulos().filter(modulo => !query || normalizarCadena(modulo?.nombre)?.includes(normalizarCadena(query)));
  }

  filterResponsables(event: AutoCompleteCompleteEvent) {
      let filtered: Usuario[] = [];
      let query = event.query;

      for (let i = 0; i < (this.usuarios() as any[]).length; i++) {
          let responsable = (this.usuarios() as any[])[i];
          if ((responsable?.alias && normalizarCadena(responsable?.alias).includes(normalizarCadena(query))) || (responsable?.nombre && normalizarCadena(responsable?.nombre).includes(normalizarCadena(query)))) {
              filtered.push(responsable);
          }
      }

      /* Ordenamos por veces responsable de menor a mayor */
      filtered.sort((u1, u2) => (u1?.vecesResponsableUltimosSprints || 0) - (u2?.vecesResponsableUltimosSprints || 0));

      this.listaFiltradaResponsables = filtered;
  }

  filterUsuariosSubida(event: AutoCompleteCompleteEvent) {
      let filtered: Usuario[] = [];
      let query = event.query;

      for (let i = 0; i < (this.usuarios() as any[]).length; i++) {
          let responsable = (this.usuarios() as any[])[i];
          if ((responsable?.alias && normalizarCadena(responsable?.alias).includes(normalizarCadena(query))) || (responsable?.nombre && normalizarCadena(responsable?.nombre).includes(normalizarCadena(query)))) {
              filtered.push(responsable);
          }
      }

      /* Ordenamos por veces generado lo correspondiente de menor a mayor, sin priorizar por modulo */
      switch (this.formElemento.get('tipo')?.value) {
        case TipoElementoEnum.dist: {
          // Separamos la lista de los que coinciden con los modulos y los que no
          if (this.formElemento.get('moduloSubido')?.value) {
            const coinciden = filtered.filter(usuario => usuario?.modulosLider?.some(m => m?.nombre == this.formElemento.get('moduloSubido')?.value) || usuario?.modulosDesarrollador?.some(m => m?.nombre == this.formElemento.get('moduloSubido')?.value));
            coinciden.sort((u1, u2) => (u1?.distsUltimosSprints || 0) - (u2?.distsUltimosSprints || 0));
            const noCoinciden = filtered.filter(usuario => !usuario?.modulosLider?.some(m => m?.nombre == this.formElemento.get('moduloSubido')?.value) && !usuario?.modulosDesarrollador?.some(m => m?.nombre == this.formElemento.get('moduloSubido')?.value));
            noCoinciden.sort((u1, u2) => (u1?.distsUltimosSprints || 0) - (u2?.distsUltimosSprints || 0));
  
            filtered = [...coinciden, ...noCoinciden]; // Ponemos la lista ya ordenada y con los usuarios del modulo seleccionado primero
          } else {
            filtered.sort((u1, u2) => (u1?.distsUltimosSprints || 0) - (u2?.distsUltimosSprints || 0));
          }
          break;
        }
        case TipoElementoEnum.war: {
          filtered.sort((u1, u2) => (u1?.warsUltimosSprints || 0) - (u2?.warsUltimosSprints || 0));
          break;
        }
        case TipoElementoEnum.ear: {
          filtered.sort((u1, u2) => (u1?.earsUltimosSprints || 0) - (u2?.earsUltimosSprints || 0));
          break;
        }
        default: {
          filtered.sort((u1, u2) => 
            ((u1?.distsUltimosSprints || 0) + (u1?.warsUltimosSprints || 0) +(u1?.earsUltimosSprints || 0))
            - 
            ((u2?.distsUltimosSprints || 0) + (u2?.warsUltimosSprints || 0) +(u2?.earsUltimosSprints || 0))
          );
        }
      }

      this.listaFiltradaUsuariosSubida = filtered;
  }

  usuarioEstaEnModuloSubido(usuario: Usuario) {
    return usuario?.modulosLider?.some(m => m?.nombre == this.formElemento.get('moduloSubido')?.value) || usuario?.modulosDesarrollador?.some(m => m?.nombre == this.formElemento.get('moduloSubido')?.value);
  }

  filterTiposElementos(event: AutoCompleteCompleteEvent) {
      let query = event.query;

      this.listaFiltradaTiposElementos = this.listaTiposElementos.filter(tipoElemento => !query || normalizarCadena(tipoElemento)?.includes(normalizarCadena(query)));
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

  obtenerHoraSubida(hora: Date | undefined) {
    if (hora) {
      const horas = String(hora.getHours()).padStart(2, '0');
      const minutos = String(hora.getMinutes()).padStart(2, '0');
      
      return `${horas}:${minutos}`;
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
