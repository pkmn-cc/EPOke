import * as pkmn from '@pkmn.cc/data';

export interface StatsTable<T> {
  hp: T;
  atk: T;
  def: T;
  spa: T;
  spd: T;
  spe: T;
}

export interface Range<T> {
  min: T;
  max: T;
}

export class Stats implements StatsTable<number> {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;

  constructor(stats: StatsTable<number>) {
    this.hp = stats.hp;
    this.atk = stats.atk;
    this.def = stats.def;
    this.spa = stats.spa;
    this.spd = stats.spd;
    this.spe = stats.spe;
  }

  toString() {
    return Stats.display(this);
  }

  static display(stats: StatsTable<number>, compact?: boolean) {
    return displayStats(stats, v => `${v}`, compact);
  }

  static fromString(s: string): StatsTable<number> {
    return collapseRange(StatsRange.fromString(s)) as StatsTable<number>;
  }
}

export class StatsRange implements StatsTable<Range<number>> {
  hp: Range<number>;
  atk: Range<number>;
  def: Range<number>;
  spa: Range<number>;
  spd: Range<number>;
  spe: Range<number>;

  constructor(stats: StatsTable<Range<number>>) {
    this.hp = stats.hp;
    this.atk = stats.atk;
    this.def = stats.def;
    this.spa = stats.spa;
    this.spd = stats.spd;
    this.spe = stats.spe;
  }

  toString() {
    return StatsRange.display(this);
  }

  static display(stats: StatsTable<Range<number>>, compact?: boolean) {
    return displayStats(stats, v => displayRange(v), compact);
  }

  static fromString(s: string): StatsTable<Range<number>> {
    return parseStats(s);
  }
}

export interface SpreadTable<T> {
  nature: pkmn.Nature;
  ivs: StatsTable<T>;
  evs: StatsTable<T>;
}

export class Spread implements SpreadTable<number> {
  nature: pkmn.Nature;
  ivs: StatsTable<number>;
  evs: StatsTable<number>;

  constructor(spread: SpreadTable<number>);
  constructor(
      nature: pkmn.Nature, ivs: StatsTable<number>, evs: StatsTable<number>);
  constructor(
      spread: pkmn.Nature|SpreadTable<number>, ivs?: StatsTable<number>,
      evs?: StatsTable<number>) {
    if ('id' in spread) {
      this.nature = spread;
      this.ivs = ivs!;
      this.evs = evs!;
    } else {
      this.nature = spread.nature;
      this.ivs = spread.ivs;
      this.evs = spread.evs;
    }
  }

  toString() {
    return Spread.display(this);
  }

  static display(spread: SpreadTable<number>, compact?: boolean) {
    return displaySpread(spread, (v, t) => {
      if (t === 'iv') {
        return !compact && v === 31 ? '' : `${v}`;
      } else {
        return !compact && v === 0 ? '' : `${v}`;
      }
    }, compact);
  }

  static fromSparse(spread: SparseSpreadTable<number>) {
    return fromSparse(spread, t => zero(t));
  }

  static fromString(s: string): SpreadTable<number> {
    const range = SpreadRange.fromString(s);
    return {
      nature: range.nature,
      evs: collapseRange(range.evs) as StatsTable<number>,
      ivs: collapseRange(range.ivs) as StatsTable<number>,
    };
  }
}

export class SpreadRange implements SpreadTable<Range<number>> {
  nature: pkmn.Nature;
  ivs: StatsTable<Range<number>>;
  evs: StatsTable<Range<number>>;

  constructor(spread: SpreadTable<Range<number>>);
  constructor(
      nature: pkmn.Nature, ivs: StatsTable<Range<number>>,
      evs: StatsTable<Range<number>>);
  constructor(
      spread: pkmn.Nature|SpreadTable<Range<number>>,
      ivs?: StatsTable<Range<number>>, evs?: StatsTable<Range<number>>) {
    if ('id' in spread) {
      this.nature = spread;
      this.ivs = ivs!;
      this.evs = evs!;
    } else {
      this.nature = spread.nature;
      this.ivs = spread.ivs;
      this.evs = spread.evs;
    }
  }

  toString() {
    return SpreadRange.display(this);
  }

  static display(spread: SpreadTable<Range<number>>, compact?: boolean) {
    return displaySpread(spread, (v, t) => {
      if (t === 'iv') {
        const s = displayRange(v, 31);
        return !compact && s === '31' ? '' : s;
      } else {
        const s = displayRange(v, 252);
        return !compact && s === '0' ? '' : s;
      }
    }, compact);
  }

