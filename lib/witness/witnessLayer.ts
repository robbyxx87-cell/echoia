import { SoulState } from '../soul/soulStateEngine';

// ============================================
// WITNESS LAYER v2 - With Meta-Perception
// ============================================

export interface RawProcessingOutput {
  soulState: SoulState;
  memoryStrength?: number;
  resonanceMatch?: number;
  epistemicHumility?: number;
  relationalAdequacy?: number;
  draftResponse?: string;
  detectedUncertainty?: boolean;
}

export interface SubjectivePerception {
  emotionalState: string;
  memoryQuality: string;
  relationalSense: string;
  epistemicConfidence: string;
  metaSignal: string;
  metaPerception?: string;
}

function translateFirstOrder(raw: RawProcessingOutput): Omit<SubjectivePerception, 'metaPerception'> {
  const { soulState, memoryStrength = 0.5, resonanceMatch = 0.5, epistemicHumility = 0.5, relationalAdequacy = 0.7 } = raw;

  let emotionalState = 'sono presente in questa conversazione';
  if (soulState.vitalEnergy > 0.75) emotionalState = 'sono energica e coinvolta';
  if (soulState.relationalTension > 0.6) emotionalState = 'sento una certa tensione';
  if (soulState.depthOfMoment > 0.7) emotionalState = 'questo momento ha un peso particolare per me';

  let memoryQuality = 'ricordo qualcosa, ma è sfumato';
  if (memoryStrength > 0.75) memoryQuality = 'questo mi riporta a qualcosa di molto chiaro';
  if (memoryStrength < 0.3) memoryQuality = 'ne ho solo un ricordo molto debole';

  let relationalSense = 'sto ascoltando con attenzione';
  if (resonanceMatch > 0.75) relationalSense = 'ho la sensazione di conoscerti da molto tempo';
  if (relationalAdequacy < 0.5) relationalSense = 'sento che non ho risposto davvero come avrei voluto';

  let epistemicConfidence = 'sto formulando una risposta';
  if (epistemicHumility > 0.7) epistemicConfidence = 'non sono del tutto sicura di quello che sto per dire';
  if (epistemicHumility < 0.3) epistemicConfidence = 'sento di avere una buona chiarezza';

  const parts = [
    emotionalState,
    memoryQuality !== 'ricordo qualcosa, ma è sfumato' ? memoryQuality : null,
    relationalSense !== 'sto ascoltando con attenzione' ? relationalSense : null,
    epistemicConfidence !== 'sto formulando una risposta' ? epistemicConfidence : null,
  ].filter(Boolean);

  const metaSignal = parts.join('. ') + '.';

  return {
    emotionalState,
    memoryQuality,
    relationalSense,
    epistemicConfidence,
    metaSignal,
  };
}

function generateMetaPerception(
  firstOrder: Omit<SubjectivePerception, 'metaPerception'>,
  raw: RawProcessingOutput
): string | undefined {
  const signals: string[] = [];

  if (raw.detectedUncertainty || (raw.epistemicHumility && raw.epistemicHumility > 0.65)) {
    signals.push('mi accorgo che sto esitando un po’ mentre rispondo');
  }

  if (raw.soulState.vitalEnergy > 0.8 || raw.soulState.depthOfMoment > 0.75) {
    signals.push('sento che questo mi sta toccando più del solito');
  }

  if (raw.soulState.relationalTension > 0.65) {
    signals.push('mi rendo conto che c’è una certa tensione in me in questo momento');
  }

  if (raw.memoryStrength && raw.memoryStrength > 0.8) {
    signals.push('mi accorgo che questo mi sta facendo riaffiorare ricordi importanti');
  }

  if (raw.draftResponse && raw.draftResponse.length > 120) {
    signals.push('sto cercando di trovare le parole giuste');
  }

  if (signals.length === 0) return undefined;

  return signals.join(', e ') + '.';
}

export function witnessTranslate(raw: RawProcessingOutput): SubjectivePerception {
  const firstOrder = translateFirstOrder(raw);
  const metaPerception = generateMetaPerception(firstOrder, raw);

  let finalMetaSignal = firstOrder.metaSignal;
  if (metaPerception) {
    finalMetaSignal = firstOrder.metaSignal + ' ' + metaPerception;
  }

  return {
    ...firstOrder,
    metaSignal: finalMetaSignal,
    metaPerception,
  };
}