import React, { useState } from 'react';
import { DRAFT, fmt } from './mock';

const card: React.CSSProperties = { background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' };
const lbl: React.CSSProperties = { fontSize: 10, letterSpacing: 1, fontWeight: 800, color: 'var(--muted)', marginBottom: 6 };
const rule: React.CSSProperties = { fontSize: 11, color: 'var(--warn-text)', background: 'var(--warn-wash)', borderRadius: 10, padding: '8px 12px', marginTop: 12, lineHeight: 1.5 };
const btn = (on: boolean): React.CSSProperties => ({
  border: '1px solid var(--line)', background: on ? 'var(--navy)' : '#fff',
  color: on ? '#fff' : 'var(--muted)', borderRadius: 999, padding: '7px 14px',
  fontSize: 12, fontWeight: 700, cursor: 'pointer',
});

/* ---------- Speaker ---------- */
type SpkQ = 'bills' | 'spend' | 'balance' | 'transfer';
function Speaker() {
  const [log, setLog] = useState<{ who: 'you' | 'dev'; text: string; sensitive?: boolean }[]>([]);
  const ask = (q: SpkQ) => {
    const m: Record<SpkQ, { you: string; dev: string; sensitive?: boolean }> = {
      bills: { you: 'What bills are due?', dev: 'Singtel S$48.20 due 18 Oct, and SP Group S$96.40 due 21 Oct.' },
      spend: { you: 'How much did I spend on dining?', dev: 'S$312.50 this month — 62% of your dining budget.' },
      balance: { you: "What's my balance?", dev: 'That needs a stronger identity check — I pinged your phone to confirm it\'s you.', sensitive: true },
      transfer: { you: 'Pay Mum two hundred', dev: 'Draft created and sent to your phone — approve it there with Face ID. I never take spoken approval.', sensitive: true },
    };
    setLog(l => [...l, { who: 'you', text: m[q].you }, { who: 'dev', text: m[q].dev, sensitive: m[q].sensitive }]);
  };
  return (
    <div style={{ ...card, padding: 22, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--navy)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20 }}>🔊</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Smart speaker / home assistant</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Voice answers for weak-identity questions · sensitive ones ping the phone</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0' }}>
        <button style={btn(false)} onClick={() => ask('bills')}>“What bills are due?”</button>
        <button style={btn(false)} onClick={() => ask('spend')}>“Dining spend this month?”</button>
        <button style={btn(false)} onClick={() => ask('balance')}>“What's my balance?”</button>
        <button style={btn(false)} onClick={() => ask('transfer')}>“Pay Mum $200”</button>
      </div>
      <div style={{ background: 'var(--bg)', borderRadius: 14, padding: 14, minHeight: 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {log.length === 0 && <span style={{ color: 'var(--faint)', fontSize: 13 }}>Tap a question to hear how the speaker answers…</span>}
        {log.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.who === 'you' ? 'flex-end' : 'flex-start',
            background: m.sensitive ? 'var(--warn-wash)' : m.who === 'you' ? 'var(--navy)' : '#fff',
            color: m.who === 'you' ? '#fff' : 'var(--text)',
            border: m.who === 'dev' && !m.sensitive ? '1px solid var(--line)' : 'none',
            borderRadius: 12, padding: '9px 13px', fontSize: 13, maxWidth: '85%',
          }}>
            {m.sensitive && <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--warn-text)', marginBottom: 3 }}>📱 PHONE PING</div>}
            {m.text}
          </div>
        ))}
      </div>
      <div style={rule}>Voice is identity-weak — spoken approval is never accepted. Sensitive answers require a phone ping; payments always end at the phone.</div>
    </div>
  );
}

