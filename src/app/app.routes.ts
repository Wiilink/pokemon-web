import { Routes } from '@angular/router';
import { Pokedex } from './pokedex';
import { Types } from './types';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pokedex' },
  { path: 'pokedex', component: Pokedex, title: 'Pokédex' },
  { path: 'tipi', component: Types, title: 'Tipi e debolezze' },
  { path: '**', redirectTo: 'pokedex' },
];
