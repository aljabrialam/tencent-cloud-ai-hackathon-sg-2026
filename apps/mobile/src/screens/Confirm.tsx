import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { DRAFT, MULTI_STEPS, fmt } from '../mock';

const Row = ({ l, v, big }: { l: string; v: string; big?: boolean }) => (
  <View style={s.row}>
    <Text style={s.rowL}>{l}</Text>
    <Text style={[s.rowV, big && s.rowBig]}>{v}</Text>
  </View>
);

export function Confirm({ onAuthorise, multi = false }: { onAuthorise: () => void; multi?: boolean }) {
  return (
    <View style={s.c}>
      <Text style={s.tag}>READY TO AUTHORISE</Text>
      <Text style={s.h}>Check this before I send it</Text>
      {multi ? (
        <View style={s.card}>
          <View style={s.badgeRow}><View style={s.vb}><Text style={s.vbT}>✓ Validated — both steps agreed</Text></View></View>
          {MULTI_STEPS.map(st => (
            <View key={st.n} style={s.step}>
              <View style={s.stepN}><Text style={s.stepNT}>{st.n}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepLbl}>{st.label}</Text>
                <Text style={s.stepDet}>{st.detail}</Text>
              </View>
            </View>
          ))}
          <View style={s.div} />
          <Row l="Source" v={DRAFT.from} />
          <Row l="Policy tier" v="Combined — biometric" />
          <Row l="Expires" v="60 s" />
        </View>
      ) : (
        <View style={s.card}>
          <View style={s.badgeRow}><View style={s.vb}><Text style={s.vbT}>✓ Validation model agreed</Text></View></View>
          <Row l="Payee" v={`${DRAFT.to} ····${DRAFT.toLast4}`} />
          <Row l="Amount" v={`${fmt(DRAFT.amountCents)} — ${DRAFT.amountWords}`} big />
          <Row l="From" v={DRAFT.from} />
          <Row l="Balance after" v={fmt(DRAFT.balanceAfter)} />
          <Row l="Reference" v={DRAFT.ref} />
          <Row l="Policy tier" v={DRAFT.tier} />
          <View style={s.div} />
          <View style={s.hashRow}>
            <Text style={s.hash}>draft {DRAFT.id} · expires {DRAFT.expiresIn}s</Text>
            <Text style={s.hashSub}>Edit anything? It needs a fresh draft.</Text>
          </View>
        </View>
      )}
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={s.cta} onPress={onAuthorise} accessibilityRole="button" accessibilityLabel="Authorise with Face ID">
        <Text style={s.ctaT}>Hold to authorise · Face ID</Text>
      </TouchableOpacity>
      <Text style={s.foot}>Only this device can sign. Your glasses and watch can show this card — they can't approve it.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg, padding: 20 },
  tag: { fontSize: 11, letterSpacing: 1.2, fontWeight: '800', color: T.red },
  h: { fontSize: 24, fontWeight: '800', color: T.text, marginTop: 6, marginBottom: 18 },
  card: { backgroundColor: T.surface, borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  badgeRow: { marginBottom: 12 },
  vb: { alignSelf: 'flex-start', backgroundColor: T.okWash, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  vbT: { fontSize: 11, fontWeight: '700', color: T.ok },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  rowL: { fontSize: 12, color: T.muted },
  rowV: { fontSize: 13, fontWeight: '700', color: T.text, textAlign: 'right', flex: 1 },
  rowBig: { fontSize: 15 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  stepN: { width: 28, height: 28, borderRadius: 14, backgroundColor: T.navy, alignItems: 'center', justifyContent: 'center' },
  stepNT: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stepLbl: { fontSize: 14, fontWeight: '700', color: T.text },
  stepDet: { fontSize: 12, color: T.muted, marginTop: 1 },
  div: { height: 1, backgroundColor: T.line, marginVertical: 8 },
  hashRow: {},
  hash: { fontSize: 11, color: T.muted, fontFamily: 'Courier' },
  hashSub: { fontSize: 11, color: T.warnText, marginTop: 4 },
  cta: { backgroundColor: T.red, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  ctaT: { color: '#fff', fontSize: 16, fontWeight: '800' },
  foot: { textAlign: 'center', fontSize: 11, color: T.muted, marginTop: 12, lineHeight: 16 },
});
