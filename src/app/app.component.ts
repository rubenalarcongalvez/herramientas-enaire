import { Component, computed, inject, signal } from '@angular/core';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';

/* Imports primeng */
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from './shared/services/storage.service';
import { ToastModule } from 'primeng/toast';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmationService, MessageService } from 'primeng/api';
import { esDiaLibre, esMismoDiaCumple, joinConY } from './shared/util/util';
import { Usuario } from './shared/interfaces/usuario';
import { combineLatest } from 'rxjs';
import { Sprint } from './shared/interfaces/sprint';
import { DialogModule } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TramoMGL } from './shared/interfaces/tramoMGL';

@Component({
  selector: 'app-root',
  imports: [FooterComponent, RouterOutlet, RouterLink, RouterLinkActive, AuthenticationComponent, TooltipModule, ButtonModule, CommonModule, ProgressSpinnerModule, ToastModule, DrawerModule, DialogModule, InputNumber, ReactiveFormsModule, MessageModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  sprintSeleccionado = inject(StorageService).sprintSeleccionado;
  numerosSprints = inject(StorageService).numerosSprints;
  ultimoSprint = computed(() => this.numerosSprints()[0] + 1);
  usuarios = inject(StorageService).usuarios;
  tramosMGL = inject(StorageService).tramosMGL;
  cargado = signal(false);
  visibleSidebar: boolean = false;
  fechaActual: Date = new Date();
  personasQueCumplenAnoHoy = computed(() => joinConY(this.usuarios().filter(usu => esMismoDiaCumple(usu.cumpleanos as any, this.fechaActual)).map(usu => usu?.alias ? usu?.alias : usu?.nombre)));
  personasDiasLibresHoy = computed(() => joinConY(this.usuarios().filter(usu => esDiaLibre(usu as Usuario, this.fechaActual)).map(usu => usu?.alias ? usu?.alias : usu?.nombre)));

  mostrarDiaLibre: boolean = true;
  mostrarCumpleanos: boolean = true;

  limiteSprintsContarSubidas: number = inject(StorageService).limiteSprintsContarSubidas;
  limiteSprintsVecesResponsable: number = inject(StorageService).limiteSprintsVecesResponsable;
  limiteSprintsVecesMGL: number = inject(StorageService).limiteSprintsVecesMGL;
  limiteMayor = computed(() => 
    Math.max(this.limiteSprintsContarSubidas, this.limiteSprintsVecesResponsable)
  );

  fb = inject(FormBuilder);
  nuevoSprintDialog: boolean = false;
  formNuevoSprint: FormGroup = this.fb.group({
    numeroSprint: [this.ultimoSprint(), [Validators.min(1)]],
  });
  router = inject(Router);
  confirmationService = inject(ConfirmationService);

  constructor(private storageService: StorageService, private messageService: MessageService) {}

  ngOnInit() {
    const contrasenaAccesoLocal = localStorage.getItem('contrasenaAcceso');
    if (contrasenaAccesoLocal) {
      sessionStorage.setItem('contrasenaAcceso', contrasenaAccesoLocal);
    }
    if (this.contrasenaAcceso) {
      sessionStorage.setItem('contrasenaAcceso', this.contrasenaAcceso);
      this.cargarInformacion();
    } else {
      this.cargado.set(true);
    }
  }

  cargarInformacion() {
    /* Lo hacemos todo a la vez */
    this.storageService.obtenerNumerosSprints(this.contrasenaAcceso!).subscribe({
      next: (resp) => {
        this.numerosSprints.set(resp);
        this.cargado.set(true);

        if (!this.router.url.includes('sprint')) {
          this.sprintSeleccionado.set(resp[0] || null);
        }

        if (this.router.url == '/') {
          this.router.navigateByUrl(`/sprint/${this.sprintSeleccionado()}`);
        }
      }, error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'No se pudo obtener la información', detail: 'Vuelva a iniciar sesión', life: 3000 });
        sessionStorage.removeItem('contrasenaAcceso');
        this.cargado.set(true);
      }
    });
    
    /* Obtenemos los usuarios tambien */
    this.cargarUsuariosConDatosTiempoReal();
  }

  get contrasenaAcceso(): string | undefined | null {
    return sessionStorage.getItem('contrasenaAcceso') || null; // Si no hay contrasena, no entras. Sacarla del localStorage si hay tambien
  }

  private cargarUsuariosConDatosTiempoReal(): void {
    const contrasena = sessionStorage.getItem('contrasenaAcceso')!;
  
    combineLatest([
      this.storageService.getCollectionByAddress<Usuario>(`${contrasena}/usuarios`),
      this.storageService.getCollectionByAddress<Sprint>(`${contrasena}/sprints`),
      this.storageService.getCollectionByAddress<TramoMGL>(`${contrasena}/tramosMGL`)
    ]).subscribe({
      next: ([usuarios, sprints, tramosMGL]) => {
        const ultimosSprints = sprints
          .sort((a, b) => Number(b.id) - Number(a.id))
          .slice(0, this.limiteMayor());
  
        const usuariosCompletos = usuarios.map(usuario => {
          let dist = 0, war = 0, ear = 0, vecesResponsable = 0, vecesEncargadoMGL = 0;
  
          ultimosSprints.forEach((sprint, indice) => {
            sprint.subidas?.forEach(subida => {
              if ((indice < this.limiteSprintsVecesResponsable) && subida?.responsable?.id === usuario?.id) {
                vecesResponsable++;
              }
  
              subida?.elementosSubida?.forEach(elemento => {
                if ((indice < this.limiteSprintsContarSubidas) && elemento?.usuariosSubida?.some(u => u?.id === usuario.id) && elemento?.completado) {
                  if (elemento.tipo === 'dist') ++dist;
                  if (elemento.tipo === 'war') ++war;
                  if (elemento.tipo === 'ear') ++ear;
                }
              });
            });
          });

          /* Ordenamos de mas nuevo a mas antiguo */
          tramosMGL.sort((t2, t1) => {
            const val1 = t1.tramo?.[0];
            const val2 = t2.tramo?.[0];
          
            if (val1 > val2) return 1;
            if (val1 < val2) return -1;
          
            return 0;
          });

          this.tramosMGL.set(tramosMGL);

          tramosMGL.forEach((tramo, indice) => {
            if ((indice < this.limiteSprintsVecesMGL) && tramo?.usuariosEncargados?.some(usu => usu?.id === usuario.id)) {
              ++vecesEncargadoMGL;
            }
          })
  
          return {
            ...usuario,
            distsUltimosSprints: dist,
            warsUltimosSprints: war,
            earsUltimosSprints: ear,
            vecesResponsableUltimosSprints: vecesResponsable,
            vecesMGLUltimosSprints: vecesEncargadoMGL
          };
        });
  
        this.usuarios.set(usuariosCompletos);
      },
      error: (err) => {
        console.error('Error al cargar usuarios o sprints:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar datos',
          detail: 'Comprueba tu conexión o vuelve a iniciar sesión',
          life: 3000
        });
      }
    });
  }

  abrirAnadirNuevoSprint() {
    // Volvemos a actualizar su valor cada vez que abramos
    this.formNuevoSprint = this.fb.group({
      numeroSprint: [this.ultimoSprint(), [Validators.min(1)]],
    });
    this.nuevoSprintDialog = true;
  }

  aplicarAnadirNuevoSprint() {
    if (this.formNuevoSprint.invalid) {
      this.formNuevoSprint.markAllAsTouched();
    } else {
      if (this.numerosSprints().includes(this.formNuevoSprint.get('numeroSprint')?.value)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ya existe un Sprint con ese número', life: 2000 });
      } else {
        // Actualizamos cambios
        // Creamos el sprint en el otro sitio
        this.storageService.setDocumentByAddress(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints/`, {id: this.formNuevoSprint.get('numeroSprint')?.value} as Sprint).then(() => {
          this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Sprint creado con éxito', life: 3000 });
          this.sprintSeleccionado.set(this.formNuevoSprint.get('numeroSprint')?.value);
          // this.router.navigateByUrl(`/sprint/${this.formNuevoSprint.get('numeroSprint')?.value}`); // TODO: No viable por ahora
          const arrLocation = location.href.split('/');
          arrLocation.pop();
          location.href = arrLocation.join('/') + '/' + this.formNuevoSprint.get('numeroSprint')?.value;
          location.reload();
          this.nuevoSprintDialog = false;
        }).catch((err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
        });
      }
    }
  }

  confirmarEliminarSprint(numeroSprint: number) {
    this.confirmationService.confirm({
        header: '¿Seguro que desea eliminar este Sprint?',
        message: 'Esta elección no podrá deshacerse. NO HABRÁ VUELTA ATRÁS.',
        rejectButtonStyleClass: '!bg-white !border-none !text-black !p-button-sm hover:!bg-gray-100',
        acceptButtonStyleClass: '!bg-red-500 !border-none !p-button-sm hover:!bg-red-400',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Sí, entiendo los riesgos, ELIMINAR',
        accept: () => {
          this.storageService.deleteDocumentById(`${sessionStorage.getItem('contrasenaAcceso')!}/sprints`, String(numeroSprint)).then(() => {
            this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Sprint eliminado con éxito', life: 3000 });
            this.router.navigateByUrl('/'); // Navegamos al ultimo sprint
          }).catch((err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Hubo un error inesperado', detail: 'Vuelva a intentarlo más tarde', life: 3000 });
          });
        },
    });
  }

  redirigir(url: string) {
    this.visibleSidebar = false;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(url);
    });
  }

  cerrarSesion() {
    sessionStorage.removeItem('contrasenaAcceso');
    localStorage.removeItem('contrasenaAcceso');
  }
}
