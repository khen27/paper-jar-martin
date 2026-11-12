// Season: Stay close — for couples who live together or have been together for years.
// Teaser: nights 1-3 are playable games; 4-14 are locked with teases.

export const stayCloseSeason = {
  id: "stayClose",
  icon: "handshake",
  title: { cs: "Zůstat blízko", en: "Stay close" },
  tagline: {
    cs: "Pro dva, kteří už jsou tým — a chtějí jím zůstat.",
    en: "For two people who are already a team — and want to stay one.",
  },
  freeNights: 3,
  nights: [
    {
      phase: "life",
      type: "pick",
      q: {
        cs: "Co ti chybí z dřívějška nás dvou, co bychom mohli vrátit?",
        en: "What do you miss from earlier in us that we could bring back?",
      },
      options: [
        { cs: "Zbytečné rande", en: "A pointless date" },
        { cs: "Pozdní řeči", en: "Late talks" },
        { cs: "Hloupé hry", en: "Silly games" },
        { cs: "Čas bez telefonu", en: "Phone-free time" },
      ],
      alt: {
        type: "do",
        q: { cs: "Jednu věc vraťte.", en: "Put one thing back." },
        challenge: {
          cs: "Vyberte jednu věc z dřívějška a tento týden ji vraťte. Zapište, kdy.",
          en: "Pick one thing from earlier in us and put it back this week. Write down when.",
        },
      },
    },
    {
      phase: "closer",
      type: "guess",
      q: {
        cs: "Co dělám ve stresu, co už jsi se naučil/a obcházet?",
        en: "What do I do when I am stressed that you have learned to work around?",
      },
      options: [
        { cs: "Ztiším se", en: "I go quiet" },
        { cs: "Ukízím nebo kutilím", en: "I tidy or fix" },
        { cs: "Jsem ostrý/á", en: "I get sharp" },
        { cs: "Dělám vtipy", en: "I joke" },
      ],
      alt: {
        type: "talk",
        q: {
          cs: "Řekni to bez opravování. Druhý jen řekne, jestli to sedlo.",
          en: "Say it without fixing it. The other only says whether it landed.",
        },
      },
    },
    {
      phase: "closer",
      type: "pick",
      q: {
        cs: "Kde to mezi námi tiše houstne kolem peněz, i když jsme jinak v pohodě?",
        en: "Where does money quietly get tense between us, even when we are otherwise fine?",
      },
      options: [
        { cs: "Jistota", en: "Security" },
        { cs: "Svoboda", en: "Freedom" },
        { cs: "Férovost", en: "Fairness" },
        { cs: "Strach", en: "Fear" },
      ],
      alt: {
        type: "talk",
        q: {
          cs: "Každý pojmenujte jen ten pocit — a tam se zastavte.",
          en: "Each name only the feeling under it — and stop there.",
        },
      },
    },
    { comingSoon: true, phase: "closer", type: "guess", tease: { cs: "Co ti na mně pořád dokáže udělat radost?", en: "What about me can still delight you?" } },
    { comingSoon: true, phase: "closer", type: "talk", tease: { cs: "Kdy ses naposledy cítil/a mnou doopravdy vyslyšený/á?", en: "When did you last feel truly heard by me?" } },
    { comingSoon: true, phase: "closer", type: "pick", tease: { cs: "Co ještě chceš a nechceš to zakřiknout?", en: "What do you still want and do not want to jinx?" } },
    { comingSoon: true, phase: "closer", type: "do" },
    { comingSoon: true, phase: "closer", type: "guess" },
    { comingSoon: true, phase: "closer", type: "pick" },
    { comingSoon: true, phase: "closer", type: "talk" },
    { comingSoon: true, phase: "closer", type: "do" },
    { comingSoon: true, phase: "closer", type: "guess" },
    { comingSoon: true, phase: "closer", type: "pick" },
    { comingSoon: true, phase: "recap", type: "talk" },
  ],
};

export default stayCloseSeason;
