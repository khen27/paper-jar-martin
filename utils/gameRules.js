import { getLocalizedText } from './i18n';

// "How to play" content shown before every game (CS + EN; other languages fall back to EN).
const RULES = {
  partner: {
    emoji: '💞',
    steps: [
      { cs: 'Sedněte si naproti sobě a odložte ostatní obrazovky.', en: 'Sit facing each other and put other screens away.' },
      { cs: 'Střídejte se: jeden čte kartu nahlas, druhý odpovídá.', en: 'Take turns: one reads the card out loud, the other answers.' },
      { cs: 'Ptejte se „a proč?“ — nejlepší historky přijdou až po první odpovědi.', en: 'Ask “and why?” — the best stories come after the first answer.' },
      { cs: 'Karta nesedí? Klidně ji přeskočte, žádný stres.', en: 'Card doesn’t fit? Skip it, no stress.' },
    ],
  },
  friend: {
    emoji: '🍕',
    steps: [
      { cs: 'Telefon koluje dokola — kdo ho drží, čte kartu.', en: 'Pass the phone around — whoever holds it reads the card.' },
      { cs: 'Odpovídá čtenář, nebo vyberte, kdo odpoví.', en: 'The reader answers, or picks who answers.' },
      { cs: 'Ostatní můžou položit jednu doplňující otázku.', en: 'Everyone else gets one follow-up question.' },
      { cs: 'Výzvy plňte hned — potlesk je povinný.', en: 'Do dares right away — applause is mandatory.' },
    ],
  },
  party: {
    emoji: '🎉',
    steps: [
      { cs: 'Zadejte jména 2–8 hráčů.', en: 'Enter 2–8 player names.' },
      { cs: 'Appka řekne, komu podat telefon. Ten si kartu přečte nahlas.', en: 'The app says who gets the phone. They read the card out loud.' },
      { cs: 'Otázka = odpověz. Výzva = splň. Divoká karta = zapojí se všichni.', en: 'Question = answer. Dare = do it. Wild card = everyone joins in.' },
      { cs: 'Klepni na „Další hráč“ a pošli telefon dál.', en: 'Tap “Next player” and pass the phone on.' },
    ],
  },
  adult: {
    emoji: '🔥',
    steps: [
      { cs: 'Jen pro 18+ a jen se souhlasem všech u stolu.', en: '18+ only, and only with everyone’s consent.' },
      { cs: 'Pravda = odpověz upřímně. Výzva = splň. Trapas = náhradní úkol z karty.', en: 'Truth = answer honestly. Dare = do it. Cringe = the backup task on the card.' },
      { cs: 'Kdokoli může říct „pas“ — bez vysvětlování a bez posměchu.', en: 'Anyone can say “pass” — no explaining, no teasing.' },
      { cs: 'Co se řekne u hry, zůstane u hry.', en: 'What’s said in the game stays in the game.' },
    ],
  },
  workout: {
    emoji: '💪',
    steps: [
      { cs: 'Udělejte si místo a vezměte si vodu.', en: 'Make some space and grab water.' },
      { cs: 'Kdo drží telefon, čte kartu — výzvy můžete dělat všichni spolu.', en: 'Whoever holds the phone reads — you can all do the moves together.' },
      { cs: 'Tempo i počet opakování si upravte podle sebe. Bolest = stop.', en: 'Adjust pace and reps to your level. Pain = stop.' },
      { cs: 'Nechceš nebo nemůžeš cvik udělat? Slož někomu kompliment, nebo splň výzvu, kterou skupina vymyslí — tohle pravidlo si domluvte před začátkem hry.', en: 'Can’t or don’t want to do a move? Give someone a compliment or do a challenge set by the group — agree on that rule before you start.' },
      { cs: 'Každý splněný cvik si zaslouží potlesk.', en: 'Every finished move earns a round of applause.' },
    ],
  },
  brnoPrague: {
    emoji: '🍺',
    steps: [
      { cs: 'Rozdělte se na tým Brno a tým Praha (nebo hrajte každý sám za sebe).', en: 'Split into Team Brno and Team Prague (or play solo).' },
      { cs: 'Přečtěte kartu a obhajujte své město — s humorem.', en: 'Read the card and defend your city — with humour.' },
      { cs: 'Ostatní rozhodnou potleskem, kdo měl lepší argument.', en: 'Everyone else decides by applause who had the better argument.' },
      { cs: 'Na konci si oba týmy připijí na Česko. 🇨🇿', en: 'At the end both teams toast to Czechia. 🇨🇿' },
    ],
  },
  office: {
    emoji: '💼',
    steps: [
      { cs: 'Ideální na začátek porady, onboarding nebo teambuilding.', en: 'Great for meeting kick-offs, onboarding or team-building.' },
      { cs: 'Jedna karta na člověka, odpověď do jedné minuty.', en: 'One card per person, answer in under a minute.' },
      { cs: 'Nikdo nemusí sdílet nic osobního — „pas“ je vždy v pořádku.', en: 'No one has to share anything personal — “pass” is always fine.' },
      { cs: 'Cílem je se líp poznat, ne hodnotit.', en: 'The goal is getting to know each other, not judging.' },
    ],
  },
  homePack: {
    emoji: '⭐',
    steps: [
      { cs: 'Bonusové karty za instalaci — rychlé a pohodové.', en: 'Bonus cards for installing — quick and feel-good.' },
      { cs: 'Hrajte ve dvou nebo v partě, čtěte nahlas a odpovídejte.', en: 'Play as a pair or a group, read out loud and answer.' },
      { cs: 'Přejeďte kartu nebo klepněte na „Další karta“.', en: 'Swipe the card or tap “Next card”.' },
    ],
  },
  knowMe: {
    emoji: '🧠',
    steps: [
      { cs: 'Hráč A tajně vybere odpověď o sobě a podá telefon.', en: 'Player A secretly picks an answer about themselves and passes the phone.' },
      { cs: 'Hráč B hádá, co A vybral/a.', en: 'Player B guesses what A picked.' },
      { cs: 'Odhalte odpověď — za trefu je bod.', en: 'Reveal the answer — a match scores a point.' },
      { cs: 'Po 6 kolech uvidíte, jak moc jste sladění.', en: 'After 6 rounds you’ll see how in sync you are.' },
    ],
  },
  halloween: {
    emoji: '🎃',
    steps: [
      { cs: 'Ztlumte světla, zapněte strašidelnou playlistu a klidně si vezměte kostýmy.', en: 'Dim the lights, put on a spooky playlist, costumes welcome.' },
      { cs: 'Telefon koluje dokola — kdo ho drží, čte kartu nahlas (strašidelným hlasem bonus).', en: 'Pass the phone around — whoever holds it reads out loud (spooky voice is a bonus).' },
      { cs: 'Lekačky jen slovní: žádné skutečné strašení, které by někoho vyděsilo doopravdy.', en: 'Scares are words only: no real pranks that would actually frighten someone.' },
      { cs: 'Karta nesedí? „Bú!“ a jedete dál.', en: 'Card doesn’t fit? Say “Boo!” and move on.' },
    ],
  },
  autumn: {
    emoji: '🍂',
    steps: [
      { cs: 'Uvařte si něco teplého a udělejte si pohodlí.', en: 'Make something warm to drink and get comfy.' },
      { cs: 'Střídejte se ve čtení karet, odpovídat můžete všichni.', en: 'Take turns reading cards — everyone can answer.' },
      { cs: 'Tady se nespěchá: jedna dobrá historka je víc než deset rychlých odpovědí.', en: 'No rush: one good story beats ten quick answers.' },
    ],
  },
  christmas: {
    emoji: '🎄',
    steps: [
      { cs: 'Ideální po večeři nebo při zdobení stromku.', en: 'Perfect after dinner or while decorating the tree.' },
      { cs: 'Telefon koluje dokola, kdo ho drží, čte kartu nahlas.', en: 'Pass the phone around — whoever holds it reads out loud.' },
      { cs: 'Hrajte i s babičkou a dětmi — Klasika je pro všechny generace.', en: 'Play with grandma and the kids too — Classic works for every generation.' },
      { cs: 'Kdo zkazí vánoční náladu, zazpívá koledu. 🎶', en: 'Whoever ruins the festive mood sings a carol. 🎶' },
    ],
  },
  custom: {
    emoji: '✍️',
    steps: [
      { cs: 'Hrajete karty, které jste si napsali sami.', en: 'You’re playing cards you wrote yourselves.' },
      { cs: 'Čtěte nahlas, odpovídejte a plňte výzvy.', en: 'Read out loud, answer and do the dares.' },
      { cs: 'Nové karty přidáte kdykoli v sekci Vlastní karty.', en: 'Add new cards anytime in Your cards.' },
    ],
  },
};

