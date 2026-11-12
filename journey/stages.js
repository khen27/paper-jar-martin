// Stage strategy. Four relationship stages, each with a tailored opening night
// so the first card is already a game (Guess or Pick), not an essay.

export const STAGES = [
  {
    id: 'justMet',
    seasonId: 'justUs',
    icon: 'sparkles',
    labelKey: 'stageJustMet',
    intent: {
      cs: 'Právě jste se poznali: snížit napětí, odměnit upřímnost, ať první karta působí bezpečně a hravě.',
      en: 'Just met: lower the stakes, reward honesty, make the first card feel safe and playful.',
    },
    opener: {
      phase: 'play',
      type: 'guess',
      q: {
        cs: 'Jaký byl tvůj úplně první dojem ze mě — ten, který sis nechal/a pro sebe?',
        en: 'What was your honest first impression of me — the one you kept to yourself?',
      },
      options: [
        { cs: 'Hřejivý', en: 'Warm' },
        { cs: 'Ohromující', en: 'Impressive' },
        { cs: 'Trochu děsivý', en: 'A little intimidating' },
        { cs: '„Oh ne, tohle se mi líbí“', en: '“Oh no, I like this”' },
      ],
      alt: {
        type: 'pick',
        q: { cs: 'Co dnes večer chceme?', en: 'What do we want tonight?' },
        options: [
          { cs: 'Zasmát se', en: 'A laugh' },
          { cs: 'Něco pravdivého', en: 'Something true' },
          { cs: 'Výzvu', en: 'A dare' },
          { cs: 'Jen v klidu', en: 'Keep it easy' },
        ],
      },
    },
  },
  {
    id: 'dating',
    seasonId: 'justUs',
    icon: 'cheers',
    labelKey: 'stageDating',
    intent: {
      cs: 'Randíte: pojmenovat záměr — proč tohle, proč teď — bez tlaku na vážnost.',
      en: 'Dating: surface intention — why this, why now — without forcing seriousness.',
    },
    opener: {
      phase: 'play',
      type: 'guess',
      q: {
        cs: 'Co tě přimělo říct tomuhle ano — randění, dnešnímu večeru, mně?',
        en: 'What made you say yes to this — to dating, to tonight, to me?',
      },
      options: [
        { cs: 'Zvědavost', en: 'Curiosity' },
        { cs: 'Chemie', en: 'Chemistry' },
        { cs: 'Načasování', en: 'Timing' },
        { cs: 'Prostě se mi líbíš', en: 'I just like you' },
      ],
      alt: {
        type: 'pick',
        q: { cs: 'Co dnes večer chceme?', en: 'What do we want tonight?' },
        options: [
          { cs: 'Zasmát se', en: 'A laugh' },
          { cs: 'Něco pravdivého', en: 'Something true' },
          { cs: 'Výzvu', en: 'A dare' },
          { cs: 'Jen v klidu', en: 'Keep it easy' },
        ],
      },
    },
  },
  {
    id: 'living',
    seasonId: 'stayClose',
    icon: 'handshake',
    labelKey: 'stageLiving',
    intent: {
      cs: 'Bydlíte spolu: od logistiky zpátky k týmu; pojmenovat maličkosti, které se vytratily.',
      en: 'Living together: move from logistics back to team; name the small things that slipped.',
    },
    opener: {
      phase: 'life',
      type: 'pick',
      q: {
        cs: 'Kdy jsme se tenhle týden cítili jako tým, i kdyby jen na deset minut?',
        en: 'When did we feel like a team this week, even for ten minutes?',
      },
      options: [
        { cs: 'Úkol splněný spolu', en: 'A chore done together' },
        { cs: 'Vtip v chaosu', en: 'A joke in the mess' },
        { cs: 'Plán, který jsme dodrželi', en: 'A plan we both kept' },
        { cs: 'Necítili — a to je odpověď', en: 'We didn’t — and that’s the answer' },
      ],
      alt: {
        type: 'do',
        q: { cs: 'Chráněný večer.', en: 'A protected evening.' },
        challenge: {
          cs: 'Jeden večer tento týden si chraňte jako schůzku. Teď ho zapište.',
          en: 'Protect one evening this week like a meeting. Put it on the calendar now.',
        },
      },
    },
  },
  {
    id: 'married',
    seasonId: 'stayClose',
    icon: 'candle',
    labelKey: 'stageMarried',
    intent: {
      cs: 'Roky spolu: znovu otevřít zvědavost; dokázat, že je pořád co objevovat.',
      en: 'Years in: re-open curiosity; prove there is still something to learn.',
    },
    opener: {
      phase: 'life',
      type: 'guess',
      q: {
        cs: 'Co o tobě pořád dokáže překvapit — i po celém tom čase?',
        en: 'What about you can still surprise you, after all this time?',
      },
      options: [
        { cs: 'Jak odpočívám', en: 'How I rest' },
        { cs: 'Co pořád chci', en: 'What I still want' },
        { cs: 'Čeho se bojím', en: 'What I worry about' },
        { cs: 'Malá radost, o které nemluvím', en: 'A small joy I never mention' },
      ],
      alt: {
        type: 'do',
        q: { cs: 'Jedna pravda, i malá.', en: 'One true thing, even a small one.' },
        challenge: {
          cs: 'Každý teď řekněte jednu pravdivou věc, o které si myslíte, že ji ten druhý neví.',
          en: 'Each say one true thing you think the other doesn’t know, right now.',
        },
      },
    },
  },
];

export const stageById = (id) => STAGES.find((s) => s.id === id) || null;

export default STAGES;
