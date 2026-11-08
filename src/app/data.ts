import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Stat { name: string; value: number }
export interface Weakness { type: string; multiplier: number }
export interface Pokemon { id: number; key: number; form: boolean; name: string; image: string; types: string[]; stats: Stat[]; weaknesses: Weakness[] }

export interface Weak { type: string; multiplier: number; why: string }
export interface Immune { type: string; why: string }
export interface TypeInfo { type: string; tagline: string; weakTo: Weak[]; immuneTo: Immune[]; resists: string[]; strongAgainst: string[] }

export const IT: Record<string, string> = {
  normal: 'Normale', fire: 'Fuoco', water: 'Acqua', electric: 'Elettro', grass: 'Erba', ice: 'Ghiaccio',
  fighting: 'Lotta', poison: 'Veleno', ground: 'Terra', flying: 'Volante', psychic: 'Psico', bug: 'Coleottero',
  rock: 'Roccia', ghost: 'Spettro', dragon: 'Drago', dark: 'Buio', steel: 'Acciaio', fairy: 'Folletto',
};

/** Carica i dati statici (public/data/*.json) una sola volta. */
@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  pokemon = signal<Pokemon[]>([]);
  typeChart = signal<TypeInfo[]>([]);
  error = signal('');

  constructor() {
    // Percorsi relativi: funzionano anche sotto /nome-repo/ su GitHub Pages.
    this.http.get<Pokemon[]>('data/pokemon.json').subscribe({
      next: (r) => this.pokemon.set(r),
      error: (e) => this.error.set('Impossibile caricare i Pokémon: ' + e.message),
    });
    this.http.get<TypeInfo[]>('data/types.json').subscribe({
      next: (r) => this.typeChart.set(r),
      error: (e) => this.error.set('Impossibile caricare i tipi: ' + e.message),
    });
  }
}
