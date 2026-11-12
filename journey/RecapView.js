// Night 14 recap: a scorecard (matches, same picks, dares done), then a couple
// of keepers from the album — not a quote dump.

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import FunIcon from '../components/FunIcon';
import { jt } from './strings';
import { SEASONS, loc, nextSeasonId, seasonPriceLabel, allSeasonsPriceLabel } from './seasons';
import { ownsSeason, displayName } from './store';
import { seasonStats } from './mechanics';
import { track } from '../utils/analytics';
import { JC, useJourney, JourneyScaffold, Eyebrow, GlassPanel, JourneyButton, LinkText } from './ui';

const Stat = ({ icon, value, label }) => (
  <View style={styles.stat}>
    <FunIcon name={icon} size={28} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const RecapView = ({ chrome, journey, seasonId, onStartNextSeason, onBuyNextSeason, onBuyAll }) => {
  const { language } = useLanguage();
  const { type, heroSplit } = useJourney();
  const t = (key) => jt(language, key);
  const season = SEASONS[seasonId];
  const answers = journey.answers?.[seasonId] || {};
  const stats = seasonStats(answers);
  const whoA = displayName(journey, 'a', t('tonightPartnerA'), t('tonightPartnerB'));
  const whoB = displayName(journey, 'b', t('tonightPartnerA'), t('tonightPartnerB'));

  useEffect(() => {
    track('journey_recap_viewed', { seasonId });
  }, []);

  const keepers = Object.entries(answers)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, e]) => e)
    .filter((e) => e.type === 'talk' ? (e.a || e.b) : (e.aText || e.bText || e.a || e.b))
    .filter((_, i, arr) => i === 0 || i === Math.floor(arr.length / 2) || i === arr.length - 1)
    .slice(0, 3);

  const nextId = nextSeasonId(seasonId);
  const nextSeason = nextId ? SEASONS[nextId] : null;
  const nextOwned = nextId ? ownsSeason(journey, nextId) : false;
  const nextCompleted = nextId ? (journey.completedSeasons || []).includes(nextId) : true;

  const hero = (
    <View style={[styles.hero, heroSplit ? styles.left : styles.center]}>
      <FunIcon name="trophy" size={heroSplit ? 88 : 64} />
      <Eyebrow>{loc(season.title, language)}</Eyebrow>
      <Text style={[styles.title, { fontSize: type.title }, heroSplit ? styles.tLeft : styles.tCenter]}>
        {t('recapTitle')}
      </Text>
      <Text style={[styles.sub, heroSplit ? styles.tLeft : styles.tCenter]}>{t('recapSub')}</Text>
    </View>
  );

  return (
    <JourneyScaffold chrome={chrome} hero={hero}>
      <View style={styles.poster}>
        <Text style={styles.posterLine}>
          {stats.nights} {t('recapShareLine').split('·')[0].trim()}
        </Text>
        <View style={styles.statRow}>
          <Stat icon="knowMe" value={`${stats.matches}/${stats.guesses || 0}`} label={t('recapMindRead')} />
          <Stat icon="handshake" value={`${stats.same}/${stats.picks || 0}`} label={t('recapSamePick')} />
          <Stat icon="trophy" value={`${stats.daresDone}/${stats.dares || 0}`} label={t('recapDaresDone')} />
        </View>
      </View>

      {keepers.map((e, i) => (
        <View key={i} style={styles.quoteCard}>
          <Text style={styles.quoteLabel}>{e.type === 'guess' && e.match ? t('tonightMatch') : e.type === 'pick' && e.same ? t('tonightSame') : e.qText || t('albumNight')}</Text>
          {!!e.qText && <Text style={styles.quoteQuestion}>{e.qText}</Text>}
          <Text style={styles.quoteText}>
            <Text style={styles.quoteWho}>{whoA}: </Text>
            {e.aText || e.a || '—'}
          </Text>
          <Text style={styles.quoteText}>
            <Text style={styles.quoteWho}>{whoB}: </Text>
            {e.bText || e.b || '—'}
          </Text>
        </View>
      ))}

      <GlassPanel style={styles.offerCard}>
        <FunIcon name="sparkles" size={36} style={styles.offerIcon} />
        <View style={styles.offerTextWrap}>
          <Text style={styles.offerTitle}>{t('recapKeepGoing')}</Text>
          <Text style={styles.offerSub}>{t('recapKeepGoingSub')}</Text>
        </View>
      </GlassPanel>

      {nextSeason && !nextCompleted && (
        <>
          <GlassPanel style={styles.offerCard}>
            <FunIcon name={nextSeason.icon} size={36} style={styles.offerIcon} />
            <View style={styles.offerTextWrap}>
              <Text style={styles.offerTitle}>
                {loc(nextSeason.title, language)} · {t('recapNextSeason')}
              </Text>
              <Text style={styles.offerSub}>{loc(nextSeason.tagline, language)}</Text>
            </View>
          </GlassPanel>
          <JourneyButton
            title={
              nextOwned
                ? `${t('homeStartSeason')}: ${loc(nextSeason.title, language)}  →`
                : `${loc(nextSeason.title, language)} · ${seasonPriceLabel(language)}`
            }
            onPress={() => (nextOwned ? onStartNextSeason(nextId) : onBuyNextSeason(nextId))}
            variant="primary"
            style={styles.cta}
          />
        </>
      )}

      {!journey.ownsAll && (
        <View style={styles.allLink}>
          <LinkText onPress={onBuyAll} style={styles.allLinkText}>
            {t('paywallAllSeasons')} · {allSeasonsPriceLabel(language)} ({t('paywallOneTime')})
          </LinkText>
        </View>
      )}
    </JourneyScaffold>
  );
};

const styles = StyleSheet.create({
  hero: { width: '100%' },
  left: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  tLeft: { textAlign: 'left' },
  tCenter: { textAlign: 'center' },
  title: { color: JC.onDark, fontWeight: '900', marginTop: 10 },
  sub: { color: JC.onDarkSoft, fontWeight: '700', fontSize: 14, marginTop: 8, lineHeight: 20, maxWidth: 420 },
  poster: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  posterLine: { color: JC.ink, fontWeight: '900', fontSize: 18, textAlign: 'center', marginBottom: 14 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flex: 1 },
  statEmoji: { fontSize: 22 },
  statValue: { color: JC.ink, fontWeight: '900', fontSize: 22, marginTop: 4 },
  statLabel: { color: JC.inkSoft, fontWeight: '700', fontSize: 11, marginTop: 2, textAlign: 'center' },
  quoteCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  quoteLabel: { color: JC.accent, fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  quoteQuestion: { color: 'rgba(34,22,63,0.6)', fontSize: 13, fontWeight: '700', marginTop: 6, lineHeight: 18 },
  quoteText: { color: JC.ink, fontSize: 14, fontWeight: '600', lineHeight: 21, marginTop: 8 },
  quoteWho: { fontWeight: '900', color: 'rgba(34,22,63,0.55)' },
  offerCard: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 12 },
  offerIcon: { marginRight: 12 },
  offerTextWrap: { flex: 1 },
  offerTitle: { color: JC.onDark, fontWeight: '900', fontSize: 15 },
  offerSub: { color: JC.onDarkFaint, fontWeight: '600', fontSize: 13, marginTop: 3, lineHeight: 18 },
  cta: { width: '100%', marginTop: 2 },
  allLink: { marginTop: 18, alignItems: 'center' },
  allLinkText: { color: JC.gold },
});

export default RecapView;