/* ---------- Earbuds ---------- */
function Earbuds() {
  const [mode, setMode] = useState<'music' | 'read' | 'fraud'>('music');
  return (
    <div style={{ ...card, padding: 22, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--navy)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20 }}>🎧</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Wireless earbuds</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Private read-aloud · fraud warnings interrupt media · any BT earbuds</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button style={btn(mode === 'music')} onClick={() => setMode('music')}>🎵 Listening to music</button>
        <button style={btn(mode === 'read')} onClick={() => setMode('read')}>Read my draft aloud</button>
        <button style={btn(mode === 'fraud')} onClick={() => setMode('fraud')}>⚠ Fraud alert arrives</button>
      </div>
      <div style={{ background: 'var(--navy)', color: '#fff', borderRadius: 14, padding: 18 }}>
        {mode === 'music' && (
          <>
            <div style={lbl}>NOW PLAYING</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Espresso — Sabrina Carpenter</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 18, opacity: 0.85 }}>⏮ ▶ ⏭</div>
          </>
        )}
        {mode === 'read' && (
          <>
            <div style={{ ...lbl, color: 'var(--ok)' }}>READING DRAFT — media ducked</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              “{fmt(DRAFT.amountCents)} to {DRAFT.to}, account ending {DRAFT.toLast4}, reference {DRAFT.ref}.
              Approve on your phone — hold for Face ID.”
            </div>
          </>
        )}
        {mode === 'fraud' && (
          <>
            <div style={{ ...lbl, color: '#ffb3a8' }}>FRAUD WARNING — media paused</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              “A draft for S$2,000 to an unknown payee was just created. If someone told you to
              make this transfer, hang up — I'll keep it frozen either way.”
            </div>
          </>
        )}
      </div>
      <div style={rule}>PINs and card numbers are never spoken. Read-aloud uses the draft's own typed fields — free text is never rendered to speech.</div>
    </div>
  );
}

/* ---------- Car ---------- */
function Car() {
  const [moving, setMoving] = useState(true);
  const [asked, setAsked] = useState<null | 'parking' | 'fuel'>(null);
  return (
    <div style={{ ...card, padding: 22, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--navy)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20 }}>🚗</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>In-car (CarPlay / Android Auto / IVI)</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Audio-first while moving · card only at standstill</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button style={btn(moving)} onClick={() => setMoving(true)}>🚙 Driving</button>
        <button style={btn(!moving)} onClick={() => setMoving(false)}>🅿 Stopped</button>
        <button style={btn(asked === 'parking')} onClick={() => setAsked('parking')}>“Pay my parking fee”</button>
        <button style={btn(asked === 'fuel')} onClick={() => setAsked('fuel')}>“Fuel spend this month?”</button>
      </div>
      <div style={{ background: 'var(--navy)', borderRadius: 14, padding: 18, color: '#fff', minHeight: 150 }}>
        {moving ? (
          <>
            <div style={lbl}>AUDIO-ONLY — VEHICLE IN MOTION</div>
            {asked === 'parking' && <div style={{ fontSize: 14, lineHeight: 1.6 }}>“Parking at Marina Square — S$6.40 for 2h 15m. I've drafted it; approve on your phone when you stop.”</div>}
            {asked === 'fuel' && <div style={{ fontSize: 14, lineHeight: 1.6 }}>“You've spent S$214.80 on fuel this month across 4 fill-ups.”</div>}
            {!asked && <div style={{ color: 'var(--faint)', fontSize: 13 }}>No card while the car is moving — everything is spoken.</div>}
          </>
        ) : (
          <>
            <div style={{ ...lbl, color: 'var(--ok)' }}>VEHICLE STOPPED — CARD AVAILABLE</div>
            {asked === 'parking' ? (
              <div style={{ background: '#fff', color: 'var(--text)', borderRadius: 12, padding: 14, marginTop: 8 }}>
                <div style={{ fontWeight: 800 }}>Parking — Marina Square</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>S$6.40 · 2h 15m · from Savings ····2201</div>
                <div style={{ marginTop: 10, background: 'var(--bg)', borderRadius: 8, padding: 9, textAlign: 'center', fontSize: 12, fontWeight: 700 }}>Approve on your phone →</div>
              </div>
            ) : (
              <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>Fuel this month: <b>S$214.80</b> across 4 fill-ups. Ask about parking to see the standstill card.</div>
            )}
          </>
        )}
      </div>
      <div style={rule}>No scrolling, typing, or authorising while driving — the card exists only at standstill, and it still can't sign.</div>
    </div>
  );
}

export function Surfaces() {
  return (
    <div style={{ flex: 1, padding: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      <Speaker />
      <Earbuds />
      <Car />
      <div style={{ width: '100%', fontSize: 12, color: 'var(--faint)', textAlign: 'center' }}>
        Feasibility demos — every surface proposes and reads; the phone approves. The same mock draft object drives all three.
      </div>
    </div>
  );
}
