import { Component, inject, signal } from '@angular/core';
import { DataService, IT, TypeInfo } from './data';

@Component({
  selector: 'app-types',
  templateUrl: './types.html',
  styleUrl: './types.scss',
})
export class Types {
  private data = inject(DataService);
  chart = this.data.typeChart;
  error = this.data.error;
  quiz = signal<TypeInfo | null>(null);
  revealed = signal(false);

  label(t: string) { return IT[t] ?? t; }

  nextQuiz() {
    const all = this.chart();
    if (!all.length) return;
    let n: TypeInfo;
    do { n = all[Math.floor(Math.random() * all.length)]; } while (all.length > 1 && n === this.quiz());
    this.quiz.set(n);
    this.revealed.set(false);
  }

  jump(t: string) {
    document.getElementById('type-' + t)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
