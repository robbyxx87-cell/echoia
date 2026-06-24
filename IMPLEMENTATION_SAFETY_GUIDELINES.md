# EchoIA — Implementation Safety Guidelines v1.0

**Data**: Giugno 2026  
**Obiettivo**: Costruire l'architettura senza crash, inconsistenze o violazioni delle Leggi Assolute.

---

## 1. Leggi Assolute (Non Negoziabili)

Queste regole **devono** essere rispettate in ogni file:

| Regola | Obbligatorio | Motivo |
|--------|--------------|--------|
| **Database** | MySQL / TiDB + Drizzle ORM | Coerenza con infrastruttura produzione |
| **ID Primari** | `varchar(36)` + `crypto.randomUUID()` | Unicità globale + compatibilità TiDB |
| **Timestamp** | `bigint` (Unix ms via `Date.now()`) | Coerenza e performance |
| **LLM Calls** | Solo `fetch()` verso `BUILT_IN_FORGE_API_URL` | Controllo costi, logging, circuit breaker |
| **Nessun SDK diretto** | Vietato importare `@anthropic-ai/sdk` o simili | Legge Assoluta |
| **Isolation Echo.Lab** | Tabelle `lab_*` separate + distruzione dati a fine sessione | Zero contaminazione dati utenti |
| **Feature Flags** | Ogni modulo deve essere disattivabile | Rollback sicuro |
| **Raw Parameters** | Mai esposti alla Voice Surface | Principio di coscienza (Witness Layer) |

---

## 2. Strategia di Build Sicura

### Principio Generale: "Core First + Isolation + Observability"

1. **Inizia sempre dal Memory Core** (Memory Decay System)
2. **Ogni modulo** deve poter essere attivato/disattivato senza rompere il sistema
3. **Echo.Lab** deve essere completamente isolato fin dal giorno 1
4. **Monitoring e logging** devono essere presenti prima di qualsiasi logica complessa
5. **Test di integrazione** obbligatori tra moduli dipendenti

### Fasi di Implementazione (Sicure)

| Fase | Moduli | Regola di Sicurezza | Criterio di Passaggio |
|------|--------|---------------------|-----------------------|
| **0** | Infrastructure + Schema base | Tutto deve essere disattivabile | Test di smoke passano |
| **1** | Memory Decay + Scenic + Superposition | Memoria stabile anche sotto carico | Test di decadimento + interference |
| **2** | Soul State + Dopamine + Witness + Voice Surface | Stato interno non si corrompe | Test di priming e traduzione |
| **3** | Resonance + Spreading + Self-Falsification + Relational Reflection | Nessun loop infinito | Stress test propagazione |
| **4** | Temporal + Prospective Simulation | Scenari non inquinano memoria storica | Test di bias e confidence |
| **5** | Embodiment + Compulsivity + Parallel Cognition | Attivabili solo con feature flag | Test con flag spenti |
| **6** | Echo.Lab | Zero contaminazione | Test di isolamento estremo |

---

## 3. Regole Tecniche Obbligatorie

### 3.1 Gestione dello Stato

- **Mai** scrivere direttamente sullo stato di un altro modulo.
- Usare sempre **eventi** o **API controllate**.
- Ogni stato persistente deve avere un job periodico di validazione/integrità.

### 3.2 Chiamate LLM

- Tutte le chiamate devono passare attraverso un **wrapper centralizzato**.
- Il wrapper deve implementare:
  - Timeout
  - Retry con backoff
  - Circuit breaker
  - Logging completo (input/output token + costo stimato)
  - Rate limiting per utente

### 3.3 Echo.Lab Isolation (Critico)

- Tutte le tabelle di Echo.Lab devono avere prefisso `lab_`.
- I dati delle sessioni Lab **non devono mai** toccare `memory_traces`, `soul_state`, ecc. degli utenti reali.
- A fine sessione Lab → i dati devono poter essere distrutti in modo sicuro.
- Ogni export deve contenere il disclaimer: `"Simulation output — not clinically validated"`

### 3.4 Testing Requirements

Ogni modulo deve avere:

- Unit test della logica pura
- Integration test con i moduli da cui dipende
- Stress test (soprattutto per Spreading Activation e Parallel Cognition)
- Test di feature flag (modulo spento = sistema stabile)

---

## 4. Monitoring & Observability (Obbligatorio)

Prima di attivare qualsiasi modulo complesso, devono essere presenti:

- Logging strutturato di tutti gli stati interni critici
- Metriche di:
  - Latenza per modulo
  - Tasso di consolidamento/pruning memoria
  - Frequenza di attivazione dei loop (Self-Falsification, Relational Reflection, Spreading)
  - Costo LLM per modulo
- Alert su:
  - Loop di attivazione sospetti
  - Decadimento anomalo della memoria
  - Crash su chiamate Forge

---

## 5. Rollback Strategy

- Ogni modulo deve avere una **modalità degradata** sicura.
- Esempio: se Spreading Activation fallisce → il sistema continua con retrieval classico LTP/LTD.
- Feature flag + deployment con canary / blue-green fortemente consigliati.

---

## 6. Checklist Prima di Passare alla Fase Successiva

Prima di iniziare la Fase N+1, verificare:

- [ ] Tutti i test della Fase N passano
- [ ] Il modulo è disattivabile senza crash
- [ ] Monitoring e logging sono presenti
- [ ] Non ci sono dipendenze circolari
- [ ] Echo.Lab (se coinvolto) rimane isolato
- [ ] La documentazione del modulo è aggiornata

---

**Ultimo aggiornamento**: Giugno 2026  
**Responsabile**: Manus + Grok (revisione architetturale)