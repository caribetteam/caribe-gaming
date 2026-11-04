import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheSims } from './thesims';

describe('TheSims', () => {
  let component: TheSims;
  let fixture: ComponentFixture<TheSims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheSims],
    }).compileComponents();

    fixture = TestBed.createComponent(TheSims);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