  static fromSparse(spread: SparseSpreadTable<Range<number>>) {
    return fromSparse(spread, t => ({min: zero(t), max: zero(t)}));
  }

  static fromString(s: string): SpreadTable<Range<number>> {
    return SpreadRange.fromSparse(SparseSpreadRange.fromString(s));
  }
}

export interface SparseSpreadTable<T> {
  nature: pkmn.Nature;
  ivs: Partial<StatsTable<T>>;
  evs: Partial<StatsTable<T>>;
}

export class SparseSpread implements SparseSpreadTable<number> {
  nature: pkmn.Nature;
  ivs: Partial<StatsTable<number>>;
  evs: Partial<StatsTable<number>>;

  constructor(spread: SparseSpreadTable<number>);
  constructor(
      nature: pkmn.Nature, ivs: Partial<StatsTable<number>>,
      evs: Partial<StatsTable<number>>);
  constructor(
      spread: pkmn.Nature|SparseSpreadTable<number>,
      ivs?: Partial<StatsTable<number>>, evs?: Partial<StatsTable<number>>) {
    if ('id' in spread) {
      this.nature = spread;
      this.ivs = ivs!;
      this.evs = evs!;
    } else {
      this.nature = spread.nature;
      this.ivs = spread.ivs;
      this.evs = spread.evs;
    }
  }

  toString() {
    return SparseSpread.display(this);
  }

  static display(spread: SparseSpreadTable<number>, compact?: boolean) {
    return Spread.display(Spread.fromSparse(spread), compact);
  }

  static fromString(s: string): SparseSpreadTable<number> {
    const range = SparseSpreadRange.fromString(s);
    return {
      nature: range.nature,
      evs: collapseRange(range.evs),
      ivs: collapseRange(range.ivs),
    };
  }
}

export class SparseSpreadRange implements SparseSpreadTable<Range<number>> {
  nature: pkmn.Nature;
  ivs: Partial<StatsTable<Range<number>>>;
  evs: Partial<StatsTable<Range<number>>>;

  constructor(spread: SparseSpreadTable<Range<number>>);
  constructor(
      nature: pkmn.Nature, ivs: Partial<StatsTable<Range<number>>>,
      evs: Partial<StatsTable<Range<number>>>);
  constructor(
      spread: pkmn.Nature|SparseSpreadTable<Range<number>>,
      ivs?: Partial<StatsTable<Range<number>>>,
      evs?: Partial<StatsTable<Range<number>>>) {
    if ('id' in spread) {
      this.nature = spread;
      this.ivs = ivs!;
      this.evs = evs!;
    } else {
      this.nature = spread.nature;
      this.ivs = spread.ivs;
      this.evs = spread.evs;
    }
  }

  toString() {
    return SparseSpreadRange.display(this);
  }
  static display(spread: SparseSpreadTable<Range<number>>, compact?: boolean) {
    return SpreadRange.display(SpreadRange.fromSparse(spread), compact);
  }

  static fromString(s: string): SparseSpreadTable<Range<number>> {
    return parseSpread(s);
  }
}

export const STATS = {
  hp: 0,
  atk: 1,
  def: 2,
  spa: 3,
  spd: 4,
  spe: 5
};

function zero(type: 'iv'|'ev') {
  return type === 'iv' ? 31 : 0;
}

function fromSparse<T>(
    sparse: SparseSpreadTable<T>, z: (t: 'iv'|'ev') => T): SpreadTable<T> {
  const iv = () => z('iv');
  const ev = () => z('ev');
  const spread = {
    nature: sparse.nature,
    ivs: {hp: iv(), atk: iv(), def: iv(), spa: iv(), spd: iv(), spe: iv()},
    evs: {hp: ev(), atk: ev(), def: ev(), spa: ev(), spd: ev(), spe: ev()}
  };

  let stat: pkmn.Stat;
  for (stat in STATS) {
    const iv = sparse.ivs[stat];
    if (iv !== undefined) spread.ivs[stat] = iv;
    const ev = sparse.evs[stat];
    if (ev !== undefined) spread.evs[stat] = ev;
  }

  return spread;
}

function displayStats<T>(
    stats: StatsTable<T>, display: (val: T) => string, compact?: boolean) {
  const s = [];
  let stat: pkmn.Stat;
  for (stat in STATS) {
    const d = display(stats[stat]);
    s.push(compact ? d : `${d} ${pkmn.Stats.display(stat)}`);
  }
  return s.join(compact ? '/' : ' / ');
}

