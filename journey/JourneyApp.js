// Next-generation Talk Trap: the 14-night journey for two, rendered in place of
// the classic Home when Settings → Testing → "Next generation Talk Trap" is on.
// Entirely local: its own save, its own fake one-time purchases. Classic decks,
// GameScreen, UpgradeScreen and premiumUnlocked are never touched from here.

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import FunIcon from '../components/FunIcon';
import GameTile from '../components/GameTile';
import { AppDialog } from '../components/ui';
import { track } from '../utils/analytics';
import { applyPath, markSessionPlayed, clearPath } from '../utils/experiment';
import PreviewSwitcher from './PreviewSwitcher';
import ChromeActions from './ChromeActions';
import { jt } from './strings';
import { typeIcon, typeLabel } from './mechanics';
import {
  SEASONS,
  loc,
  seasonForStage,
  nextSeasonId,
  allSeasonsPriceLabel,
  getNightChoices,
  getNight,
  bandForPhase,
} from './seasons';
import { STAGES } from './stages';
import { betweenCards } from './between';
import {
  loadJourney,
  saveJourney,
  completeNight,
  missNight,
  nextNightIndex,
  nightsDone,
  nightLocked,
  playedToday,
} from './store';
import {
  JC,
  useJourney,
  JourneyScaffold,
  JourneyChrome,
  Eyebrow,
  GlassPanel,
  Chip,
  JourneyButton,
  LinkText,
  PlayingCard,
  CardQuestion,
} from './ui';
import LandingView from './LandingView';
import TonightView from './TonightView';
import AlbumView from './AlbumView';
import RecapView from './RecapView';
import JourneyPaywall from './Paywall';

