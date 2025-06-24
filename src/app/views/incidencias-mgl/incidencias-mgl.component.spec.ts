import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenciasMglComponent } from './incidencias-mgl.component';

describe('IncidenciasMglComponent', () => {
  let component: IncidenciasMglComponent;
  let fixture: ComponentFixture<IncidenciasMglComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenciasMglComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenciasMglComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
