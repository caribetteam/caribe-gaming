import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sobrenos } from './sobrenos';

describe('Sobrenos', () => {
  let component: Sobrenos;
  let fixture: ComponentFixture<Sobrenos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sobrenos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sobrenos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
