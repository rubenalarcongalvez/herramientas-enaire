import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TipoElementoEnum } from '../enums/tipo-elemento';

/**
 * Hace que el control sea required solo si el otro control == 'dist'
 * @param otro Nombre del control a vigilar
 */
export function requiredSiOtroCampoEsDist(otro: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;

    const otroCtrl = parent.get(otro);
    if (!otroCtrl) return null;

    const esDist = otroCtrl.value === TipoElementoEnum.dist;

    // Si el otro vale 'dist' y este está vacío: error required
    if (esDist && !control.value) {
      return { required: true };
    }

    // En cualquier otro caso (otro no es 'dist' o vacío) es valido
    return null;
  };
}