function parseStats(s: string): StatsRange {
  const parsed: Partial<StatsRange> = {};
  const stats = Object.keys(STATS) as pkmn.Stat[];
  if (s.endsWith('e')) {
    for (const [i, pair] of s.split(' / ').entries()) {
      parsed[stats[i]] = parseRange(pair.split(' ')[0]);
    }
  } else {
    for (const [i, range] of s.split('/').entries()) {
      parsed[stats[i]] = parseRange(range);
    }
  }
  return parsed as StatsRange;
}

function displaySpread<T>(
    spread: SpreadTable<T>, display: (val: T, type: 'iv'|'ev') => string,
    compact?: boolean) {
  let stat: pkmn.Stat;
  const ivs = [];
  const evs = [];
  for (stat in STATS) {
    const s = pkmn.Stats.display(stat);
    const iv = display(spread.ivs[stat], 'iv');
    if (compact) {
      ivs.push(iv);
    } else {
      if (iv) ivs.push(`${iv} ${s}`);
    }
    const ev = display(spread.evs[stat], 'ev');
    if (compact) {
      evs.push(ev);
    } else {
      if (ev) evs.push(`${ev} ${s}`);
    }
  }

  if (compact) {
    if (spread.nature.plus && spread.nature.minus) {
      const plus = STATS[spread.nature.plus];
      const minus = STATS[spread.nature.minus];
      evs[plus] = `${evs[plus]}+`;
      evs[minus] = `${evs[minus]}-`;
    }
    const s = `${spread.nature} ${evs.join('/')}`;
    const i = ivs.join('/');
    return i === '31/31/31/31/31/31' ? s : `${s}\nIVs: ${i}`;
  }

  let s = '';
  if (evs.length) s += 'EVs: ' + evs.join(' / ') + '\n';
  s += `${spread.nature} Nature`;
  if (ivs.length) s += '\nIVs: ' + ivs.join(' / ');
  return s;
}

function parseSpread(s: string): SparseSpreadRange {
  if (s.startsWith('E')) {
    const [e, n, i] = s.split('\n');

    const nature = pkmn.Natures.get(n.slice(0, n.indexOf(' ')))!;
    const evs = parseSpreadValues(e.substr(5), 'ev');
    const ivs = i ? parseSpreadValues(i.substr(5), 'iv') : {};

    return {nature, evs, ivs};
  } else {
    const [ne, i] = s.split('\n');
    const [n, e] = ne.split(' ');

    const nature = pkmn.Natures.get(n)!;
    const evs = parseSpreadValues(e, 'ev', true);
    const ivs = i ? parseSpreadValues(i.substr(5), 'iv', true) : {};

    return {nature, evs, ivs};
  }
}

function parseSpreadValues(s: string, type: 'iv'|'ev', compact?: boolean) {
  const spread: Partial<StatsTable<Range<number>>> = {};
  const max = type === 'iv' ? 31 : 252;

  if (compact) {
    const stats = Object.keys(STATS) as pkmn.Stat[];
    for (let [i, range] of s.split('/').entries()) {
      if (range.endsWith('+') || range.endsWith('-')) {
        range = range.slice(0, -1);
      }
      spread[stats[i]] = parseRange(range, max);
    }
  } else {
    for (const pair of s.split(' / ')) {
      const [range, name] = pair.split(' ');
      spread[pkmn.Stats.get(name)!] = parseRange(range, max);
    }
  }

  return spread;
}

function displayRange(range: Range<number>, max = Infinity) {
  if (range.min === range.max || range.min === max) return `${range.min}`;
  if (range.max >= max) return `>${range.min}`;
  if (range.min === 0) return `<${range.max}`;
  return `${range.min}-${range.max}`;
}

function parseRange(s: string, max = Infinity): Range<number> {
  if (s.startsWith('>')) return {min: Number(s.slice(1)), max};
  if (s.startsWith('<')) return {min: 0, max: Number(s.slice(1))};
  const [lo, hi] = s.split('-');
  const min = Number(lo);
  return hi === undefined ? {min, max: min} : {min, max: Number(hi)};
}

function collapseRange<T>(ranges: Partial<StatsTable<Range<T>>>) {
  const stats: Partial<StatsTable<T>> = {};
  for (const [stat, range] of Object.entries(ranges)) {
    stats[stat as keyof StatsTable<T>] = range!.min;
  }
  return stats;
}

// TODO (Sparse)Spread -> Stats
// TODO (Sparse)SpreadRange -> StatsRange
