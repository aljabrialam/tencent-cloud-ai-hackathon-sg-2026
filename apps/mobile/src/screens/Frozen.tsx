import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { DRAFT, fmt } from '../mock';

export function Frozen({ onAudit }: { onAudit: () => void }) {
  return (
    <View style={s.c}>
      <Text style={s.tag}>FROZEN — NOT EXECUTED</Text>
      <Text style={s.h}>I stopped this for you</Text>
      <Text style={s.sub}>The drafting model and the independent validation model disagree on what you meant. Nothing moved, nothing signed.</Text>
      <View style={s.card}>
        <Text style={s.cardLbl}>YOU SAID</Text>
        <Text style={s.cardT}>“two thousand to John”</Text>
        <Text style={s.cardLbl}>DRAFT SHOWED</Text>
        <Text style={[s.cardT, { textDecorationLine: 'line-through', color: T.muted }]}>{fmt(50000)} to John Tan</Text>
        <Text style={s.cardLbl}>VALIDATOR READ</Text>
        <Text style={s.cardT}>{fmt(200000)} to John</Text>
        <View style={s.err}><Text style={s.errT}>VAL-MISMATCH — amount in draft doesn't match the transcript</Text></View>
      </View>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={s.cta} onPress={onAudit} accessibilityRole="button">
        <Text style={s.ctaT}>See exactly why — audit trail</Text>
      </TouchableOpacity>
      <Text style={s.foot}>Frozen drafts can't be edited or forced through. Start over and I'll re-draft.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg, padding: 20 },
  tag: { fontSize: 11, letterSpacing: 1.2, fontWeight: '800', color: T.err },
  h: { fontSize: 24, fontWeight: '800', color: T.text, marginTop: 6 },
  sub: { fontSize: 14, color: T.muted, lineHeight: 21, marginTop: 8, marginBottom: 18 },
  card: { backgroundColor: T.surface, borderRadius: 20, padding: 18 },
  cardLbl: { fontSize: 10, letterSpacing: 1, fontWeight: '800', color: T.muted, marginTop: 10, marginBottom: 4 },
  cardT: { fontSize: 15, fontWeight: '700', color: T.text },
  err: { backgroundColor: T.errWash, borderRadius: 12, padding: 12, marginTop: 14 },
  errT: { fontSize: 12, color: T.err, fontWeight: '600', lineHeight: 18 },
  cta: { backgroundColor: T.navy, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  ctaT: { color: '#fff', fontSize: 15, fontWeight: '800' },
  foot: { textAlign: 'center', fontSize: 11, color: T.muted, marginTop: 12, lineHeight: 16 },
});
