// Season: Just us — for couples who just met or are dating.
// 14 nights. Each night is a Guess, Pick, Dare, or Talk, plus an alt card
// so they can choose one. Night 1 is overridden per stage (see stages.js).

const vibeAlt = {
  type: 'pick',
  q: { cs: 'Co dnes večer chceme?', en: 'What do we want tonight?' },
  options: [
    { cs: 'Zasmát se', en: 'A laugh' },
    { cs: 'Něco pravdivého', en: 'Something true' },
    { cs: 'Výzvu', en: 'A dare' },
    { cs: 'Jen v klidu', en: 'Keep it easy' },
  ],
};

export const justUsSeason = {
  id: 'justUs',
  icon: 'cheers',
  title: { cs: 'Jen my dva', en: 'Just us' },
  tagline: {
    cs: 'Od lehkých začátků k otázkám, na které sami jen tak nenarazíte.',
    en: 'From easy beginnings to the questions you don’t stumble into on your own.',
  },
  freeNights: 7,
  nights: [
    {
      phase: 'play',
      type: 'guess',
      q: {
        cs: 'Jaká maličkost ti dokáže okamžitě zlepšit den?',
        en: 'What small thing instantly makes your day feel good?',
      },
      options: [
        { cs: 'Jídlo / kafe', en: 'Food / coffee' },
        { cs: 'Zpráva od někoho', en: 'A message from someone' },
        { cs: 'Ticho a žádný plán', en: 'Quiet and no plans' },
        { cs: 'Pohyb / venku', en: 'Moving / outside' },
      ],
      alt: vibeAlt,
    },
    {
      phase: 'play',
      type: 'do',
      q: { cs: 'Fotka vás do deseti let.', en: 'A photo of you under the age of ten.' },
      challenge: {
        cs: 'Každý teď ukažte jednu fotku sebe jako dítě. Jedna věta k tomu.',
        en: 'Each show a photo of you as a kid, right now. One sentence with it.',
      },
      alt: {
        type: 'guess',
        q: { cs: 'Jaké dítě jsi byl/a?', en: 'What kind of kid were you?' },
        options: [
          { cs: 'Divoké', en: 'Wild' },
          { cs: 'Tiché / knížky', en: 'Quiet / books' },
          { cs: 'Klaun party', en: 'The class clown' },
          { cs: 'Šéf smečky', en: 'In charge' },
        ],
      },
    },
    {
      phase: 'play',
      type: 'pick',
      q: { cs: 'Jaký příběh tě kamarádi pořád nutí vyprávět?', en: 'The story friends always make you tell is…' },
      options: [
        { cs: 'Trapas', en: 'Embarrassing' },
        { cs: 'Hrdinský', en: 'Impressive' },
        { cs: 'Divný', en: 'Weird' },
        { cs: 'Sladký', en: 'Sweet' },
      ],
      alt: {
        type: 'talk',
        q: { cs: 'Řekni teď tu krátkou verzi.', en: 'Tell the short version now.' },
      },
    },
    {
      phase: 'play',
      type: 'guess',
      q: {
        cs: 'Co ti přijde krásné, i když to většina lidí mine?',
        en: 'What do you find beautiful that most people walk right past?',
      },
      options: [
        { cs: 'Světlo / obloha', en: 'Light / sky' },
        { cs: 'Lidi, když o tom neví', en: 'People when they don’t know' },
        { cs: 'Detaily v místnosti', en: 'Details in a room' },
        { cs: 'Zvuky', en: 'Sounds' },
      ],
      alt: {
        type: 'do',
        q: { cs: 'Najděte jednu takovou věc.', en: 'Find one of those things.' },
        challenge: {
          cs: 'Teď se rozhlédněte. Každý ukažte na jednu věc, která je krásná a ostatní ji mine.',
          en: 'Look around now. Each point at one beautiful thing other people would miss.',
        },
      },
    },
    {
      phase: 'life',
      type: 'pick',
      q: { cs: 'Obyčejný den, který by sis zopakoval/a, vypadá jako…', en: 'An ordinary day you’d happily repeat looks like…' },
      options: [
        { cs: 'Vyspat se + nic', en: 'Sleep in + nothing' },
        { cs: 'Procházka', en: 'A walk' },
        { cs: 'Vařit spolu', en: 'Cooking together' },
        { cs: 'Město / lidi', en: 'Town / people' },
      ],
      alt: {
        type: 'do',
        q: { cs: 'Půjčte si z něj hodinu.', en: 'Borrow an hour from it.' },
        challenge: {
          cs: 'Teď si do kalendáře dejte jednu hodinu v příštích dvou týdnech, která z toho dne něco ukradne.',
          en: 'Put one hour in the next two weeks on a calendar that steals from that day.',
        },
      },
    },
    {
      phase: 'life',
      type: 'guess',
      q: { cs: 'Kdy se cítíš nejvíc sám/sama sebou?', en: 'When do you feel most like yourself?' },
      options: [
        { cs: 'S jedním člověkem', en: 'With one person' },
        { cs: 'Sám/sama', en: 'Alone' },
        { cs: 'V partě', en: 'In a group' },
        { cs: 'U práce rukama', en: 'Making something' },
      ],
      alt: {
        type: 'pick',
        q: { cs: 'U lidí, kterým věříš, přestaneš hrát…', en: 'Around people you trust, you stop performing…' },
        options: [
          { cs: 'Vtipy', en: 'The jokes' },
          { cs: 'Kompetenci', en: 'Competence' },
          { cs: 'Pohodu', en: 'Being chill' },
          { cs: 'Šarm', en: 'Charm' },
        ],
      },
    },
    {
      phase: 'life',
      type: 'talk',
      q: {
        cs: 'Co tě baví, ale skoro o tom nemluvíš, protože čekáš, že to nikoho nezajímá?',
        en: 'What are you into that you rarely mention because you assume people won’t care?',
      },
      alt: {
        type: 'do',
        q: { cs: 'Dvě minuty. Druhý se smí jen ptát.', en: 'Two minutes. The other only asks questions.' },
        challenge: {
          cs: 'Jeden mluví dvě minuty o své „divné“ věci. Druhý se smí jen ptát. Pak si vyměňte.',
          en: 'One person talks for two minutes about their “weird” thing. The other only asks questions. Then swap.',
        },
      },
    },
    {
      phase: 'closer',
      type: 'pick',
      q: { cs: 'Po těžkém dni potřebuješ…', en: 'On a hard day you need…' },
      options: [
        { cs: 'Společnost', en: 'Company' },
        { cs: 'Klid', en: 'Quiet' },
        { cs: 'Vtip', en: 'A joke' },
        { cs: 'Plán', en: 'A plan' },
      ],
      alt: {
        type: 'guess',
        q: { cs: 'Po těžkém dni potřebuješ…', en: 'On a hard day you need…' },
        options: [
          { cs: 'Společnost', en: 'Company' },
          { cs: 'Klid', en: 'Quiet' },
          { cs: 'Vtip', en: 'A joke' },
          { cs: 'Plán', en: 'A plan' },
        ],
      },
    },
    {
      phase: 'closer',
      type: 'talk',
      q: {
        cs: 'Kdo tě naučil, co od lidí čekat — k lepšímu i k horšímu?',
        en: 'Who taught you what to expect from people, for better or worse?',
      },
      alt: {
        type: 'pick',
        q: { cs: 'Nejvíc mě v tomhle naučil…', en: 'The person who taught me most was…' },
        options: [
          { cs: 'Rodina', en: 'Family' },
          { cs: 'Kamarád', en: 'A friend' },
          { cs: 'Bývalý vztah', en: 'An ex' },
          { cs: 'Já sám/sama', en: 'Myself' },
        ],
      },
    },
    {
      phase: 'closer',
      type: 'guess',
      q: {
        cs: 'K čemu potichu směřuješ, co nemá nic společného s prací?',
        en: 'What are you quietly working toward that has nothing to do with work?',
      },
      options: [
        { cs: 'Dovednost', en: 'A skill' },
        { cs: 'Cesta', en: 'A trip' },
        { cs: 'Jiná verze mě', en: 'A version of me' },
        { cs: 'Zatím to neřeknu', en: 'Not saying yet' },
      ],
      alt: {
        type: 'talk',
        q: {
          cs: 'Řekni další malý krok — a jestli u něj chceš společnost.',
          en: 'Say the next small step, and whether you want company for it.',
        },
      },
    },
    {
      phase: 'closer',
      type: 'pick',
      q: { cs: 'Když něco není v pořádku, na tobě to jde vidět jako…', en: 'When something’s wrong, it shows on you as…' },
      options: [
        { cs: 'Ticho', en: 'Going quiet' },
        { cs: 'Ostrost', en: 'Getting sharp' },
        { cs: 'Přehnaná práce', en: 'Getting busy' },
        { cs: 'Vtipy', en: 'Jokes' },
      ],
      alt: {
        type: 'do',
        q: { cs: 'Jeden signál místo hádání.', en: 'One signal instead of guessing.' },
        challenge: {
          cs: 'Domluvte si teď jeden signál, kterému může druhý věřit, když něco není v pořádku. Řekněte ho nahlas.',
          en: 'Agree on one signal the other can trust when something’s wrong. Say it out loud.',
        },
      },
    },
    {
      phase: 'closer',
      type: 'pick',
      q: { cs: 'Letos chci víc…', en: 'This year I want more…' },
      options: [
        { cs: 'Odpočinku', en: 'Rest' },
        { cs: 'Lidí', en: 'People' },
        { cs: 'Tvoření', en: 'Making things' },
        { cs: 'Dobrodružství', en: 'Adventure' },
      ],
      alt: {
        type: 'guess',
        q: { cs: 'Letos chceš víc…', en: 'This year you want more…' },
        options: [
          { cs: 'Odpočinku', en: 'Rest' },
          { cs: 'Lidí', en: 'People' },
          { cs: 'Tvoření', en: 'Making things' },
          { cs: 'Dobrodružství', en: 'Adventure' },
        ],
      },
    },
    {
      phase: 'closer',
      type: 'guess',
      q: {
        cs: 'Z čeho máš pocit, že si tě někdo vybral — obyčejně, bez velkých gest?',
        en: 'What makes you feel chosen, in a small ordinary way?',
      },
      options: [
        { cs: 'Že mě někdo poslouchá', en: 'Being listened to' },
        { cs: 'Že si mě někdo všimne v maličkosti', en: 'Being noticed in a small thing' },
        { cs: 'Čas jen pro nás', en: 'Time that’s just ours' },
        { cs: 'Že mě někdo obhájí', en: 'Being backed up' },
      ],
      alt: {
        type: 'do',
        q: { cs: 'Jednu z těch věcí udělejte.', en: 'Do one of those things.' },
        challenge: {
          cs: 'Každý jmenujte jednu maličkost, která druhému dává pocit, že ho někdo vybral — a jednu z nich udělejte do zítřka.',
          en: 'Each name one small thing that makes the other feel chosen — and do one of them by tomorrow.',
        },
      },
    },
    {
      phase: 'recap',
      type: 'talk',
      q: {
        cs: 'Co o sobě teď víte, co jste před dvěma týdny nevěděli?',
        en: 'What do you understand about each other now that you didn’t two weeks ago?',
      },
      alt: {
        type: 'do',
        q: { cs: 'Skutečné rande do kalendáře.', en: 'A real date on the calendar.' },
        challenge: {
          cs: 'Naplánujte jedno rande podle něčeho z těch 14 večerů a dejte ho do kalendáře — teď.',
          en: 'Plan one real date using something from these 14 nights, and put it on a calendar — now.',
        },
      },
    },
  ],
};

export default justUsSeason;
