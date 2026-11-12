// "Why next-gen Talk Trap" — a standalone explainer page, deep-linked from
// Settings, written for Martin: why we pivoted, what it is, the outcome we want,
// how and why we learn, the revenue model, and the next steps. It can turn the
// experience on so he can try it immediately, or he can just read and decide.

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import FunIcon from '../components/FunIcon';
import { track } from '../utils/analytics';
import { loc, seasonPriceLabel, allSeasonsPriceLabel } from './seasons';
import {
  JC,
  useJourney,
  JourneyScaffold,
  JourneyChrome,
  Eyebrow,
  GlassPanel,
  JourneyButton,
  LinkText,
} from './ui';

// All copy localized inline so the narrative stays readable in one place.
const COPY = {
  en: {
    kicker: 'For Martin',
    title: 'Why we reimagined Talk Trap',
    lede:
      'The classic party game is great, but it is a one-night thing in a crowded space. This is a quieter, more premium idea built on the same engine: a 14-night journey that helps two people actually get closer — and that people will pay for.',
    sections: [
      {
        icon: 'handshake',
        label: 'The idea',
        title: 'Fourteen nights, one card at a time',
        body:
          'Each night is one real question plus one small thing to do together. Both of you answer, the night is saved to a shared album, and by night fourteen you can see what you know now that you did not on night one. The path starts where the couple actually is — just met, dating, living together, or years in — so the very first card already fits them.',
      },
      {
        icon: 'trophy',
        label: 'The outcome we want',
        title: 'Closeness that adds up',
        body:
          'Not a dopamine loop — a record. The album, the recap that quotes their own words, the little challenges they actually did. The goal is that after two weeks a couple feels measurably closer and has something to look back on. That is the thing worth paying for, and the thing a chatbot cannot hold for them.',
      },
      {
        icon: 'dice',
        label: 'How & why we learn',
        title: 'We listen before we build more',
        body:
          'Every night has a quiet thumbs rating — good, flat, too much — so we learn which questions land and which to cut. The landing page captures interest and a “would you pay” signal before we write a single extra season. We only invest in the paths people actually want.',
      },
      {
        icon: 'crown',
        label: 'The revenue model',
        title: 'Honest, one-time, no subscription',
        body:
          'Nights 1–7 are free, no account and no card. Unlocking the closer half of a season is a single payment. All seasons together is one larger payment, including the ones we write next. No ads, no subscription trap. If a couple misses a night, a “freeze” protects them a few times; after that a couple euros goes into their own date jar — never to us. It is a kinder nudge that fits the product.',
      },
      {
        icon: 'sparkles',
        label: 'What happens next',
        title: 'Validate, then write',
        body:
          'Ship the free nights and the landing page, watch the interest and would-pay signals, and use the thumbs data to tighten the questions. Write the next seasons for the stages people pick most. Wire real payments only once the demand is clear. Everything here is a working preview — no card is ever charged yet.',
      },
    ],
    priceLine: (s, a) => `Season unlock ${s} · All seasons ${a} · one-time, no subscription`,
    note:
      'This is your call too, Martin. If it resonates, turn it on and play a night with me. If not, say so — the classic game is untouched and nothing here is deleted.',
    tryOn: 'Turn it on & try a night',
    back: 'Back to settings',
  },
  cs: {
    kicker: 'Pro Martina',
    title: 'Proč jsme Talk Trap pojali znovu',
    lede:
      'Klasická párty hra je skvělá, ale je to záležitost na jeden večer v přeplněném trhu. Tohle je tišší, prémiovější nápad na stejném základu: čtrnáctivečerní cesta, která dvěma lidem opravdu pomůže si být blíž — a za kterou lidé zaplatí.',
    sections: [
      {
        icon: 'handshake',
        label: 'Nápad',
        title: 'Čtrnáct večerů, vždy jedna karta',
        body:
          'Každý večer je jedna opravdová otázka a jedna maličkost, kterou spolu uděláte. Odpovíte oba, večer se uloží do společného alba a čtrnáctý večer vidíte, co víte teď a první večer jste nevěděli. Cesta začíná tam, kde pár opravdu je — právě se poznali, randí, bydlí spolu nebo jsou roky spolu — takže už první karta sedí.',
      },
      {
        icon: 'trophy',
        label: 'Cíl, který chceme',
        title: 'Blízkost, která se nasčítá',
        body:
          'Ne dopaminová smyčka — záznam. Album, rekapitulace, která je cituje jejich vlastními slovy, malé výzvy, které opravdu udělali. Cílem je, aby se pár po dvou týdnech cítil znatelně blíž a měl se za čím ohlédnout. Za tohle stojí zaplatit — a tohle jim chatbot neudrží.',
      },
      {
        icon: 'dice',
        label: 'Jak a proč se učíme',
        title: 'Nasloucháme, než stavíme dál',
        body:
          'Každý večer má tiché hodnocení palcem — dobré, nemastné, moc — takže se učíme, které otázky sedí a které vyřadit. Úvodní stránka sbírá zájem a signál „zaplatil/a bych“ ještě předtím, než napíšeme jedinou další sezónu. Investujeme jen do cest, které lidé opravdu chtějí.',
      },
      {
        icon: 'crown',
        label: 'Model výdělku',
        title: 'Férově, jednorázově, bez předplatného',
        body:
          'Večery 1–7 jsou zdarma, bez účtu a bez karty. Odemknutí bližší půlky sezóny je jedna platba. Všechny sezóny dohromady jsou jedna větší platba, včetně těch, které teprve napíšeme. Žádné reklamy, žádná past předplatného. Když pár večer vynechá, pár „zmrazení“ ho párkrát ochrání; pak padnou dvě eura do jejich vlastní sklenice na rande — nikdy k nám. Je to laskavější pobídka, která k produktu sedí.',
      },
      {
        icon: 'sparkles',
        label: 'Co bude dál',
        title: 'Ověřit, pak psát',
        body:
          'Vydat večery zdarma a úvodní stránku, sledovat zájem a signál „zaplatil bych“ a podle palců ladit otázky. Napsat další sezóny pro fáze, které si lidé volí nejvíc. Skutečné platby napojit, až bude poptávka jasná. Všechno tady je funkční náhled — z karty se zatím nikdy nic nestrhává.',
      },
    ],
    priceLine: (s, a) => `Sezóna ${s} · Všechny sezóny ${a} · jednorázově, bez předplatného`,
    note:
      'Tohle je i tvoje rozhodnutí, Martine. Jestli to dává smysl, zapni to a zahraj si se mnou jeden večer. Jestli ne, řekni — klasická hra zůstává nedotčená a nic se tu nemaže.',
    tryOn: 'Zapnout a zkusit večer',
    back: 'Zpět do nastavení',
  },
};

