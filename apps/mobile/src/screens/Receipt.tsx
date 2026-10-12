import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { DRAFT, fmt } from '../mock';
import { TopBar } from './chrome';

export function Receipt({ onAudit, onHome, draft = DRAFT }: { onAudit: () => void; onHome: () => void; draft?: typeof DRAFT }) {
  return (
    <View style={s.c}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.check}><Text style={s.checkT}>✓</Text></View>
        <Text style={s.h}>Sent</Text>
        <Text style={s.hsub}>{fmt(draft.amountCents)} to {draft.to} is on its way</Text>
        <View style={s.card}>
          <View style={s.frow}><Text style={s.fk}>Amount</Text><Text style={s.fv}>{fmt(draft.amountCents)}</Text></View>
          <View style={s.frow}><Text style={s.fk}>To</Text><Text style={s.fv}>{draft.to} ····{draft.toLast4}</Text></View>
          <View style={s.frow}><Text style={s.fk}>Txn</Text><Text style={s.fv}>TXN-88214</Text></View>
          <View style={[s.frow, { borderBottomWidth: 0 }]}><Text style={s.fk}>Time</Text><Text style={s.fv}>Today, 21:47:32</Text></View>
        </View>
        <View style={s.ledger}>
          <Text style={s.ledgerT}>👁 <Text style={{ fontWeight: '800' }}>Ledger shows {fmt(draft.balanceAfter)}</Text> — read back, not assumed.</Text>
        </View>
        <TouchableOpacity style={s.cta} onPress={onAudit} accessibilityRole="button">
          <Text style={s.ctaT}>🔍 Why did the agent do this?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onHome} accessibilityRole="button">
          <Text style={s.ghost}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  check: { width: 58, height: 58, borderRadius: 29, backgroundColor: T.okText, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 18, shadowColor: T.ok, shadowOpacity: 0.35, shadowRadius: 9, shadowOffset: { width: 0, height: 6 } },
  checkT: { color: '#fff', fontSize: 26, fontWeight: '800' },
  h: { fontSize: 21, fontWeight: '800', color: T.text, textAlign: 'center', marginTop: 8 },
  hsub: { fontSize: 11, color: T.muted, textAlign: 'center', marginTop: 2, marginBottom: 10 },
  card: { backgroundColor: T.surface, borderRadius: T.radius, marginHorizontal: 14, overflow: 'hidden' },
  frow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.line },
  fk: { fontSize: 10, color: T.muted },
  fv: { fontSize: 11, fontWeight: '700', color: T.text },
  ledger: { backgroundColor: T.okWash, borderWidth: 1, borderColor: '#BFE8D0', borderRadius: 16, marginHorizontal: 14, marginTop: 8, padding: 12 },
  ledgerT: { fontSize: 10, color: T.text },
  cta: { backgroundColor: T.navy, borderRadius: 999, paddingVertical: 14, marginHorizontal: 16, marginTop: 12, alignItems: 'center' },
  ctaT: { color: '#fff', fontSize: 11, fontWeight: '800' },
  ghost: { textAlign: 'center', fontSize: 11, fontWeight: '600', color: T.text, paddingVertical: 10 },
});
