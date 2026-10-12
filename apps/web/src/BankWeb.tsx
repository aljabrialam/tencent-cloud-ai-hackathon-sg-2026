import React, { useState } from 'react';
import { DRAFT, AUDIT, fmt, WebState } from './mock';

const card: React.CSSProperties = { background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' };
const lbl: React.CSSProperties = { fontSize: 10, letterSpacing: 1, fontWeight: 800, color: 'var(--muted)', marginBottom: 6 };
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 };

function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div style={row}>
      <span style={{ color: 'var(--muted)' }}>{l}</span>
      <span style={{ fontWeight: 700, fontSize: strong ? 15 : 13, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

function DraftCard({ frozen }: { frozen?: boolean }) {
  return (
    <div style={{ ...card, padding: 22, opacity: frozen ? 0.75 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          background: frozen ? 'var(--err-wash)' : 'var(--ok-wash)',
          color: frozen ? 'var(--err)' : 'var(--ok)',
          borderRadius: 999, padding: '5px 11px', fontSize: 11, fontWeight: 700,
        }}>
          {frozen ? '✗ Frozen — validator disagreement' : '✓ Validation model agreed'}
        </span>
      </div>
      <Row l="Payee" v={`${DRAFT.to} ····${DRAFT.toLast4}`} />
      <Row l="Amount" v={`${fmt(DRAFT.amountCents)} — ${DRAFT.amountWords}`} strong />
      <Row l="From" v={DRAFT.from} />
      <Row l="Balance after" v={fmt(DRAFT.balanceAfter)} />
      <Row l="Reference" v={DRAFT.ref} />
      <Row l="Policy tier" v={DRAFT.tier} />
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 10, paddingTop: 12 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>draft {DRAFT.id}</div>
        <div style={{ fontSize: 11, color: frozen ? 'var(--err)' : 'var(--warn-text)', marginTop: 4 }}>
          {frozen ? 'This draft is dead — it cannot be edited or forced through.' : 'Edit anything? It needs a fresh draft.'}
        </div>
      </div>
      <div style={{ marginTop: 16, background: 'var(--bg)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Approve on your phone →</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          The browser can capture and review drafts. Only the phone signs.
        </div>
      </div>
    </div>
  );
}

export function BankWeb() {
  const [state, setState] = useState<WebState>('draft');
  return (
    <div style={{ display: 'flex', flex: 1 }}>
      {/* digibank left nav */}
      <aside style={{ width: 200, background: 'var(--surface)', borderRight: '1px solid var(--line)', padding: '20px 14px' }}>
        {['Home', 'Accounts', 'Pay & Transfer', 'Invest', 'Apply', 'More'].map((n, i) => (
          <div key={n} style={{
            padding: '11px 12px', borderRadius: 10, fontSize: 13, marginBottom: 2,
            fontWeight: i === 2 ? 800 : 500, color: i === 2 ? 'var(--red)' : 'var(--text)',
            background: i === 2 ? 'var(--red-wash)' : 'transparent',
          }}>{n}</div>
        ))}
        <div style={{ marginTop: 24, padding: 12, background: 'var(--bg)', borderRadius: 12 }}>
          <div style={lbl}>SIGNING RULE</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            This session is display-only. Your phone is the sole signer.
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* chat transcript */}
        <section style={{ ...card, flex: 1.2, padding: 20, minHeight: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={lbl}>DIGIVOICE — TRANSCRIPT</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['draft', 'clarify', 'frozen', 'audit'] as const).map(st => (
                <button key={st} onClick={() => setState(st)} style={{
                  border: '1px solid var(--line)', background: state === st ? 'var(--navy)' : '#fff',
                  color: state === st ? '#fff' : 'var(--muted)', borderRadius: 999,
                  padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>{st}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ alignSelf: 'flex-end', background: 'var(--navy)', color: '#fff', borderRadius: 16, borderBottomRightRadius: 4, padding: '12px 16px', maxWidth: '80%', fontSize: 14 }}>
              “pay mum two hundred for groceries”
            </div>
            {state === 'clarify' && (
              <>
                <div style={{ alignSelf: 'flex-start', background: 'var(--bg)', borderRadius: 16, borderTopLeftRadius: 4, padding: '12px 16px', maxWidth: '85%', fontSize: 14 }}>
                  I found two payees named <b>John</b>. Which one?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ border: '1.5px solid var(--blue)', color: 'var(--blue)', background: '#fff', borderRadius: 12, padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }} onClick={() => setState('draft')}>John Tan ····4521</button>
                  <button style={{ border: '1.5px solid var(--blue)', color: 'var(--blue)', background: '#fff', borderRadius: 12, padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }} onClick={() => setState('draft')}>John Lim ····8892</button>
                </div>
              </>
            )}
            {state === 'frozen' && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--err-wash)', borderRadius: 16, borderTopLeftRadius: 4, padding: '12px 16px', maxWidth: '85%', fontSize: 13, color: 'var(--err)', fontWeight: 600, lineHeight: 1.5 }}>
                I stopped this for you — the validator read the amount differently from the draft. Nothing moved. Logged as VAL-MISMATCH.
              </div>
            )}
            {state === 'audit' && (
              <div>
                {AUDIT.map(e => (
                  <div key={e.id} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                    <span className="mono" style={{ color: 'var(--faint)', fontSize: 11, minWidth: 46 }}>{e.id}</span>
                    <span>{e.ev}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: 'var(--ok)' }}>✓ chain verified — {AUDIT.length} entries</div>
              </div>
            )}
            {state === 'draft' && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg)', borderRadius: 16, borderTopLeftRadius: 4, padding: '12px 16px', maxWidth: '85%', fontSize: 14 }}>
                Drafted {fmt(DRAFT.amountCents)} to {DRAFT.to} — review the card, then approve on your phone.
              </div>
            )}
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            <input placeholder="Type a request…" style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 24, padding: '11px 16px', fontSize: 13, outline: 'none' }} />
            <button style={{ background: 'var(--red)', color: '#fff', border: 0, borderRadius: 24, padding: '11px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>🎙 Speak</button>
          </div>
        </section>

        {/* draft card */}
        <section style={{ flex: 1 }}>
          <DraftCard frozen={state === 'frozen'} />
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--faint)', textAlign: 'center' }}>
            Mock data — same draft object the phone, watch, and glasses render.
          </div>
        </section>
      </main>
    </div>
  );
}