const JourneyApp = ({ navigation }) => {
  const { language } = useLanguage();
  const { settings, updateSettings } = useSettings();
  const t = (key) => jt(language, key);

  const [journey, setJourney] = useState(null);
  const [view, setView] = useState('home'); // landing | stage | names | home | tonight | between | album | recap
  const [paywall, setPaywall] = useState(null); // { context, seasonId } | null
  const [dialog, setDialog] = useState(null);
  const [pendingNight, setPendingNight] = useState(null); // night index being played

  const reload = useCallback(async () => {
    const state = await loadJourney();
    setJourney(state);
    setView((v) => {
      if (state.stage) return v === 'landing' || v === 'stage' ? 'home' : v;
      if (settings.experimentUx) return v === 'names' || v === 'stage' ? v : 'stage';
      return 'landing';
    });
  }, [settings.experimentUx]);

  useEffect(() => {
    reload();
    const unsub = navigation.addListener('focus', reload);
    return unsub;
  }, [navigation, reload]);

  const persist = async (next) => {
    setJourney(next);
    await saveJourney(next);
  };

  const backToDoors = settings.experimentUx && settings.experimentJob
    ? () => clearPath(updateSettings)
    : undefined;
  const PreviewChrome = ({ onGear, ...chromeProps }) => (
    <View>
      <JourneyChrome
        {...chromeProps}
        right={<ChromeActions navigation={navigation} />}
      />
      {settings.experimentUx ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
          <PreviewSwitcher />
        </View>
      ) : null}
    </View>
  );

  if (!journey) {
    return <JourneyScaffold chrome={<PreviewChrome onBack={backToDoors} />}>{null}</JourneyScaffold>;
  }

  const seasonId = journey.seasonId || 'justUs';
  const season = SEASONS[seasonId];
  const nextNight = nextNightIndex(journey, seasonId);
  const seasonDone = nextNight === null;
  const doneToday = playedToday(journey) && !settings.journeyNoDailyLimit;
  const hasBetweenCard = seasonDone && journey.betweenIndex < betweenCards.length;

  // ---- actions ----

  const startFromLanding = () => setView('stage');

  const chooseStage = async (stageId) => {
    const sid = seasonForStage(stageId);
    track('journey_started', { stage: stageId, seasonId: sid });
    await persist({ ...journey, stage: stageId, seasonId: sid, freezes: journey.freezes ?? 2 });
    setView('names');
  };

  const saveNames = async (nameA, nameB) => {
    await persist({ ...journey, nameA: (nameA || '').trim(), nameB: (nameB || '').trim() });
    setView('home');
  };

  const openTonight = () => {
    if (seasonDone) {
      setView('recap');
      return;
    }
    if (nightLocked(journey, seasonId, nextNight)) {
      setPaywall({ context: 'gate', seasonId });
      return;
    }
    if (doneToday) {
      setDialog({
        icon: 'candle',
        title: t('homeDoneTonight'),
        message: `${t('homeNight')} ${nextNight + 1} ${t('homeWaitTomorrow')}`,
        buttons: [{ text: 'OK' }],
      });
      return;
    }
    setPendingNight(nextNight);
    setView('tonight');
  };

  const handleComplete = async (result) => {
    const latest = await loadJourney();
    const next = completeNight(latest, seasonId, pendingNight, result);
    await persist(next);
    markSessionPlayed(updateSettings, settings);
  };

  const handleMiss = async () => {
    const next = missNight(journey);
    await persist(next);
    setView('home');
  };

  const handleBetweenComplete = async (result) => {
    const next = {
      ...journey,
      betweenIndex: journey.betweenIndex + 1,
      betweenAnswers: [
        ...(journey.betweenAnswers || []),
        { cardIndex: journey.betweenIndex, ...result, at: new Date().toISOString() },
      ],
    };
    await persist(next);
  };

  const buySeason = async (sid) => {
    const owned = (journey.ownedSeasons || []).includes(sid)
      ? journey.ownedSeasons
      : [...(journey.ownedSeasons || []), sid];
    const fromGate = paywall?.context === 'gate';
    const next = { ...journey, ownedSeasons: owned };
    await persist(next);
    setPaywall(null);
    setDialog({
      title: t('paywallUnlocked'),
      message: t('paywallUnlockedMsg'),
      buttons: [
        {
          text: t('paywallStartPlaying'),
          onPress: fromGate
            ? () => {
                setPendingNight(nextNightIndex(next, seasonId));
                setView('tonight');
              }
            : undefined,
        },
      ],
    });
  };

  const buyAll = async () => {
    const fromGate = paywall?.context === 'gate';
    const next = { ...journey, ownsAll: true };
    await persist(next);
    setPaywall(null);
    setDialog({
      title: t('paywallUnlocked'),
      message: t('paywallUnlockedAllMsg'),
      buttons: [
        {
          text: t('paywallStartPlaying'),
          onPress: fromGate
            ? () => {
                setPendingNight(nextNightIndex(next, seasonId));
                setView('tonight');
              }
            : undefined,
        },
      ],
    });
  };

  const startNextSeason = async (sid) => {
    track('journey_season_started', { seasonId: sid });
    await persist({ ...journey, seasonId: sid, freezes: 2 });
    setView('home');
  };

  // ---- views ----

  if (view === 'landing') {
    return (
      <>
        <LandingView onStart={startFromLanding} chrome={<PreviewChrome onBack={backToDoors} />} />
        {renderDialog()}
      </>
    );
  }

  if (view === 'stage') {
    return (
      <>
        <StagePicker chrome={<PreviewChrome onBack={backToDoors} />} t={t} language={language} onChoose={chooseStage} />
        {renderDialog()}
      </>
    );
  }

  if (view === 'names') {
    return (
      <>
        <NamesView
          chrome={<PreviewChrome onBack={backToDoors} />}
          t={t}
          initialA={journey.nameA}
          initialB={journey.nameB}
          onSave={saveNames}
        />
        {renderDialog()}
      </>
    );
  }

  if (view === 'tonight') {
    const choices = getNightChoices(seasonId, journey.stage, pendingNight ?? 0);
    return (
      <>
        <TonightView
          chrome={<PreviewChrome onBack={() => setView('home')} />}
          nightNumber={(pendingNight ?? 0) + 1}
          totalNights={season.nights.length}
          choices={choices}
          freezes={journey.freezes}
          nameA={journey.nameA}
          nameB={journey.nameB}
          showHowTo={!journey.sawHowTo}
          onHowToSeen={async () => {
            const latest = await loadJourney();
            await persist({ ...latest, sawHowTo: true });
          }}
          onComplete={handleComplete}
          onMiss={handleMiss}
          onBack={() => setView('home')}
        />
        {renderDialog()}
      </>
    );
  }

  if (view === 'between') {
    return (
      <>
        <TonightView
          chrome={<PreviewChrome onBack={() => setView('home')} />}
          isBetween
          night={betweenCards[journey.betweenIndex]}
          nameA={journey.nameA}
          nameB={journey.nameB}
          onComplete={handleBetweenComplete}
          onBack={() => setView('home')}
        />
        {renderDialog()}
      </>
    );
  }

  if (view === 'album') {
    return (
      <>
        <AlbumView
          chrome={<PreviewChrome onBack={() => setView('home')} />}
          journey={journey}
          seasonId={seasonId}
          onLockedTap={() => setPaywall({ context: 'album', seasonId })}
          onBack={() => setView('home')}
        />
        {renderPaywall()}
        {renderDialog()}
      </>
    );
  }

  if (view === 'recap') {
    return (
      <>
        <RecapView
          chrome={<PreviewChrome onBack={() => setView('home')} />}
          journey={journey}
          seasonId={seasonId}
          onStartNextSeason={startNextSeason}
          onBuyNextSeason={(sid) => setPaywall({ context: 'recap', seasonId: sid })}
          onBuyAll={() => setPaywall({ context: 'recap', seasonId: nextSeasonId(seasonId) || seasonId })}
          onBack={() => setView('home')}
        />
        {renderPaywall()}
        {renderDialog()}
      </>
    );
  }

  // ---- home ----
  const ownedOne = journey.ownsAll || (journey.ownedSeasons || []).length > 0;

  const doneCount = nightsDone(journey, seasonId);
  const tonightPeek = !seasonDone ? getNight(seasonId, journey.stage, nextNight) : null;
  const hero = (
    <HomeHero
      season={season}
      seasonDone={seasonDone}
      nextNight={nextNight}
      doneCount={doneCount}
      language={language}
      t={t}
    />
  );

  return (
    <>
      <JourneyScaffold chrome={<PreviewChrome onBack={backToDoors} />} hero={hero}>
        {!seasonDone ? (
          <>
            {doneToday && (
              <GlassPanel style={styles.homeNote}>
                <View style={styles.homeNoteRow}>
                  <FunIcon name="candle" size={22} />
                  <Text style={styles.homeNoteText}>
                    {t('homeDoneTonight')} {t('homeNight')} {nextNight + 1} {t('homeWaitTomorrow')}
                  </Text>
                </View>
              </GlassPanel>
            )}
            {!!tonightPeek && (
              <PlayingCard
                band={{
                  ...bandForPhase(tonightPeek.phase, language),
                  icon: typeIcon(tonightPeek.type),
                  label: typeLabel(tonightPeek.type, language),
                }}
                bandRight={`${t('homeNight')} ${nextNight + 1}`}
                style={styles.tonightCard}
              >
                <CardQuestion>{loc(tonightPeek.q, language)}</CardQuestion>
              </PlayingCard>
            )}
            <JourneyButton
              icon="dice"
              title={t('homePlayTonight')}
              onPress={openTonight}
              style={styles.homeCta}
            />
          </>
        ) : (
          <>
            <JourneyButton title={`${t('homeRecap')}  →`} onPress={() => setView('recap')} style={styles.homeCta} />
            {hasBetweenCard && (
              <SoftCard
                icon="sparkles"
                title={t('homeBetweenCard')}
                sub={t('homeBetweenSub')}
                onPress={() => setView('between')}
              />
            )}
          </>
        )}

        <View style={styles.chipsRow}>
          <Chip icon="snowflake">{journey.freezes} {t('homeFreezes')}</Chip>
          {journey.dateJar > 0 && (
            <Chip icon="gift">{t('homeDateJar')}: €{journey.dateJar}</Chip>
          )}
        </View>

        <Pressable onPress={() => setView('album')} style={styles.albumBtn} accessibilityRole="button">
          <FunIcon name="custom" size={18} />
          <Text style={styles.albumBtnText}>{t('homeAlbum')}  →</Text>
        </Pressable>

        {ownedOne && !journey.ownsAll && (
          <SoftCard
            tone="gold"
            icon="crown"
            title={`${t('homeAllSeasonsCard')} · ${allSeasonsPriceLabel(language)}`}
            sub={t('homeAllSeasonsSub')}
            onPress={() => setPaywall({ context: 'home', seasonId: nextSeasonId(seasonId) || seasonId })}
          />
        )}

        <View style={styles.homeFooter}>
          <LinkText onPress={() => applyPath(updateSettings, 'coupleClassic')}>{t('homeClassicLink')} →</LinkText>
        </View>
      </JourneyScaffold>
      {renderPaywall()}
      {renderDialog()}
    </>
  );

  function renderPaywall() {
    return (
      <JourneyPaywall
        visible={!!paywall}
        context={paywall?.context}
        seasonId={paywall?.seasonId}
        ownsAll={journey.ownsAll}
        onBuySeason={buySeason}
        onBuyAll={buyAll}
        onClose={() => setPaywall(null)}
      />
    );
  }

  function renderDialog() {
    return (
      <AppDialog
        visible={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons}
        onRequestClose={() => setDialog(null)}
      />
    );
  }
};

