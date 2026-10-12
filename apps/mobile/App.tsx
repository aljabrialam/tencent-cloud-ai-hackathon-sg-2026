import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { T } from './src/theme';
import { Stage, DEMO_PATHS } from './src/mock';
import { Home } from './src/screens/Home';
import { Listening } from './src/screens/Listening';
import { Clarify } from './src/screens/Clarify';
import { Confirm } from './src/screens/Confirm';
import { Frozen } from './src/screens/Frozen';
import { Scam } from './src/screens/Scam';
import { Authorise } from './src/screens/Authorise';
import { Receipt } from './src/screens/Receipt';
import { Audit } from './src/screens/Audit';

const SCENARIOS = Object.keys(DEMO_PATHS);

const qs =
  typeof window !== 'undefined' && window.location ? window.location.search : '';
const IS_NATIVE = qs === '';
const AUTO = /[?&]auto=1/.test(qs) || IS_NATIVE; // native demo devices self-walk
const BARE = /[?&]bare=1/.test(qs);

export default function App() {
  const scnMatch = qs.match(/[?&]scn=(\d)/);
  const [scenario, setScenario] = useState(SCENARIOS[scnMatch ? +scnMatch[1] : 0] ?? SCENARIOS[0]);
  const [idx, setIdx] = useState(0);
  const path = DEMO_PATHS[scenario];
  const stage: Stage = path[idx];

  // auto mode — walk the path on a timer for screen recording; on native
  // there are no URL params, so wrap-around advances to the next scenario
  useEffect(() => {
    if (!AUTO) return;
    const t = setInterval(() => {
      setIdx(i => {
        if (i + 1 < path.length) return i + 1;
        if (IS_NATIVE) {
          const next = SCENARIOS[(SCENARIOS.indexOf(scenario) + 1) % SCENARIOS.length];
          setScenario(next);
        }
        return 0;
      });
    }, 3200);
    return () => clearInterval(t);
  }, [path.length, scenario]);

  const go = (s: Stage) => {
    const i = path.indexOf(s);
    if (i >= 0) setIdx(i);
  };
  const next = () => setIdx(i => Math.min(i + 1, path.length - 1));
  const pickScenario = (name: string) => { setScenario(name); setIdx(0); };

  return (
    <View style={s.c}>
      <StatusBar style="dark" />
      {/* demo chrome — not part of the product UI; ?bare=1 hides it for screenshots */}
      {!BARE && (
      <View style={s.chrome}>
        <Text style={s.chromeLbl} numberOfLines={1}>{scenario} · {stage} ({idx + 1}/{path.length})</Text>
        <View style={s.chromeRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            {SCENARIOS.map(n => (
              <TouchableOpacity key={n} onPress={() => pickScenario(n)} style={[s.scn, n === scenario && s.scnOn]}>
                <Text style={[s.scnT, n === scenario && s.scnTOn]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.next} onPress={next} disabled={idx === path.length - 1}>
            <Text style={s.nextT}>Next ›</Text>
          </TouchableOpacity>
        </View>
      </View>
      )}

      <View style={{ flex: 1 }}>
        {stage === 'home' && <Home onMic={() => go('listening')} />}
        {stage === 'listening' && <Listening onStop={next} />}
        {stage === 'clarify' && <Clarify onPick={next} />}
        {stage === 'confirm' && <Confirm onAuthorise={next} />}
        {stage === 'confirm-multi' && <Confirm multi onAuthorise={next} />}
        {stage === 'frozen' && <Frozen onAudit={() => go('audit')} />}
        {stage === 'scam' && <Scam onDone={next} />}
        {stage === 'authorise' && <Authorise onDone={next} />}
        {stage === 'receipt' && <Receipt onAudit={() => go('audit')} onHome={() => setIdx(0)} />}
        {stage === 'audit' && <Audit onHome={() => setIdx(0)} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg, paddingTop: Platform.OS === 'ios' ? 59 : 24 },
  chrome: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: T.line, backgroundColor: T.bg },
  chromeLbl: { fontSize: 11, fontWeight: '700', color: T.muted, marginBottom: 7, fontFamily: 'Courier' },
  chromeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scn: { borderWidth: 1, borderColor: T.line, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, marginRight: 6, backgroundColor: T.surface },
  scnOn: { backgroundColor: T.navy, borderColor: T.navy },
  scnT: { fontSize: 11, fontWeight: '700', color: T.muted },
  scnTOn: { color: '#fff' },
  next: { backgroundColor: T.red, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  nextT: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
