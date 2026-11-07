import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="top">
      <strong>Pokédex</strong>
      <a routerLink="/pokedex" routerLinkActive="on">Pokémon</a>
      <a routerLink="/tipi" routerLinkActive="on">Tipi</a>
    </header>
    <main><router-outlet /></main>
    <footer>
      Dati e immagini da <a href="https://pokeapi.co" target="_blank" rel="noopener">PokéAPI</a>.
      Pokémon e i nomi dei personaggi sono marchi di Nintendo, Game Freak e Creatures Inc.
      Progetto non ufficiale, senza scopo di lucro.
    </footer>
  `,
  styles: `
    .top { display:flex; align-items:center; gap:1rem; padding:.9rem 1rem; background:#222; color:#fff; position:sticky; top:0; z-index:20;
      a { color:#9cf; text-decoration:none; padding:.1rem .2rem; border-bottom:2px solid transparent; &.on { border-color:#9cf; } } }
    main { max-width:1200px; margin:0 auto; padding:1rem; }
    footer { max-width:1200px; margin:1rem auto 2rem; padding:0 1rem; color:#777; font-size:.8rem; a { color:#5577aa; } }
  `,
})
export class App {}