// --- home hero (expressive left/top block) ---
const HomeHero = ({ season, seasonDone, nextNight, doneCount, language, t }) => {
  const { type, heroSplit } = useJourney();
  const total = season.nights.length;
  return (
    <View style={[styles.hero, heroSplit ? styles.heroLeft : styles.heroCenter]}>
      <View style={styles.heroIconWrap}>
        <FunIcon name={season.icon} size={heroSplit ? 96 : 72} />
      </View>
      <Eyebrow>{loc(season.title, language)}</Eyebrow>
      {seasonDone ? (
        <View style={[styles.seasonDoneRow, heroSplit ? styles.alignLeft : styles.heroCenter]}>
          <FunIcon name="trophy" size={32} />
          <Text style={[styles.heroBig, { fontSize: type.hero }, heroSplit ? styles.alignLeft : styles.alignCenter]}>
            {t('homeSeasonDone')}
          </Text>
        </View>
      ) : (
        <Text style={[styles.heroBig, { fontSize: type.hero }, heroSplit ? styles.alignLeft : styles.alignCenter]}>
          {t('homeNight')} {nextNight + 1}
          <Text style={styles.heroBigDim}>  {t('homeOf')} {total}</Text>
        </Text>
      )}
      <View style={[styles.dotsRow, heroSplit ? styles.progressLeft : styles.progressCenter]}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < doneCount && styles.dotDone,
              !seasonDone && i === nextNight && styles.dotNow,
            ]}
          />
        ))}
      </View>
      <Text style={[styles.heroTagline, { fontSize: type.body }, heroSplit ? styles.alignLeft : styles.alignCenter]}>
        {loc(season.tagline, language)}
      </Text>
    </View>
  );
};

