// Tonight: Guess / Pick / Dare / Talk. Hidden until both have played, then a
// reveal. Optional second card. Writing is optional glue, not the game.

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import FunIcon from '../components/FunIcon';
import ConfettiBurst from '../components/ConfettiBurst';
import { AppDialog } from '../components/ui';
import { jt } from './strings';
import { loc, bandForPhase } from './seasons';
import { typeLabel, typeHint, typeIcon, locOpt, guessHider } from './mechanics';
import { track } from '../utils/analytics';
import {
  JC,
  JourneyScaffold,
  Eyebrow,
  PlayingCard,
  CardQuestion,
  CardChallenge,
  JourneyButton,
  LinkText,
} from './ui';

const OptionList = ({ options, language, selected, onSelect }) => (
  <View style={styles.opts}>
    {(options || []).map((opt, i) => {
      const on = selected === i;
      return (
        <Pressable
          key={i}
          onPress={() => onSelect(i)}
          style={[styles.opt, on && styles.optOn]}
          accessibilityRole="radio"
          accessibilityState={{ checked: on }}
        >
          <Text style={[styles.optText, on && styles.optTextOn]}>{locOpt(opt, language)}</Text>
        </Pressable>
      );
    })}
  </View>
);

const TonightView = ({
  chrome,
  nightNumber,
  totalNights,
  choices = [],
  night, // used for between cards when choices isn't passed
  isBetween = false,
  freezes = 0,
  nameA = '',
  nameB = '',
  showHowTo = false,
  onHowToSeen,
  onComplete,
  onMiss,
  onBack,
}) => {
  const { language } = useLanguage();
  const t = (key) => jt(language, key);
  const deck = useMemo(() => {
    if (choices.length) return choices;
    return night ? [{ ...night, slot: 'main' }] : [];
  }, [choices, night]);

  const [step, setStep] = useState(() => {
    if (showHowTo) return 'howTo';
    if (deck.length > 1) return 'choose';
    return 'play';
  });
  const [card, setCard] = useState(deck.length === 1 ? deck[0] : null);
  const [pickA, setPickA] = useState(null);
  const [pickB, setPickB] = useState(null);
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [burstKey, setBurstKey] = useState(0);
  const [missDialog, setMissDialog] = useState(false);

  const whoA = nameA.trim() || t('tonightPartnerA');
  const whoB = nameB.trim() || t('tonightPartnerB');
  const idx = Math.max(0, (nightNumber || 1) - 1);
  const hiderIsA = guessHider(idx) === 'a';
  const hiderName = hiderIsA ? whoA : whoB;
  const guesserName = hiderIsA ? whoB : whoA;

  const startCard = (c) => {
    setCard(c);
    setPickA(null);
    setPickB(null);
    setTextA('');
    setTextB('');
    setStep(c.type === 'do' ? 'play' : 'play');
  };

  const finishHowTo = () => {
    onHowToSeen && onHowToSeen();
    setStep(deck.length > 1 ? 'choose' : 'play');
    if (deck.length === 1) setCard(deck[0]);
  };

  const active = card || (deck.length === 1 ? deck[0] : null);
  const type = active?.type || 'talk';
  const band = bandForPhase(active?.phase, language);
  const bandLabel = typeLabel(type, language);
  const nightTag = isBetween
    ? t('homeBetweenCard')
    : `${t('homeNight')} ${nightNumber} · ${totalNights}`;

  const saveResult = (extra) => {
    const aText =
      extra.aText ??
      (type === 'talk' ? textA.trim() : pickA != null ? locOpt(active.options?.[pickA], language) : '');
    const bText =
      extra.bText ??
      (type === 'talk' ? textB.trim() : pickB != null ? locOpt(active.options?.[pickB], language) : '');
    const result = {
      type,
      slot: active?.slot || 'main',
      qText: loc(active?.q, language) || loc(active?.challenge, language),
      aText,
      bText,
      a: type === 'talk' ? textA.trim() : aText,
      b: type === 'talk' ? textB.trim() : bText,
      aPick: pickA,
      bPick: pickB,
      match: extra.match,
      same: extra.same,
      challengeStatus: extra.challengeStatus,
    };
    track(isBetween ? 'journey_between_completed' : 'journey_night_completed', {
      night: nightNumber,
      type,
      slot: result.slot,
    });
    onComplete(result);
    if (extra.confetti) setBurstKey((k) => k + 1);
    setStep('saved');
  };

  const goPass = () => setStep('pass');
  const afterPass = () => setStep('playB');

  // ---- coming soon ----
  if (active?.comingSoon) {
    return (
      <JourneyScaffold chrome={chrome}>
        <PlayingCard band={{ ...band, label: bandLabel }} bandRight={nightTag}>
          <View style={styles.center}>
            <FunIcon name="sparkles" size={56} />
            <Text style={styles.stateTitle}>{t('tonightComingSoon')}</Text>
            <Text style={styles.stateSub}>{t('tonightComingSoonSub')}</Text>
          </View>
        </PlayingCard>
        <JourneyButton title={t('tonightBack')} onPress={onBack} variant="light" style={styles.cta} />
      </JourneyScaffold>
    );
  }

  // ---- how to ----
  if (step === 'howTo') {
    return (
      <JourneyScaffold chrome={chrome}>
        <Eyebrow>{nightTag}</Eyebrow>
        <PlayingCard style={styles.cardTop}>
          <Text style={styles.stateTitle}>{t('tonightHowTitle')}</Text>
          {[t('tonightHow1'), t('tonightHow2'), t('tonightHow3'), t('tonightHow4')].map((line, i) => (
            <View key={i} style={styles.howRow}>
              <Text style={styles.howNum}>{i + 1}</Text>
              <Text style={styles.howText}>{line}</Text>
            </View>
          ))}
          <JourneyButton title={t('tonightHowCta')} onPress={finishHowTo} variant="primary" style={styles.cta} />
        </PlayingCard>
      </JourneyScaffold>
    );
  }

  // ---- choose one of two ----
  if (step === 'choose' || (!active && deck.length > 1)) {
    return (
      <JourneyScaffold chrome={chrome}>
        <Eyebrow>{nightTag}</Eyebrow>
        <Text style={styles.chooseTitle}>{t('tonightChooseTitle')}</Text>
        <Text style={styles.chooseSub}>{t('tonightChooseSub')}</Text>
        {deck.map((c) => (
          <Pressable key={c.slot} onPress={() => startCard(c)} style={styles.choiceWrap} accessibilityRole="button">
            <PlayingCard band={{ ...bandForPhase(c.phase, language), icon: typeIcon(c.type), label: typeLabel(c.type, language) }}>
              <CardQuestion style={styles.choiceQ}>{loc(c.q, language) || loc(c.challenge, language)}</CardQuestion>
              <Text style={styles.choiceHint}>{typeHint(c.type, language)}</Text>
            </PlayingCard>
          </Pressable>
        ))}
        {!isBetween && (
          <View style={styles.miss}>
            <LinkText onPress={() => setMissDialog(true)}>{t('tonightNotTonight')}</LinkText>
          </View>
        )}
        {missBox()}
      </JourneyScaffold>
    );
  }

  // ---- saved ----
  if (step === 'saved') {
    return (
      <JourneyScaffold chrome={chrome}>
        {burstKey > 0 && <ConfettiBurst burstKey={burstKey} />}
        <Eyebrow>{nightTag}</Eyebrow>
        <PlayingCard style={styles.cardTop}>
          <View style={styles.center}>
            <FunIcon name="trophy" size={64} />
            <Text style={styles.stateTitle}>{t('tonightSaved')}</Text>
            <Text style={styles.stateSub}>{t('tonightSavedSub')}</Text>
          </View>
          <JourneyButton title={t('tonightSeeYou')} onPress={onBack} variant="primary" style={styles.cta} />
        </PlayingCard>
      </JourneyScaffold>
    );
  }

  // ---- pass ----
  if (step === 'pass') {
    const nextName = type === 'guess' ? guesserName : whoB;
    return (
      <JourneyScaffold chrome={chrome}>
        <Eyebrow>{nightTag}</Eyebrow>
        <PlayingCard style={styles.cardTop}>
          <View style={styles.center}>
            <FunIcon name="invite" size={64} />
            <Text style={styles.stateTitle}>{t('tonightPassTo')} {nextName}</Text>
            <Text style={styles.stateSub}>{t('tonightPassSub')}</Text>
          </View>
          <JourneyButton title={`${t('tonightYourTurn')}  →`} onPress={afterPass} variant="primary" style={styles.cta} />
        </PlayingCard>
      </JourneyScaffold>
    );
  }

  // ---- dare (together, no pass) ----
  if (type === 'do') {
    return (
      <JourneyScaffold chrome={chrome}>
        <PlayingCard band={{ ...band, icon: typeIcon('do'), label: bandLabel }} bandRight={nightTag}>
          <CardQuestion>{loc(active.q, language)}</CardQuestion>
          {!!active.challenge && (
            <CardChallenge label={t('tonightChallenge')}>{loc(active.challenge, language)}</CardChallenge>
          )}
          <JourneyButton
            title={t('tonightDareDone')}
            onPress={() => saveResult({ challengeStatus: 'done', aText: t('tonightDareDone'), bText: t('tonightDareDone'), confetti: true })}
            variant="primary"
            style={styles.cta}
          />
          <View style={styles.dareRow}>
            <Pressable accessibilityRole="button" onPress={() => saveResult({ challengeStatus: 'skip', aText: t('tonightDareSkip'), bText: t('tonightDareSkip') })} style={styles.dareGhost}>
              <Text style={styles.dareGhostText}>{t('tonightDareSkip')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => saveResult({ challengeStatus: 'later', aText: t('tonightDareLater'), bText: t('tonightDareLater') })} style={styles.dareGhost}>
              <Text style={styles.dareGhostText}>{t('tonightDareLater')}</Text>
            </Pressable>
          </View>
        </PlayingCard>
        {!isBetween && (
          <View style={styles.miss}>
            <LinkText onPress={() => setMissDialog(true)}>{t('tonightNotTonight')}</LinkText>
          </View>
        )}
        {missBox()}
      </JourneyScaffold>
    );
  }

  const isB = step === 'playB';

  // ---- guess ----
  if (type === 'guess') {
    if (step === 'reveal') {
      const match = pickA === pickB;
      return (
        <JourneyScaffold chrome={chrome}>
          {match && <ConfettiBurst burstKey={burstKey} />}
          <PlayingCard band={{ ...band, icon: typeIcon('guess'), label: bandLabel }} bandRight={nightTag}>
            <View style={styles.revealKickerRow}>
              {match && <FunIcon name="party" size={22} />}
              <Text style={styles.revealKicker}>{match ? t('tonightMatch') : t('tonightMiss')}</Text>
            </View>
            <CardQuestion>{loc(active.q, language)}</CardQuestion>
            <View style={styles.revealBlock}>
              <Text style={styles.revealWho}>{hiderName}</Text>
              <Text style={styles.revealAns}>{locOpt(active.options?.[pickA], language)}</Text>
            </View>
            <View style={styles.revealBlock}>
              <Text style={styles.revealWho}>{guesserName}</Text>
              <Text style={styles.revealAns}>{locOpt(active.options?.[pickB], language)}</Text>
            </View>
            <JourneyButton
              title={t('tonightSaveNight')}
              onPress={() => saveResult({ match, aText: locOpt(active.options?.[pickA], language), bText: locOpt(active.options?.[pickB], language), confetti: match })}
              variant="primary"
              style={styles.cta}
            />
          </PlayingCard>
        </JourneyScaffold>
      );
    }
    if (!isB) {
      return (
        <JourneyScaffold chrome={chrome}>
          <PlayingCard band={{ ...band, icon: typeIcon('guess'), label: bandLabel }} bandRight={nightTag}>
            <Text style={styles.turnLabel}>{hiderName} · {t('tonightHider')}</Text>
            <CardQuestion>{loc(active.q, language)}</CardQuestion>
            <OptionList options={active.options} language={language} selected={pickA} onSelect={setPickA} />
            <JourneyButton
              title={`${t('tonightPass')}  →`}
              onPress={goPass}
              disabled={pickA == null}
              variant="primary"
              style={styles.cta}
            />
          </PlayingCard>
          {!isBetween && (
            <View style={styles.miss}>
              <LinkText onPress={() => setMissDialog(true)}>{t('tonightNotTonight')}</LinkText>
            </View>
          )}
          {missBox()}
        </JourneyScaffold>
      );
    }
    return (
      <JourneyScaffold chrome={chrome}>
        <PlayingCard band={{ ...band, icon: typeIcon('guess'), label: bandLabel }} bandRight={nightTag}>
          <Text style={styles.turnLabel}>{guesserName} · {t('tonightGuesser')}</Text>
          <Text style={styles.prompt}>{t('tonightGuessPrompt')}</Text>
          <CardQuestion>{loc(active.q, language)}</CardQuestion>
          <OptionList options={active.options} language={language} selected={pickB} onSelect={setPickB} />
          <JourneyButton
            title={`${t('tonightReveal')}  →`}
            onPress={() => {
              if (pickA === pickB) setBurstKey((k) => k + 1);
              setStep('reveal');
            }}
            disabled={pickB == null}
            variant="primary"
            style={styles.cta}
          />
        </PlayingCard>
      </JourneyScaffold>
    );
  }

  // ---- pick ----
  if (type === 'pick') {
    if (step === 'reveal') {
      const same = pickA === pickB;
      return (
        <JourneyScaffold chrome={chrome}>
          {same && <ConfettiBurst burstKey={burstKey} />}
          <PlayingCard band={{ ...band, icon: typeIcon('pick'), label: bandLabel }} bandRight={nightTag}>
            <View style={styles.revealKickerRow}>
              {same && <FunIcon name="handshake" size={22} />}
              <Text style={styles.revealKicker}>{same ? t('tonightSame') : t('tonightSplit')}</Text>
            </View>
            <CardQuestion>{loc(active.q, language)}</CardQuestion>
            <View style={styles.revealBlock}>
              <Text style={styles.revealWho}>{whoA}</Text>
              <Text style={styles.revealAns}>{locOpt(active.options?.[pickA], language)}</Text>
            </View>
            <View style={styles.revealBlock}>
              <Text style={styles.revealWho}>{whoB}</Text>
              <Text style={styles.revealAns}>{locOpt(active.options?.[pickB], language)}</Text>
            </View>
            <JourneyButton
              title={t('tonightSaveNight')}
              onPress={() => saveResult({ same, confetti: same })}
              variant="primary"
              style={styles.cta}
            />
          </PlayingCard>
        </JourneyScaffold>
      );
    }
    if (!isB) {
      return (
        <JourneyScaffold chrome={chrome}>
          <PlayingCard band={{ ...band, icon: typeIcon('pick'), label: bandLabel }} bandRight={nightTag}>
            <Text style={styles.turnLabel}>{whoA} · {t('tonightPickSecret')}</Text>
            <CardQuestion>{loc(active.q, language)}</CardQuestion>
            <OptionList options={active.options} language={language} selected={pickA} onSelect={setPickA} />
            <JourneyButton title={`${t('tonightPass')}  →`} onPress={goPass} disabled={pickA == null} variant="primary" style={styles.cta} />
          </PlayingCard>
          {!isBetween && (
            <View style={styles.miss}>
              <LinkText onPress={() => setMissDialog(true)}>{t('tonightNotTonight')}</LinkText>
            </View>
          )}
          {missBox()}
        </JourneyScaffold>
      );
    }
    return (
      <JourneyScaffold chrome={chrome}>
        <PlayingCard band={{ ...band, icon: typeIcon('pick'), label: bandLabel }} bandRight={nightTag}>
          <Text style={styles.turnLabel}>{whoB} · {t('tonightPickSecret')}</Text>
          <CardQuestion>{loc(active.q, language)}</CardQuestion>
          <OptionList options={active.options} language={language} selected={pickB} onSelect={setPickB} />
          <JourneyButton
            title={`${t('tonightReveal')}  →`}
            onPress={() => {
              if (pickA === pickB) setBurstKey((k) => k + 1);
              setStep('reveal');
            }}
            disabled={pickB == null}
            variant="primary"
            style={styles.cta}
          />
        </PlayingCard>
      </JourneyScaffold>
    );
  }

  // ---- talk ----
  if (step === 'reveal') {
    return (
      <JourneyScaffold chrome={chrome}>
        <PlayingCard band={{ ...band, icon: typeIcon('talk'), label: bandLabel }} bandRight={nightTag}>
          <CardQuestion>{loc(active.q, language)}</CardQuestion>
          <View style={styles.revealBlock}>
            <Text style={styles.revealWho}>{whoA}</Text>
            <Text style={styles.revealAns}>{textA.trim() || '—'}</Text>
          </View>
          <View style={styles.revealBlock}>
            <Text style={styles.revealWho}>{whoB}</Text>
            <Text style={styles.revealAns}>{textB.trim() || '—'}</Text>
          </View>
          <JourneyButton title={t('tonightSaveNight')} onPress={() => saveResult({})} variant="primary" style={styles.cta} />
        </PlayingCard>
      </JourneyScaffold>
    );
  }
  const currentText = isB ? textB : textA;
  const setCurrentText = isB ? setTextB : setTextA;
  const who = isB ? whoB : whoA;
    return (
      <JourneyScaffold chrome={chrome}>
        <PlayingCard band={{ ...band, icon: typeIcon('talk'), label: bandLabel }} bandRight={nightTag}>
          <Text style={styles.turnLabel}>{who} · {t('tonightYourTurn')}</Text>
          <CardQuestion>{loc(active.q, language)}</CardQuestion>
          <TextInput
            style={styles.input}
            placeholder={t('tonightAnswerPlaceholder')}
            placeholderTextColor="rgba(34,22,63,0.4)"
            value={currentText}
            onChangeText={setCurrentText}
            multiline
          />
          <JourneyButton
            title={isB ? `${t('tonightReveal')}  →` : `${t('tonightPass')}  →`}
            onPress={() => {
              if (!isB) goPass();
              else setStep('reveal');
            }}
            variant="primary"
            style={styles.cta}
          />
          <View style={styles.skipWrite}>
            <LinkText
              onPress={() => {
                if (!isB) goPass();
                else setStep('reveal');
              }}
            >
              {t('tonightWeTalked')}
            </LinkText>
          </View>
        </PlayingCard>
        {!isB && !isBetween && (
          <View style={styles.miss}>
            <LinkText onPress={() => setMissDialog(true)}>{t('tonightNotTonight')}</LinkText>
          </View>
        )}
        {missBox()}
      </JourneyScaffold>
    );

  function missBox() {
    return (
      <AppDialog
        visible={missDialog}
        icon={freezes > 0 ? 'snowflake' : 'gift'}
        title={freezes > 0 ? t('tonightFreezeTitle') : t('tonightJarTitle')}
        message={freezes > 0 ? t('tonightFreezeMsg') : t('tonightJarMsg')}
        buttons={[
          { text: t('tonightBack'), style: 'cancel' },
          {
            text: freezes > 0 ? t('tonightFreezeUse') : t('tonightJarOk'),
            onPress: () => {
              track('journey_night_missed', { usedFreeze: freezes > 0 });
              onMiss && onMiss();
            },
          },
        ]}
        onRequestClose={() => setMissDialog(false)}
      />
    );
  }
};

