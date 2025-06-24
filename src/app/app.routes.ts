import { Routes } from '@angular/router';
import { SprintComponent } from './views/sprint/sprint.component';
import { EstadisticasComponent } from './views/estadisticas/estadisticas.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { DiasLibresComponent } from './views/dias-libres/dias-libres.component';

export const routes: Routes = [
    {path: '', pathMatch: 'full', component: SprintComponent},
    {path: 'sprint/:id', component: SprintComponent, data: { renderMode: 'no-prerender' }},
    {path: 'estadisticas', component: EstadisticasComponent},
    {path: 'dias-libres', component: DiasLibresComponent},
    
    {path: 'usuarios', component: UsuariosComponent},
    {path: '**', redirectTo: ''},
];
