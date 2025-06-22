import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'highlightpipe', standalone: true })
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(texto: string | null | undefined, filtro: string | null | undefined): SafeHtml {
    if (!texto || !filtro?.trim()) return texto ?? '';

    // Normaliza texto para encontrar coincidencias sin tildes y sin importar mayúsculas
    const textoOriginal = texto;
    const textoNormalizado = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filtroNormalizado = filtro.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    let resultado = '';
    let i = 0;

    while (i < texto.length) {
      const parte = textoNormalizado.substring(i);
      const index = parte.indexOf(filtroNormalizado);

      if (index === -1) {
        resultado += textoOriginal.substring(i);
        break;
      }

      resultado += textoOriginal.substring(i, i + index);
      resultado += `<span class="resaltado">${textoOriginal.substring(i + index, i + index + filtro.length)}</span>`;
      i += index + filtro.length;
    }

    return this.sanitizer.bypassSecurityTrustHtml(resultado);
  }
}
