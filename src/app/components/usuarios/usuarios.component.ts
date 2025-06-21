import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { StorageService } from '../../shared/services/storage.service';
import { obtenerFechaCumpleString } from '../../shared/util/util';
import { Usuario } from '../../shared/interfaces/usuario';
import { SortMeta, TableState } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-usuarios',
  imports: [TableModule, FormsModule, CommonModule, TooltipModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  usuarios = inject(StorageService).usuarios;
  usuariosTabla = computed(() => this.usuarios().map(usu => {
    usu.cumpleanos = obtenerFechaCumpleString(usu.cumpleanos as any);
    return usu;
  }));
  isSorted: boolean = true;

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

  nuevoUsuario() {

  }
  
  editarUsuario(usuario: Usuario) {

  }
  
  eliminarUsuario(usuario: Usuario) {

  }

  obtenerFechaCumpleString(cumpleanos: any) {
    return obtenerFechaCumpleString(cumpleanos);
  }
}
