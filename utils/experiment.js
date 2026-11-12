// Preview-only experiment UX helpers. Not a live A/B: Martin (and testers)
// pick a path so they can walk group Classic, couple Classic, and Journey.

export const PATHS = {
  group: { job: 'group', arm: null },
  coupleClassic: { job: 'couple', arm: 'classic' },
  coupleJourney: { job: 'couple', arm: 'journey' },
};

export const markSessionPlayed = (updateSettings, settings) => {
  if (!settings?.experimentUx) return;
  if (settings.exitSurveyDone || settings.exitSurveyPending) return;
  updateSettings({ exitSurveyPending: true });
};

export const applyPath = (updateSettings, pathKey) => {
  const p = PATHS[pathKey] || PATHS.group;
  updateSettings({
    experimentJob: p.job,
    experimentArm: p.arm,
    nextGen: p.arm === 'journey',
    exitSurveyPending: false,
    exitSurveyDone: false,
  });
};

export const clearPath = (updateSettings) => {
  updateSettings({
    experimentJob: null,
    experimentArm: null,
    nextGen: false,
    exitSurveyPending: false,
    exitSurveyDone: false,
  });
};
