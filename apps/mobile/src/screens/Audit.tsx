import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { AUDITS, AuditEv } from '../mock';
import { TopBar } from './chrome';

const DOT: Record<string, string> = { ok: T.ok, wr: T.warn, rd: T.err };

export function Audit({ onHome, entries }: { onHome: () => void; entries?: AuditEv[] }) {
  const evs = entries ?? AUDITS['Happy path'];
  return (
    <View style={s.c}>
      <TopBar />
      <Text style={s.h}>Why did the agent do this?</Text>
      <View style={s.pills}>
        <View style={s.pillOk}><Text style={s.pillOkT}>⛓ Chain intact</Text></View>
        <View style={s.pillBl}><Text style={s.pillBlT}>export ⤓</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={s.tl}>
        <View style={s.line} />
        {evs.map((e, i) => (
          <View key={i} style={s.ev}>
            <View style={[s.dot, { backgroundColor: DOT[e.t ?? 'ok'] }]} />
            <View style={{ flex: 1 }}>
              <View style={s.evTop}>
                <Text style={s.evV}>{e.v}</Text>
                <Text style={s.evTm}>{e.tm}</Text>
              </View>
              <Text style={s.evD}>{e.d}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 14 }} />
      </ScrollView>
      <TouchableOpacity style={s.cta} onPress={onHome} accessibilityRole="button">
        <Text style={s.ctaT}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  h: { fontSize: 18, fontWeight: '800', color: T.text, paddingHorizontal: 16, paddingTop: 8 },
  pills: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 8 },
  pillOk: { backgroundColor: T.okWash, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillOkT: { fontSize: 9, fontWeight: '700', color: T.okText },
  pillBl: { backgroundColor: T.blueWash, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillBlT: { fontSize: 9, fontWeight: '700', color: T.blue },
  tl: { marginHorizontal: 16, paddingLeft: 18 },
  line: { position: 'absolute', left: 5, top: 6, bottom: 6, width: 1.5, backgroundColor: T.line },
  ev: { flexDirection: 'row', paddingVertical: 5 },
  dot: { position: 'absolute', left: -16, top: 9, width: 8, height: 8, borderRadius: 4 },
  evTop: { flexDirection: 'row', justifyContent: 'space-between' },
  evV: { fontSize: 11, fontWeight: '800', color: T.text },
  evTm: { fontSize: 8, color: T.faint },
  evD: { fontSize: 10, color: T.muted, marginTop: 1, lineHeight: 14 },
  cta: { backgroundColor: T.navy, borderRadius: 999, paddingVertical: 14, marginHorizontal: 16, marginBottom: 10, alignItems: 'center' },
  ctaT: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
