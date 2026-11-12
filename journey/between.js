// Between seasons: lighter twice-a-week cards. Mix of Pick and Talk so the
// album keeps growing without a full season night.

export const betweenCards = [
  {
    type: 'pick',
    q: { cs: 'Jakých deset minut bylo tenhle týden nejlepších?', en: 'The best ten minutes of your week were…' },
    options: [
      { cs: 'Ráno', en: 'Morning' },
      { cs: 'Cesta / venku', en: 'In transit / outside' },
      { cs: 'Večer spolu', en: 'Evening together' },
      { cs: 'Úplně sám/sama', en: 'Fully alone' },
    ],
  },
  {
    type: 'guess',
    q: {
      cs: 'Co jsem poslední dobou udělal/a, co pomohlo víc, než asi tuším?',
      en: 'What’s one thing I did lately that helped more than I probably know?',
    },
    options: [
      { cs: 'Převzal/a úkol', en: 'Took a task' },
      { cs: 'Nechal/a mě být', en: 'Left me be' },
      { cs: 'Napsal/a / zavolal/a', en: 'Texted / called' },
      { cs: 'Uvařil/a / uklidil/a', en: 'Cooked / tidied' },
    ],
  },
  {
    type: 'pick',
    q: { cs: 'Kdyby dnešní večer měl o hodinu navíc…', en: 'If tonight had one more free hour…' },
    options: [
      { cs: 'Nic, ležet', en: 'Nothing, lie down' },
      { cs: 'Jít ven', en: 'Go out' },
      { cs: 'Vařit / film', en: 'Cook / a film' },
      { cs: 'Mluvit', en: 'Talk' },
    ],
  },
  {
    type: 'talk',
    q: { cs: 'Na jakou maličkost se právě teď těšíš?', en: 'What is something small you are looking forward to?' },
  },
  {
    type: 'pick',
    q: { cs: 'Který náš zvyk by přátelům přišel nejdivnější?', en: 'Which habit of ours would friends find weirdest?' },
    options: [
      { cs: 'Jídlo', en: 'Food' },
      { cs: 'Spánek', en: 'Sleep' },
      { cs: 'Vnitřní vtipy', en: 'Inside jokes' },
      { cs: 'Jak se hádáme', en: 'How we argue' },
    ],
  },
  {
    type: 'talk',
    q: { cs: 'Co jsi mi tenhle týden skoro řekl/a — a pak ne?', en: 'What did you almost tell me this week and then didn’t?' },
  },
  {
    type: 'do',
    q: { cs: 'Uvařit, zarezervovat, nebo zrušit.', en: 'Cook, book, or cancel.' },
    challenge: {
      cs: 'Teď se dohodněte na jedné věci tento měsíc: uvařit, zarezervovat, nebo zrušit. Zapište ji.',
      en: 'Agree on one thing this month: cook, book, or cancel. Write it down now.',
    },
  },
  {
    type: 'guess',
    q: { cs: 'Jaký kompliment tě nikdy neomrzí?', en: 'What compliment do you never get tired of hearing?' },
    options: [
      { cs: 'Že jsem vtipný/á', en: 'That I’m funny' },
      { cs: 'Že vypadám dobře', en: 'That I look good' },
      { cs: 'Že to zvládám', en: 'That I’ve got this' },
      { cs: 'Že jsem hodný/á', en: 'That I’m kind' },
    ],
  },
];

export default betweenCards;
