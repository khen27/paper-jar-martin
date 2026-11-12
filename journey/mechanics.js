// Night types + recap scoring. The journey is a campaign of four verbs,
// stolen from classic Talk Trap (KnowMe guess/reveal, Party dares).

const loc = (pair, language) => (pair ? pair[language] || pair.en || pair.cs : '');

export const TYPES = ['guess', 'pick', 'do', 'talk'];

export const TYPE_META = {
  guess: {
    icon: 'knowMe',
    labelCs: 'Hádej',
    labelEn: 'Guess',
    hintCs: 'Jeden vybere potají. Druhý hádá. Pak odhalíte.',
    hintEn: 'One of you picks in secret. The other guesses. Then you reveal.',
  },
  pick: {
    icon: 'handshake',
    labelCs: 'Vyberte',
    labelEn: 'Pick',
    hintCs: 'Oba vyberete potají. Pak porovnáte, jestli jste trefili stejně.',
    hintEn: 'You both pick in secret. Then you see if you chose the same.',
  },
  do: {
    icon: 'trophy',
    labelCs: 'Výzva',
    labelEn: 'Dare',
    hintCs: 'Splňte to teď. Hotovo, přeskočit, nebo později.',
    hintEn: 'Do it now. Done, skip, or later.',
  },
  talk: {
    icon: 'sparkles',
    labelCs: 'Řekněte',
    labelEn: 'Talk',
    hintCs: 'Řekněte to nahlas. Řádek na památku je dobrovolný.',
    hintEn: 'Say it out loud. A keepsake line is optional.',
  },
};

export const typeLabel = (type, language) => {
  const m = TYPE_META[type] || TYPE_META.talk;
  return language === 'cs' ? m.labelCs : m.labelEn;
};

export const typeHint = (type, language) => {
  const m = TYPE_META[type] || TYPE_META.talk;
  return language === 'cs' ? m.hintCs : m.hintEn;
};

export const typeIcon = (type) => (TYPE_META[type] || TYPE_META.talk).icon;

/** Option may be a { cs, en } pair or a plain string. */
export const locOpt = (opt, language) => {
  if (opt == null) return '';
  if (typeof opt === 'string') return opt;
  return loc(opt, language);
};

export const optionText = (night, index, language) => locOpt(night?.options?.[index], language);

/**
 * Recap scoreboard from a season's answers map.
 * Counts only nights that actually used the matching mechanic.
 */
export const seasonStats = (answers = {}) => {
  const entries = Object.values(answers || {});
  const guesses = entries.filter((e) => e.type === 'guess');
  const picks = entries.filter((e) => e.type === 'pick');
  const dares = entries.filter((e) => e.type === 'do');
  const talks = entries.filter((e) => e.type === 'talk' && (e.a || e.b));
  return {
    nights: entries.length,
    guesses: guesses.length,
    matches: guesses.filter((e) => e.match).length,
    picks: picks.length,
    same: picks.filter((e) => e.same).length,
    dares: dares.length,
    daresDone: dares.filter((e) => e.challengeStatus === 'done').length,
    talks: talks.length,
  };
};

/** Who hides on a guess night: A on even index, B on odd — so they take turns. */
export const guessHider = (nightIndex) => (nightIndex % 2 === 0 ? 'a' : 'b');
