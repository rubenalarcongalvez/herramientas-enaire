import { Routes } from '@angular/router';
import { SprintComponent } from './views/sprint/sprint.component';
import { EstadisticasComponent } from './views/estadisticas/estadisticas.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { DiasLibresComponent } from './views/dias-libres/dias-libres.component';
import { IncidenciasMglComponent } from './views/incidencias-mgl/incidencias-mgl.component';
import { ModulosComponent } from './views/modulos/modulos.component';

export const routes: Routes = [
    {path: '', pathMatch: 'full', component: SprintComponent},
    {path: 'sprint/:id', component: SprintComponent, data: { renderMode: 'no-prerender' }},
    {path: 'estadisticas', component: EstadisticasComponent},
    {path: 'dias-libres', component: DiasLibresComponent},
    {path: 'incidencias-mgl', component: IncidenciasMglComponent},
    
    {path: 'modulos', component: ModulosComponent},
    {path: 'usuarios', component: UsuariosComponent},
    {path: '**', redirectTo: ''},
];
