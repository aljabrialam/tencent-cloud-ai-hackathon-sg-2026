import React, { useState } from 'react';
import { BankWeb } from './BankWeb';
import { Surfaces } from './Surfaces';

export function App() {
  const [view, setView] = useState<'bank' | 'surfaces'>('bank');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* digibank web chrome */}
      <header style={{ background: 'var(--navy)', color: '#fff', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color: 'var(--red)', fontWeight: 800, fontSize: 17, letterSpacing: 0.5, background: '#fff', borderRadius: 6, padding: '3px 8px' }}>DBS</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>digiVoice</span>
        <span style={{ color: '#9fb3bf', fontSize: 12 }}>on digibank web · mock</span>
        <div style={{ flex: 1 }} />
        <nav style={{ display: 'flex', gap: 6 }}>
          {([['bank', 'Desktop banking'], ['surfaces', 'Future surfaces']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} style={{
              background: view === k ? 'rgba(255,255,255,.14)' : 'transparent',
              color: view === k ? '#fff' : '#9fb3bf',
              border: 0, borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{l}</button>
          ))}
        </nav>
      </header>
      {view === 'bank' ? <BankWeb /> : <Surfaces />}
    </div>
  );
}