const NamesView = ({ chrome, t, initialA, initialB, onSave }) => {
  const { type, heroSplit } = useJourney();
  const [a, setA] = useState(initialA || '');
  const [b, setB] = useState(initialB || '');
  const hero = (
    <View style={[styles.hero, heroSplit ? styles.heroLeft : styles.heroCenter]}>
      <View style={styles.heroIconWrap}>
        <FunIcon name="invite" size={heroSplit ? 88 : 64} />
      </View>
      <Eyebrow>{t('namesSub')}</Eyebrow>
      <Text style={[styles.heroBig, { fontSize: type.title }, heroSplit ? styles.alignLeft : styles.alignCenter]}>
        {t('namesTitle')}
      </Text>
    </View>
  );
  return (
    <JourneyScaffold chrome={chrome} hero={hero}>
      <Text style={styles.nameLabel}>{t('namesA')}</Text>
      <TextInput style={styles.nameInput} value={a} onChangeText={setA} placeholder="Alex" placeholderTextColor="rgba(255,255,255,0.45)" />
      <Text style={styles.nameLabel}>{t('namesB')}</Text>
      <TextInput style={styles.nameInput} value={b} onChangeText={setB} placeholder="Sam" placeholderTextColor="rgba(255,255,255,0.45)" />
      <JourneyButton title={t('namesCta')} onPress={() => onSave(a, b)} variant="primary" style={styles.homeCta} />
      <View style={styles.homeFooter}>
        <LinkText onPress={() => onSave('', '')}>{t('namesSkip')}</LinkText>
      </View>
    </JourneyScaffold>
  );
};

// --- stage picker ---
const STAGE_LOOK = {
  justMet: { colors: ['#8F6BFF', '#5B3FD9'] },
  dating: { colors: ['#FF5E8A', '#E0245E'] },
  living: { colors: ['#22D3EE', '#0E7490'] },
  married: { colors: ['#FFC94D', '#F28B1D'] },
};

