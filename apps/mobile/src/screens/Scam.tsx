import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { SCAM_REASONS } from '../mock';

export function Scam({ onDone }: { onDone: () => void }) {
  return (
    <View style={s.c}>
      <Text style={s.tag}>SCAM SHIELD</Text>
      <Text style={s.h}>This looks like a scam pattern</Text>
      <Text style={s.sub}>Whoever told you to make this transfer is using the same playbook as police-impersonation scams.</Text>
      <View style={s.card}>
        <Text style={s.cardLbl}>WHY I STOPPED IT</Text>
        {SCAM_REASONS.map(r => (
          <View key={r} style={s.reason}><Text style={s.reasonDot}>●</Text><Text style={s.reasonT}>{r}</Text></View>
        ))}
      </View>
      <View style={s.warn}>
        <Text style={s.warnT}>If someone is on the phone telling you to transfer — hang up. Real agencies never ask you to move money.</Text>
      </View>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={s.cta} onPress={onDone} accessibilityRole="button">
        <Text style={s.ctaT}>Call 1799 — ScamShield hotline</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.sec} onPress={onDone} accessibilityRole="button">
        <Text style={s.secT}>I understand — show me the draft anyway</Text>
      </TouchableOpacity>
      <Text style={s.foot}>The draft is frozen for 24h either way. Cooling-off can't be skipped.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.warnWash, padding: 20 },
  tag: { fontSize: 11, letterSpacing: 1.2, fontWeight: '800', color: T.warnText },
  h: { fontSize: 24, fontWeight: '800', color: T.text, marginTop: 6 },
  sub: { fontSize: 14, color: T.text, lineHeight: 21, marginTop: 8, marginBottom: 18 },
  card: { backgroundColor: T.surface, borderRadius: 20, padding: 18 },
  cardLbl: { fontSize: 10, letterSpacing: 1, fontWeight: '800', color: T.warnText, marginBottom: 10 },
  reason: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  reasonDot: { fontSize: 9, color: T.warnText, marginTop: 4 },
  reasonT: { flex: 1, fontSize: 13, color: T.text, lineHeight: 19 },
  warn: { backgroundColor: T.surface, borderLeftWidth: 3, borderLeftColor: T.warnText, borderRadius: 12, padding: 14, marginTop: 14 },
  warnT: { fontSize: 13, color: T.text, lineHeight: 19, fontWeight: '600' },
  cta: { backgroundColor: T.warnText, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  ctaT: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sec: { marginTop: 10, paddingVertical: 14, alignItems: 'center' },
  secT: { color: T.muted, fontSize: 14, fontWeight: '600' },
  foot: { textAlign: 'center', fontSize: 11, color: T.warnText, marginTop: 4 },
});
