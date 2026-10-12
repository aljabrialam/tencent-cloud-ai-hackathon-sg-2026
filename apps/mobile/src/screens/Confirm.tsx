import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { DRAFT, MULTI_STEPS, fmt } from '../mock';
import { TopBar } from './chrome';

function Row({ k, v, children }: { k: string; v?: string; children?: React.ReactNode }) {
  return (
    <View style={s.frow}>
      <Text style={s.k}>{k}</Text>
      {v ? <Text style={s.v}>{v}</Text> : children}
    </View>
  );
}

export function Confirm({ onAuthorise, multi = false, draft = DRAFT }: { onAuthorise: () => void; multi?: boolean; draft?: typeof DRAFT }) {
  const method = multi ? 'Face ID' : draft.method;
  return (
    <View style={s.c}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.h}>{multi ? 'Confirm 2 steps' : 'Confirm payment'}</Text>
        <Text style={s.hsub}>{multi ? 'One request, two actions — one signature.' : 'Check the details before you authorise.'}</Text>
        <View style={s.card}>
          <View style={s.ch}>
            <View style={s.vb}><Text style={s.vbT}>✓ {multi ? 'Verified' : 'Verified against what you said'}</Text></View>
            <View style={s.spk}><Text style={{ fontSize: 12 }}>🔊</Text></View>
          </View>
          {multi ? (
            <>
              {MULTI_STEPS.map(st => (
                <View key={st.n} style={s.step}>
                  <View style={s.sn}><Text style={s.snT}>{st.n}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stepT}>{st.title}</Text>
                    {st.chip && <View style={s.fchip}><Text style={s.fchipT}>{st.chip}</Text></View>}
                    <Text style={s.stepSub}>{st.sub}</Text>
                  </View>
                </View>
              ))}
              <View style={s.reqrow}><View style={s.ric}><Text style={s.ricT}>◉</Text></View><Text style={s.reqT}>Requires Face ID</Text><View style={s.rulechip}><Text style={s.rulechipT}>Rule POL-TIER-03</Text></View></View>
            </>
          ) : (
            <>
              <View style={s.amtblock}>
                <Text style={s.k}>Amount</Text>
                <Text style={s.big}>{fmt(draft.amountCents)}</Text>
                <Text style={s.words}>{draft.amountWords}</Text>
              </View>
              <Row k="To"><View style={{ alignItems: 'flex-end' }}><Text style={s.v}>{draft.to}</Text><Text style={s.vSub}>{draft.toDetail}</Text></View></Row>
              <Row k="From" v={draft.from} />
              <Row k="Reference" v={draft.ref} />
              <Row k="Balance after" v={fmt(draft.balanceAfter)} />
              <View style={s.reqrow}><View style={s.ric}><Text style={s.ricT}>◉</Text></View><Text style={s.reqT}>{draft.tier}</Text><View style={s.rulechip}><Text style={s.rulechipT}>{draft.rule}</Text></View></View>
            </>
          )}
        </View>
        {multi && (
          <Text style={s.note}>Runs in order. If step 1 fails, step 2 will not run. The model wrote <Text style={{ fontStyle: 'italic' }}>half(remaining)</Text> — code computed the number.</Text>
        )}
        <TouchableOpacity style={s.cta} onPress={onAuthorise} accessibilityRole="button">
          <Text style={s.ctaT}>🔒 AUTHORISE WITH {method.toUpperCase()}</Text>
        </TouchableOpacity>
        <Text style={s.ghost}>Cancel</Text>
        <Text style={s.expiry}>◷ Card expires in 0:{multi ? 49 : draft.expiresIn} · tap any field to edit</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  h: { fontSize: 21, fontWeight: '800', color: T.text, paddingHorizontal: 16, paddingTop: 10 },
  hsub: { fontSize: 11, color: T.muted, paddingHorizontal: 16, paddingBottom: 8, marginTop: 2 },
  card: { backgroundColor: T.surface, borderRadius: T.radius, marginHorizontal: 14, marginVertical: 6, overflow: 'hidden' },
  ch: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.line, flexDirection: 'row', alignItems: 'center' },
  vb: { backgroundColor: T.okText, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  vbT: { color: '#fff', fontSize: 10, fontWeight: '700' },
  spk: { width: 28, height: 28, borderRadius: 14, backgroundColor: T.redWash, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  amtblock: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.line },
  k: { fontSize: 10, color: T.muted },
  big: { fontSize: 30, fontWeight: '800', color: T.text, letterSpacing: -0.5, marginTop: 2 },
  words: { fontSize: 11, color: T.muted, fontStyle: 'italic', marginTop: 1 },
  frow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.line },
  v: { fontSize: 11, fontWeight: '700', color: T.text, textAlign: 'right' },
  vSub: { fontSize: 9, color: T.muted, marginTop: 1 },
  reqrow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FAFAF8' },
  ric: { width: 20, height: 20, borderRadius: 10, backgroundColor: T.redWash, alignItems: 'center', justifyContent: 'center' },
  ricT: { fontSize: 10, color: T.red },
  reqT: { fontSize: 10, fontWeight: '700', color: T.text },
  rulechip: { marginLeft: 'auto', backgroundColor: '#EFEFED', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  rulechipT: { fontSize: 9, color: T.muted, fontWeight: '600' },
  step: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: T.line },
  sn: { width: 18, height: 18, borderRadius: 9, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  snT: { color: '#fff', fontSize: 9, fontWeight: '700' },
  stepT: { fontSize: 11, fontWeight: '700', color: T.text },
  stepSub: { fontSize: 9, color: T.muted, marginTop: 2 },
  fchip: { backgroundColor: T.warnWash, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4, alignSelf: 'flex-start' },
  fchipT: { fontSize: 9, fontWeight: '700', color: T.warnText },
  note: { fontSize: 9, color: T.muted, lineHeight: 14, paddingHorizontal: 16, paddingVertical: 4 },
  cta: { backgroundColor: T.red, borderRadius: 999, paddingVertical: 14, marginHorizontal: 16, marginTop: 10, alignItems: 'center', shadowColor: T.red, shadowOpacity: 0.3, shadowRadius: 7, shadowOffset: { width: 0, height: 4 } },
  ctaT: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  ghost: { textAlign: 'center', fontSize: 11, fontWeight: '600', color: T.text, paddingVertical: 10 },
  expiry: { textAlign: 'center', fontSize: 9, color: T.warnText, fontWeight: '600', paddingBottom: 12 },
});
