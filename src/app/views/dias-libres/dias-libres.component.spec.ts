import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiasLibresComponent } from './dias-libres.component';

describe('DiasLibresComponent', () => {
  let component: DiasLibresComponent;
  let fixture: ComponentFixture<DiasLibresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiasLibresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiasLibresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