const Section = ({ icon, label, title, body }) => (
  <GlassPanel style={styles.section}>
    <View style={styles.sectionHead}>
      <View style={styles.sectionIcon}>
        <FunIcon name={icon} size={38} />
      </View>
      <View style={styles.sectionHeadText}>
        <Eyebrow>{label}</Eyebrow>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    </View>
    <Text style={styles.sectionBody}>{body}</Text>
  </GlassPanel>
);

const JourneyIntroScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { updateSettings } = useSettings();
  const { type, heroSplit } = useJourney();
  const c = COPY[language] || COPY.en;

  useEffect(() => {
    track('journey_intro_viewed');
  }, []);

  const tryItOn = async () => {
    track('journey_intro_try_on');
    await updateSettings({ nextGen: true });
    navigation.navigate('Home');
  };

  const hero = (
    <View style={[styles.hero, heroSplit ? styles.left : styles.center]}>
      <View style={styles.heroIcon}>
        <FunIcon name="gift" size={heroSplit ? 92 : 68} />
      </View>
      <Eyebrow>{c.kicker}</Eyebrow>
      <Text
        style={[
          styles.title,
          { fontSize: type.hero, lineHeight: Math.round(type.hero * 1.1) },
          heroSplit ? styles.tLeft : styles.tCenter,
        ]}
      >
        {c.title}
      </Text>
      <Text style={[styles.lede, { fontSize: type.body }, heroSplit ? styles.tLeft : styles.tCenter]}>
        {c.lede}
      </Text>
    </View>
  );

  return (
    <JourneyScaffold chrome={<JourneyChrome onBack={() => navigation.goBack()} />} hero={hero}>
      {c.sections.map((s) => (
        <Section key={s.label} {...s} />
      ))}

      <GlassPanel tone="gold" style={styles.priceCard}>
        <Text style={styles.priceText}>
          {c.priceLine(seasonPriceLabel(language), allSeasonsPriceLabel(language))}
        </Text>
      </GlassPanel>

      <Text style={styles.note}>{c.note}</Text>

      <JourneyButton icon="sparkles" title={c.tryOn} onPress={tryItOn} variant="primary" style={styles.cta} />
      <View style={styles.backWrap}>
        <LinkText onPress={() => navigation.goBack()}>{c.back}</LinkText>
      </View>
    </JourneyScaffold>
  );
};

const styles = StyleSheet.create({
  hero: { width: '100%' },
  left: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  tLeft: { textAlign: 'left' },
  tCenter: { textAlign: 'center' },
  heroIcon: { marginBottom: 14 },
  title: { color: JC.onDark, fontWeight: '900', marginTop: 10, letterSpacing: 0.2 },
  lede: { color: JC.onDarkSoft, fontWeight: '600', marginTop: 14, lineHeight: 24, maxWidth: 520 },

  section: { marginBottom: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center' },
  sectionIcon: { marginRight: 12 },
  sectionHeadText: { flex: 1 },
  sectionTitle: { color: JC.onDark, fontWeight: '900', fontSize: 18, marginTop: 4 },
  sectionBody: { color: JC.onDarkSoft, fontWeight: '600', fontSize: 14.5, lineHeight: 22, marginTop: 12 },

  priceCard: { marginBottom: 16, alignItems: 'center' },
  priceText: { color: JC.onDark, fontWeight: '800', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  note: {
    color: JC.onDarkFaint,
    fontWeight: '600',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
    maxWidth: 520,
    alignSelf: 'center',
  },
  cta: { width: '100%' },
  backWrap: { marginTop: 14, alignItems: 'center' },
});

export default JourneyIntroScreen;