const styles = StyleSheet.create({
  cardTop: { marginTop: 12 },
  center: { alignItems: 'center' },
  stateTitle: { color: JC.ink, fontSize: 22, fontWeight: '900', marginTop: 10, textAlign: 'center' },
  stateSub: { color: JC.inkSoft, fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  turnLabel: {
    color: JC.accent,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  prompt: { color: JC.inkSoft, fontWeight: '700', fontSize: 14, marginBottom: 8 },
  opts: { marginTop: 16, gap: 8 },
  opt: {
    backgroundColor: 'rgba(34,22,63,0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(34,22,63,0.1)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optOn: { borderColor: JC.accent, backgroundColor: 'rgba(124,58,237,0.1)' },
  optText: { color: JC.ink, fontWeight: '800', fontSize: 16 },
  optTextOn: { color: JC.accent },
  input: {
    width: '100%',
    minHeight: 84,
    backgroundColor: 'rgba(34,22,63,0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(34,22,63,0.14)',
    color: JC.ink,
    fontSize: 15,
    fontWeight: '600',
    padding: 14,
    marginTop: 16,
    textAlignVertical: 'top',
  },
  cta: { width: '100%', marginTop: 18 },
  miss: { marginTop: 16, alignItems: 'center' },
  skipWrite: { marginTop: 12, alignItems: 'center' },
  chooseTitle: { color: JC.onDark, fontWeight: '900', fontSize: 24, marginTop: 8 },
  chooseSub: { color: JC.onDarkSoft, fontWeight: '600', fontSize: 14, marginTop: 6, marginBottom: 16 },
  choiceWrap: { width: '100%', marginBottom: 14 },
  choiceQ: { fontSize: 18 },
  choiceHint: { color: JC.inkSoft, fontWeight: '700', fontSize: 13, marginTop: 10, lineHeight: 18 },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 14 },
  howNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: JC.gold,
    color: JC.goldInk,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
    overflow: 'hidden',
  },
  howText: { color: JC.ink, fontWeight: '700', fontSize: 15, flex: 1, lineHeight: 22, paddingTop: 3 },
  dareRow: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 14 },
  dareGhost: { padding: 8 },
  dareGhostText: { color: JC.inkSoft, fontWeight: '800', fontSize: 14, textDecorationLine: 'underline' },
  revealKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  revealKicker: { color: JC.accent, fontWeight: '900', fontSize: 16 },
  revealBlock: { marginTop: 14 },
  revealWho: { color: 'rgba(34,22,63,0.5)', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  revealAns: { color: JC.ink, fontSize: 17, fontWeight: '800', marginTop: 3 },
});

export default TonightView;
