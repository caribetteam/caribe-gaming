//import 'zone.js';
//import 'zone.js/testing';
import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RawgService } from './app/core/services/rawg.service';
import { AuthService } from './app/core/services/auth';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

TestBed.initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);

TestBed.configureTestingModule({
  providers: [
    provideRouter([]),
    {
      provide: RawgService,
      useValue: {
        obterDetalhesJogo: () =>
          of({
            id: 1,
            name: 'Jogo de teste',
            description_raw: 'Descrição de teste',
            released: '2026-01-01',
            developers: [{ name: 'Dev' }],
            publishers: [{ name: 'Publisher' }],
            esrb_rating: { name: 'Livre' },
            platforms: [{ platform: { name: 'PC' } }],
            background_image: '',
          }),
        obterScreenshots: () => of({ count: 0, results: [] }),
      },
    },
    {
      provide: AuthService,
      useValue: {
        usuarioAtual$: of(null),
        obterAccessToken: async () => null,
      },
    },
  ],
});