import { Component, computed, inject, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { StorageService } from '../../shared/services/storage.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { adaptarFechaACalendario, normalizarCadena, pasarDateStrAFormatoEspanol } from '../../shared/util/util';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../shared/interfaces/usuario';

interface EventoCalendario {
  title: string;
  date: string;
  color: string;
}

enum coloresEnum {
  vacaciones = '#2563eb',
  asuntosPropios = 'orangered',
  enfermedad = '#16a34a',
  otrasAusencias = '#a855f7',
}

@Component({
  selector: 'app-dias-libres',
  standalone: true,
  imports: [FullCalendarModule, ProgressSpinnerModule, DialogModule, CommonModule, FloatLabelModule, AutoCompleteModule, FormsModule],
  templateUrl: './dias-libres.component.html',
  styleUrl: './dias-libres.component.css'
})
export class DiasLibresComponent {
  coloresEnum = coloresEnum;

  private storage = inject(StorageService);
  usuarios = this.storage.usuarios;
  usuariosCalendario = signal([]);
  listaFiltradaUsuarios: Usuario[] = [];
  infoDialog: boolean = false;
  diaSeleccionado = signal<string>('');
  diaSeleccionadoSpa = computed<string>(() => pasarDateStrAFormatoEspanol(this.diaSeleccionado()));

  eventosMostrarDiaSeleccionado = computed(() => this.eventosCalendario().filter(evento => evento.date === this.diaSeleccionado()));

  vacacionesMostrarDiaSeleccionado = computed(() => this.eventosMostrarDiaSeleccionado().filter(evento => evento.color === coloresEnum.vacaciones));
  asuntosPropiosMostrarDiaSeleccionado = computed(() => this.eventosMostrarDiaSeleccionado().filter(evento => evento.color === coloresEnum.asuntosPropios));
  enfermedadesMostrarDiaSeleccionado = computed(() => this.eventosMostrarDiaSeleccionado().filter(evento => evento.color === coloresEnum.enfermedad));
  otrosMostrarDiaSeleccionado = computed(() => this.eventosMostrarDiaSeleccionado().filter(evento => evento.color === coloresEnum.otrasAusencias));

  /* Eventos derivados en tiempo real de usuarios() */
  eventosCalendario = computed<EventoCalendario[]>(() =>
    (this.usuariosCalendario()?.length ? this.usuariosCalendario() : this.usuarios()).flatMap(usu => {
      const nombre = usu?.alias || usu?.nombre;
      const push  = (arr: Date[], color: string) =>
        arr.map(d => ({
          title: nombre,
          date : adaptarFechaACalendario(d),
          color
        }));

      return [
        ...push(usu.vacaciones, coloresEnum.vacaciones),
        ...push(usu.asuntosPropios, coloresEnum.asuntosPropios),
        ...push(usu.enfermedad, coloresEnum.enfermedad),
        ...push(usu.otrasAusencias, coloresEnum.otrasAusencias)
      ];
    })
  );

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1,
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },
    events: this.eventosCalendario(),
    dateClick: (info: DateClickArg) => {
      this.diaSeleccionado.set(info.dateStr);
      this.infoDialog = true;
    }
  }));

  filterUsuarios(event: AutoCompleteCompleteEvent) {
    let query = event.query;

    this.listaFiltradaUsuarios = this.usuarios().filter(usuario => !query || normalizarCadena(usuario.alias)?.includes(normalizarCadena(query)) || normalizarCadena(usuario.nombre)?.includes(normalizarCadena(query)));
  }
}