const DRINKS_STEPS = [
  { cs: '🔞 Alkohol pijí jen lidé, kteří dosáhli zákonného věku pro pití alkoholu v zemi, kde právě hrajete. Všichni ostatní hrají s nealkem.', en: '🔞 Only people who are of legal drinking age where you are playing may drink alcohol. Everyone else plays with soft drinks.' },
  { cs: '🍻 Nechceš odpovídat nebo plnit? Napij se — a jede se dál.', en: '🍻 Don’t want to answer or do it? Take a sip — and move on.' },
  { cs: '🗳️ Hlasování: na „tři“ všichni ukážou na jednoho hráče. Karta řekne, kdo pije.', en: '🗳️ Votes: on “three” everyone points at one player. The card says who drinks.' },
  { cs: '🥤 Nealko se počítá stejně. Nikdo nemusí pít alkohol, pije se po malých locích a appka vám počítá loky.', en: '🥤 Soft drinks count just the same. No one has to drink alcohol, it’s small sips only, and the app keeps the sip tally.' },
];

const MUTE_TIP = {
  cs: 'Než začnete telefon půjčovat, zapněte režim Nerušit nebo ztlumte oznámení, ať nikomu nevyskočí soukromé zprávy.',
  en: 'Before you pass the phone around, turn on Do Not Disturb or mute notifications so no private messages pop up.',
};

const FUN_PACT = {
  cs: 'Hrajeme pro smích, ne pro výhru. Když se začnete dohadovat, dejte si high-five a vytáhněte další kartu. Kdo začne hádku, musí složit kompliment. 😄',
  en: 'We play for laughs, not to win. If you start bickering, high-five and draw the next card. Whoever starts an argument owes someone a compliment. 😄',
};

export const getGameRules = (mode, variant, language) => {
  const rules = RULES[mode] || RULES.partner;
  const steps = rules.steps.map((s) => getLocalizedText(s, language));
  const drinkSteps = variant === 'drinks' ? DRINKS_STEPS.map((s) => getLocalizedText(s, language)) : [];
  return {
    emoji: rules.emoji,
    steps,
    drinkSteps,
    funPact: getLocalizedText(FUN_PACT, language),
    muteTip: getLocalizedText(MUTE_TIP, language),
  };
};
