import { Routes } from '@angular/router';
import { SprintComponent } from './views/sprint/sprint.component';
import { EstadisticasComponent } from './views/estadisticas/estadisticas.component';

export const routes: Routes = [
    {path: '', pathMatch: 'full', component: SprintComponent},
    {path: 'Sprint/:id', component: SprintComponent},
    {path: 'estadisticas', component: EstadisticasComponent},
    {path: '**', redirectTo: ''},
];
