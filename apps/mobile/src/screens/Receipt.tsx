import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { DRAFT, fmt } from '../mock';

export function Receipt({ onAudit, onHome, draft = DRAFT }: { onAudit: () => void; onHome: () => void; draft?: typeof DRAFT }) {
  return (
    <View style={s.c}>
      <View style={s.check}><Text style={s.checkT}>✓</Text></View>
      <Text style={s.h}>Sent</Text>
      <Text style={s.amt}>{fmt(draft.amountCents)}</Text>
      <Text style={s.to}>to {draft.to} ····{draft.toLast4}</Text>
      <View style={s.card}>
        <View style={s.row}><Text style={s.rowL}>Transaction</Text><Text style={s.rowV}>TXN-88214</Text></View>
        <View style={s.row}><Text style={s.rowL}>Draft</Text><Text style={s.rowV}>{draft.id}</Text></View>
        <View style={s.row}><Text style={s.rowL}>Signed</Text><Text style={s.rowV}>Face ID · this device</Text></View>
        <View style={s.row}><Text style={s.rowL}>Reference</Text><Text style={s.rowV}>{draft.ref}</Text></View>
        <View style={s.row}><Text style={s.rowL}>Audit chain</Text><Text style={[s.rowV, { color: T.ok }]}>intact ✓</Text></View>
      </View>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={s.cta} onPress={onAudit} accessibilityRole="button">
        <Text style={s.ctaT}>Why did the agent do this? — audit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.sec} onPress={onHome} accessibilityRole="button">
        <Text style={s.secT}>Back to home</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg, padding: 20, alignItems: 'center' },
  check: { width: 72, height: 72, borderRadius: 36, backgroundColor: T.ok, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  checkT: { color: '#fff', fontSize: 34, fontWeight: '800' },
  h: { fontSize: 22, fontWeight: '800', color: T.text, marginTop: 16 },
  amt: { fontSize: 40, fontWeight: '300', color: T.text, marginTop: 8 },
  to: { fontSize: 15, color: T.muted, marginTop: 4, marginBottom: 22 },
  card: { backgroundColor: T.surface, borderRadius: 20, padding: 18, width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  rowL: { fontSize: 12, color: T.muted },
  rowV: { fontSize: 13, fontWeight: '700', color: T.text },
  cta: { backgroundColor: T.navy, borderRadius: 16, paddingVertical: 17, alignItems: 'center', width: '100%' },
  ctaT: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sec: { marginTop: 10, paddingVertical: 12 },
  secT: { color: T.muted, fontSize: 14, fontWeight: '600' },
});
