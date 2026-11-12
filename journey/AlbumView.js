// The album: every finished night with both answers, future nights dimmed,
// and nights behind the one-time unlock shown locked. Tapping a locked night
// opens the paywall. Night 1 reflects the couple's chosen stage opener.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import FunIcon from '../components/FunIcon';
import { jt } from './strings';
import { SEASONS, loc, getNight } from './seasons';
import { nightLocked, displayName } from './store';
import { typeLabel, typeIcon } from './mechanics';
import { JC, JourneyScaffold, Eyebrow } from './ui';

const AlbumView = ({ chrome, journey, seasonId, onLockedTap, onBack }) => {
  const { language } = useLanguage();
  const t = (key) => jt(language, key);
  const season = SEASONS[seasonId];
  const answers = journey.answers?.[seasonId] || {};
  const doneCount = Object.keys(answers).length;
  const whoA = displayName(journey, 'a', t('tonightPartnerA'), t('tonightPartnerB'));
  const whoB = displayName(journey, 'b', t('tonightPartnerA'), t('tonightPartnerB'));

  const hero = (
    <View style={styles.hero}>
      <Eyebrow>{loc(season.title, language)}</Eyebrow>
      <Text style={styles.title}>{t('albumTitle')}</Text>
      <Text style={styles.sub}>{t('albumSub')}</Text>
    </View>
  );

  return (
    <JourneyScaffold chrome={chrome} hero={hero}>
      {doneCount === 0 && <Text style={styles.empty}>{t('albumEmpty')}</Text>}

      {season.nights.map((raw, i) => {
        const night = getNight(seasonId, journey.stage, i) || raw;
        const entry = answers[i];
        const locked = nightLocked(journey, seasonId, i);

        if (entry) {
          const kind = entry.type || night.type;
          const stamp =
            kind === 'guess' ? (entry.match ? t('tonightMatch') : t('tonightMiss'))
              : kind === 'pick' ? (entry.same ? t('tonightSame') : t('tonightSplit'))
                : kind === 'do' ? (entry.challengeStatus === 'done' ? t('tonightDareDone') : entry.challengeStatus === 'later' ? t('tonightDareLater') : t('tonightDareSkip'))
                  : '';
          return (
            <View key={i} style={styles.nightCard}>
              <View style={styles.nightLabelRow}>
                <FunIcon name={typeIcon(kind)} size={16} />
                <Text style={styles.nightLabel}>
                  {typeLabel(kind, language)} · {t('albumNight')} {i + 1}
                  {stamp ? ` · ${stamp}` : ''}
                </Text>
              </View>
              <Text style={styles.question}>{entry.qText || loc(night.q, language)}</Text>
              <View style={styles.answerBlock}>
                <Text style={styles.answerWho}>{whoA}</Text>
                <Text style={styles.answerText}>{entry.aText || entry.a || '—'}</Text>
              </View>
              <View style={styles.answerBlock}>
                <Text style={styles.answerWho}>{whoB}</Text>
                <Text style={styles.answerText}>{entry.bText || entry.b || '—'}</Text>
              </View>
            </View>
          );
        }

        if (locked) {
          return (
            <Pressable key={i} onPress={onLockedTap} style={styles.lockedRow} accessibilityRole="button">
              <FunIcon name="lock" size={22} style={styles.lockIcon} />
              <View style={styles.lockedTextWrap}>
                <Text style={styles.lockedLabel}>{t('albumNight')} {i + 1}</Text>
                <Text style={styles.lockedSub}>
                  {raw.tease ? `„${loc(raw.tease, language)}“` : t('albumLockedNight')}
                </Text>
              </View>
              <Text style={styles.lockChevron}>›</Text>
            </Pressable>
          );
        }

        return (
          <View key={i} style={styles.futureRow}>
            <Text style={styles.futureLabel}>{t('albumNight')} {i + 1}</Text>
          </View>
        );
      })}
    </JourneyScaffold>
  );
};

const styles = StyleSheet.create({
  hero: { width: '100%' },
  title: { color: JC.onDark, fontSize: 28, fontWeight: '900', marginTop: 8 },
  sub: { color: JC.onDarkSoft, fontWeight: '700', fontSize: 14, marginTop: 4 },
  empty: { color: JC.onDarkSoft, fontWeight: '700', fontSize: 15, marginBottom: 10 },
  nightCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  nightLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nightLabel: { color: JC.accent, fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  question: { color: JC.ink, fontSize: 16, fontWeight: '800', lineHeight: 22, marginTop: 6 },
  answerBlock: { marginTop: 12 },
  answerWho: { color: 'rgba(34,22,63,0.5)', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  answerText: { color: JC.ink, fontSize: 14, fontWeight: '600', lineHeight: 20, marginTop: 3 },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  lockIcon: { marginRight: 12 },
  lockedTextWrap: { flex: 1 },
  lockedLabel: { color: JC.onDark, fontWeight: '800', fontSize: 14 },
  lockedSub: { color: JC.onDarkFaint, fontWeight: '600', fontSize: 13, marginTop: 2 },
  lockChevron: { color: JC.onDarkFaint, fontSize: 22, fontWeight: '800', marginLeft: 6 },
  futureRow: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  futureLabel: { color: 'rgba(255,255,255,0.45)', fontWeight: '800', fontSize: 14 },
});

export default AlbumView;
