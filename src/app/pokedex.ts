import { Component, computed, inject, signal } from '@angular/core';
import { DataService, IT, Pokemon } from './data';

const PAGE_SIZE = 10;
const MAX_SUGGESTIONS = 5;

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.scss',
})
export class Pokedex {
  private data = inject(DataService);

  query = signal('');     // testo nella casella
  search = signal('');    // filtro applicato alla lista
  type = signal('');
  page = signal(1);
  active = signal(-1);
  open = signal(false);

  error = this.data.error;
  loading = computed(() => this.data.pokemon().length === 0 && !this.data.error());
  types = computed(() => [...new Set(this.data.pokemon().flatMap((p) => p.types))].sort());

  private filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.type();
    return this.data.pokemon().filter(
      (p) => (!q || p.name.toLowerCase().includes(q)) && (!t || p.types.includes(t)),
    );
  });
  total = computed(() => this.filtered().length);
  pages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  items = computed(() => {
    const start = (Math.min(this.page(), this.pages()) - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  // Al massimo 5 suggerimenti, solo per nome; prima quelli che iniziano con il testo scritto.
  suggestions = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return [];
    return this.data.pokemon()
      .filter((p) => p.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)) || a.id - b.id)
      .slice(0, MAX_SUGGESTIONS);
  });

  onInput(v: string) {
    this.query.set(v);
    this.active.set(-1);
    this.open.set(v.trim().length > 0);
    if (!v.trim() && this.search()) this.apply('');
  }

  onKey(e: KeyboardEvent) {
    const n = this.suggestions().length;
    if (e.key === 'ArrowDown' && n) { e.preventDefault(); this.open.set(true); this.active.set((this.active() + 1) % n); }
    else if (e.key === 'ArrowUp' && n) { e.preventDefault(); this.active.set((this.active() - 1 + n) % n); }
    else if (e.key === 'Escape') { this.open.set(false); }
    else if (e.key === 'Enter') {
      const s = this.suggestions()[this.active()];
      if (s) this.pick(s); else this.apply(this.query().trim());
    }
  }

  pick(s: Pokemon) { this.query.set(s.name); this.apply(s.name); }

  apply(name: string) {
    this.open.set(false);
    this.search.set(name);
    this.page.set(1);
  }

  onType(v: string) { this.type.set(v); this.page.set(1); }

  go(p: number) {
    this.page.set(Math.min(Math.max(1, p), this.pages()));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  label(t: string) { return IT[t] ?? t; }
  num(id: number) { return '#' + String(id).padStart(3, '0'); }
  pct(v: number) { return Math.min(100, (v / 255) * 100); }
  sum(p: Pokemon) { return p.stats.reduce((s, x) => s + x.value, 0); }
}
