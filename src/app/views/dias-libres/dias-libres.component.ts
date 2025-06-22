import { Component, computed, inject } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { StorageService } from '../../shared/services/storage.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { adaptarFechaACalendario } from '../../shared/util/util';
import { CalendarOptions } from '@fullcalendar/core';

interface EventoCalendario {
  title: string;
  date: string;
  color: string;
}

@Component({
  selector: 'app-dias-libres',
  standalone: true,
  imports: [FullCalendarModule, ProgressSpinnerModule],
  templateUrl: './dias-libres.component.html',
  styleUrl: './dias-libres.component.css'
})
export class DiasLibresComponent {
  private storage = inject(StorageService);
  usuarios  = this.storage.usuarios;

  /* Eventos derivados en tiempo real de usuarios() */
  eventosCalendario = computed<EventoCalendario[]>(() =>
    this.usuarios().flatMap(usu => {
      const nombre = usu?.alias || usu?.nombre;
      const push  = (arr: Date[], color: string) =>
        arr.map(d => ({
          title: nombre,
          date : adaptarFechaACalendario(d),
          color
        }));

      return [
        ...push(usu.vacaciones, '#2563eb'),
        ...push(usu.asuntosPropios,'orangered'),
        ...push(usu.enfermedad, '#16a34a'),
        ...push(usu.otrasAusencias, '#a855f7')
      ];
    })
  );

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1,
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },
    events: this.eventosCalendario()
  }));
}