const StagePicker = ({ chrome, t, language, onChoose }) => {
  const { type, heroSplit } = useJourney();
  const hero = (
    <View style={[styles.hero, heroSplit ? styles.heroLeft : styles.heroCenter]}>
      <View style={styles.heroIconWrap}>
        <FunIcon name="jar" size={heroSplit ? 92 : 68} />
      </View>
      <Eyebrow>{t('stageSub')}</Eyebrow>
      <Text style={[styles.heroBig, { fontSize: type.title }, heroSplit ? styles.alignLeft : styles.alignCenter]}>
        {t('stageTitle')}
      </Text>
    </View>
  );
  return (
    <JourneyScaffold chrome={chrome} hero={hero} alignTop={!heroSplit}>
      <View style={styles.stageGrid}>
        {STAGES.map((s) => {
          const look = STAGE_LOOK[s.id] || STAGE_LOOK.dating;
          return (
            <GameTile
              key={s.id}
              icon={s.icon}
              colors={look.colors}
              title={t(s.labelKey)}
              subtitle={loc(s.intent, language)}
              onPress={() => onChoose(s.id)}
            />
          );
        })}
      </View>
    </JourneyScaffold>
  );
};

// --- reusable soft (glass) card with icon + text, tappable ---
const SoftCard = ({ icon, title, sub, onPress, tone }) => (
  <Pressable onPress={onPress} accessibilityRole="button" style={{ width: '100%', marginTop: 14 }}>
    <GlassPanel tone={tone === 'gold' ? 'gold' : 'surface'} style={styles.softCard}>
      <FunIcon name={icon} size={34} style={styles.softIcon} />
      <View style={styles.softTextWrap}>
        <Text style={styles.softTitle}>{title}</Text>
        {!!sub && <Text style={styles.softSub}>{sub}</Text>}
      </View>
      <Text style={styles.softChevron}>›</Text>
    </GlassPanel>
  </Pressable>
);

const styles = StyleSheet.create({
  hero: { width: '100%' },
  heroLeft: { alignItems: 'flex-start' },
  heroCenter: { alignItems: 'center' },
  alignLeft: { textAlign: 'left' },
  alignCenter: { textAlign: 'center' },
  heroIconWrap: { marginBottom: 14 },
  heroBig: { color: JC.onDark, fontWeight: '900', marginTop: 10, letterSpacing: 0.2 },
  heroBigDim: { color: JC.onDarkFaint, fontWeight: '800' },
  heroTagline: { color: JC.onDarkSoft, fontWeight: '600', marginTop: 12, lineHeight: 24, maxWidth: 460 },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 16,
    maxWidth: 280,
    justifyContent: 'center',
  },
  progressLeft: { alignSelf: 'flex-start', justifyContent: 'flex-start' },
  progressCenter: { alignSelf: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  dotDone: { backgroundColor: JC.gold, borderColor: JC.gold },
  dotNow: {
    backgroundColor: '#fff',
    borderColor: JC.gold,
    transform: [{ scale: 1.25 }],
  },
  tonightCard: { marginBottom: 16 },
  nameLabel: { color: JC.onDarkSoft, fontWeight: '800', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 8 },
  nameInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    color: JC.onDark,
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  homeNote: { marginBottom: 14 },
  homeNoteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  homeNoteText: { color: JC.onDark, fontWeight: '700', fontSize: 14, textAlign: 'center', lineHeight: 20, flex: 1 },
  homeCta: { width: '100%' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18, justifyContent: 'center' },
  albumBtn: { paddingVertical: 14, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  albumBtnText: { color: JC.onDark, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  seasonDoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  homeFooter: { marginTop: 18, alignItems: 'center' },

  // stage — same 2-up GameTile grid as group / couple Home
  stageGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // soft card
  softCard: { flexDirection: 'row', alignItems: 'center' },
  softIcon: { marginRight: 12 },
  softTextWrap: { flex: 1 },
  softTitle: { color: JC.onDark, fontWeight: '900', fontSize: 15 },
  softSub: { color: JC.onDarkFaint, fontWeight: '600', fontSize: 13, marginTop: 3, lineHeight: 18 },
  softChevron: { color: JC.onDarkFaint, fontSize: 24, fontWeight: '800', marginLeft: 6 },
});

export default JourneyApp;
