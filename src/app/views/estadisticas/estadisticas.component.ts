import { Component, computed, effect, inject } from '@angular/core';

/* Componentes PrimeNG */
import { ChartModule } from 'primeng/chart';
import { StorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'app-estadisticas',
  imports: [ChartModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent {
    usuarios = inject(StorageService).usuariosNoExentos;
    usuariosDists = computed(() => [...this.usuarios()].sort((u1, u2) => u2?.distsUltimosSprints - u1?.distsUltimosSprints));
    usuariosWars = computed(() => [...this.usuarios()].sort((u1, u2) => u2?.warsUltimosSprints - u1?.warsUltimosSprints));
    usuariosEars = computed(() => [...this.usuarios()].sort((u1, u2) => u2?.earsUltimosSprints - u1?.earsUltimosSprints));
    usuariosResponsables = computed(() => [...this.usuarios()].sort((u1, u2) => u2?.vecesResponsableUltimosSprints - u1?.vecesResponsableUltimosSprints));

    basicOptions: any;
    basicOptions2: any;

    basicDataDists: any;
    basicDataWars: any;
    basicDataEars: any;
    basicDataResponsables: any;
    basicDataMGL: any;

    constructor() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    
        effect(() => {
        const usuariosOrdenadosDists = [...this.usuarios()].sort((u2, u1) => u2?.distsUltimosSprints - u1?.distsUltimosSprints);
        const usuariosOrdenadosWars = [...this.usuarios()].sort((u2, u1) => u2?.warsUltimosSprints - u1?.warsUltimosSprints);
        const usuariosOrdenadosEars = [...this.usuarios()].sort((u2, u1) => u2?.earsUltimosSprints - u1?.earsUltimosSprints);
        const usuariosOrdenadosResponsables = [...this.usuarios()].sort((u2, u1) => u2?.vecesResponsableUltimosSprints - u1?.vecesResponsableUltimosSprints);
        const usuariosOrdenadosMGL = [...this.usuarios()].sort((u2, u1) => u2?.vecesMGLUltimosSprints - u1?.vecesMGLUltimosSprints);
    
        this.basicDataDists = {
          labels: usuariosOrdenadosDists.map(usu => usu?.alias || usu?.nombre),
          datasets: [
            {
              label: 'Dists',
              data: usuariosOrdenadosDists.map(usu => usu.distsUltimosSprints),
              backgroundColor: 'rgba(54, 162, 235, 0.2)', // Azul claro
              borderColor: 'rgb(54, 162, 235)',           // Azul fuerte
              borderWidth: 1
            }
          ]
        };
        
        this.basicDataWars = {
          labels: usuariosOrdenadosWars.map(usu => usu?.alias || usu?.nombre),
          datasets: [
            {
              label: 'Wars',
              data: usuariosOrdenadosWars.map(usu => usu.warsUltimosSprints),
              backgroundColor: 'rgba(255, 159, 64, 0.2)', // Naranja claro
              borderColor: 'rgb(255, 159, 64)',           // Naranja fuerte
              borderWidth: 1
            }
          ]
        };
        
        this.basicDataEars = {
          labels: usuariosOrdenadosEars.map(usu => usu?.alias || usu?.nombre),
          datasets: [
            {
              label: 'Ears',
              data: usuariosOrdenadosEars.map(usu => usu.earsUltimosSprints),
              backgroundColor: 'rgba(255, 99, 132, 0.2)', // Rojo claro
              borderColor: 'rgb(255, 99, 132)',           // Rojo fuerte
              borderWidth: 1
            }
          ]
        };
        
        this.basicDataResponsables = {
          labels: usuariosOrdenadosResponsables.map(usu => usu?.alias || usu?.nombre),
          datasets: [
            {
              label: 'Veces responsables de subida',
              data: usuariosOrdenadosResponsables.map(usu => usu.vecesResponsableUltimosSprints),
              backgroundColor: 'rgba(75, 192, 192, 0.2)', // Verde claro (tipo turquesa)
              borderColor: 'rgb(75, 192, 192)',           // Verde fuerte
              borderWidth: 1
            }
          ]
        };
        
        this.basicDataMGL = {
          labels: usuariosOrdenadosMGL.map(usu => usu?.alias || usu?.nombre),
          datasets: [
            {
              label: 'Número de tramos MGL',
              data: usuariosOrdenadosMGL.map(usu => usu.vecesMGLUltimosSprints),
              backgroundColor: 'rgba(153, 102, 255, 0.2)', // Púrpura claro
              borderColor: 'rgb(153, 102, 255)',           // Púrpura fuerte
              borderWidth: 1
            }
          ]
        };
    
        this.basicOptions = {
            plugins: {
            legend: {
                labels: {
                color: textColor
                }
            }
            },
            scales: {
            y: {
                beginAtZero: true,
                ticks: {
                color: textColorSecondary
                },
                grid: {
                color: surfaceBorder,
                drawBorder: false
                }
            },
            x: {
                ticks: {
                color: textColorSecondary
                },
                grid: {
                color: surfaceBorder,
                drawBorder: false
                }
            }
            }
        };

        this.basicOptions2 = {
            indexAxis: 'y',
            plugins: {
            legend: {
                labels: {
                color: textColor
                }
            }
            },
            scales: {
            y: {
                beginAtZero: true,
                ticks: {
                color: textColorSecondary
                },
                grid: {
                color: surfaceBorder,
                drawBorder: false
                }
            },
            x: {
                ticks: {
                color: textColorSecondary
                },
                grid: {
                color: surfaceBorder,
                drawBorder: false
                }
            }
            }
        };
    });
    }
}
