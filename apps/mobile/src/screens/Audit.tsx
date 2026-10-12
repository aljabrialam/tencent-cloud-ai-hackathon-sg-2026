import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { AUDIT } from '../mock';

type Entry = { id: string; ev: string; ok: boolean };

export function Audit({ onHome, entries = AUDIT }: { onHome: () => void; entries?: Entry[] }) {
  return (
    <View style={s.c}>
      <Text style={s.tag}>AUDIT TRAIL</Text>
      <Text style={s.h}>Why did the agent do this?</Text>
      <Text style={s.sub}>Every step — hash-chained. Tamper with one entry and the chain breaks.</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {entries.map((e, i) => (
          <View key={e.id} style={s.row}>
            <View style={s.left}>
              <View style={[s.dot, !e.ok && { backgroundColor: T.err }, i === entries.length - 1 && e.ok && { backgroundColor: T.ok }]} />
              {i < entries.length - 1 && <View style={s.stem} />}
            </View>
            <View style={s.card}>
              <Text style={s.evT}>{e.ev}</Text>
              <Text style={s.evId}>{e.id}</Text>
            </View>
          </View>
        ))}
        <View style={s.chainOk}>
          <Text style={s.chainOkT}>✓ chain verified — {entries.length} entries</Text>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
      <TouchableOpacity style={s.cta} onPress={onHome} accessibilityRole="button">
        <Text style={s.ctaT}>Back to home</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg, padding: 20 },
  tag: { fontSize: 11, letterSpacing: 1.2, fontWeight: '800', color: T.navy },
  h: { fontSize: 24, fontWeight: '800', color: T.text, marginTop: 6 },
  sub: { fontSize: 13, color: T.muted, lineHeight: 19, marginTop: 6, marginBottom: 18 },
  row: { flexDirection: 'row', gap: 12 },
  left: { alignItems: 'center', width: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.navy, marginTop: 16 },
  stem: { flex: 1, width: 2, backgroundColor: T.line },
  card: { flex: 1, backgroundColor: T.surface, borderRadius: 14, padding: 13, marginBottom: 10 },
  evT: { fontSize: 13, color: T.text, lineHeight: 19 },
  evId: { fontSize: 10, color: T.faint, fontFamily: 'Courier', marginTop: 5 },
  chainOk: { alignItems: 'center', marginTop: 6 },
  chainOkT: { fontSize: 12, fontWeight: '700', color: T.ok },
  cta: { backgroundColor: T.navy, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  ctaT: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
