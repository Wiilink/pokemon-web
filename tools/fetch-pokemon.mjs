// Scarica tutti i Pokemon con le forme alternative (mega, regionali, gigamax...) da PokeAPI.
// Le forme seguono la forma base con lo stesso numero di Pokedex.
// Output: public/data/pokemon.json
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'pokemon.json');
const get = async (u) => {
  for (let a = 0; ; a++) {
    try { const r = await fetch(u); if (!r.ok) throw new Error(`${r.status} ${u}`); return await r.json(); }
    catch (e) { if (a > 3) throw e; await new Promise((r) => setTimeout(r, 1000)); }
  }
};
const cap = (s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const region = { alola: 'di Alola', galar: 'di Galar', hisui: 'di Hisui', paldea: 'di Paldea' };

function pretty(base, full) {
  const suffix = full === base ? '' : full.slice(base.length + 1);
  if (!suffix) return cap(base);
  const parts = suffix.split('-');
  const B = cap(base);
  if (parts[0] === 'mega') return `Mega ${B}${parts[1] ? ' ' + parts[1].toUpperCase() : ''}`;
  if (parts[0] === 'primal') return `${B} Primordiale`;
  if (parts.includes('gmax')) return `Gigamax ${B}`;
  if (region[parts[0]]) return `${B} ${region[parts[0]]}${parts.length > 1 ? ' (' + cap(parts.slice(1).join('-')) + ')' : ''}`;
  return `${B} (${cap(suffix)})`;
}

const typeList = (await get('https://pokeapi.co/api/v2/type?limit=100')).results
  .map((t) => t.name).filter((n) => !['unknown', 'shadow', 'stellar'].includes(n));
const chart = {};
for (const t of typeList) {
  const d = (await get(`https://pokeapi.co/api/v2/type/${t}`)).damage_relations;
  chart[t] = { double: d.double_damage_from.map((x) => x.name), half: d.half_damage_from.map((x) => x.name), none: d.no_damage_from.map((x) => x.name) };
}
const mult = (types, atk) => types.reduce((m, t) => {
  const c = chart[t];
  return m * (c.none.includes(atk) ? 0 : c.double.includes(atk) ? 2 : c.half.includes(atk) ? 0.5 : 1);
}, 1);
const statNames = { hp: 'HP', attack: 'Attacco', defense: 'Difesa', 'special-attack': 'Att. Sp.', 'special-defense': 'Dif. Sp.', speed: 'Velocità' };

const total = (await get('https://pokeapi.co/api/v2/pokemon-species?limit=1')).count;
const results = new Array(total);
let next = 1, done = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next <= total) {
    const id = next++;
    const sp = await get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const forms = [];
    for (const v of sp.varieties) {
      const p = await get(v.pokemon.url);
      const art = p.sprites.other['official-artwork'].front_default || p.sprites.front_default;
      if (!art) continue;
      const types = p.types.map((t) => t.type.name);
      forms.push({
        id,
        key: p.id,
        name: pretty(sp.name, p.name),
        form: !v.is_default,
        image: art.replace('https://raw.githubusercontent.com/PokeAPI/sprites/master/', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/'),
        types,
        stats: p.stats.map((s) => ({ name: statNames[s.stat.name], value: s.base_stat })),
        weaknesses: typeList.map((t) => ({ type: t, multiplier: mult(types, t) })).filter((w) => w.multiplier > 1).sort((a, b) => b.multiplier - a.multiplier),
      });
    }
    results[id - 1] = forms; // la forma di default e' la prima nelle varieties
    process.stdout.write(`\r${++done}/${total}`);
  }
}));
const list = results.flat();
writeFileSync(out, JSON.stringify(list));
console.log(`\nOK ${list.length} voci -> ${out}`);
