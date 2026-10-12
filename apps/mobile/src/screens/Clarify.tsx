import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { PAYEES } from '../mock';

export function Clarify({ onPick }: { onPick: () => void }) {
  const johns = PAYEES.filter(p => p.name.startsWith('John'));
  return (
    <View style={s.c}>
      <View style={s.bubble}>
        <Text style={s.bubbleLbl}>DIGIVOICE</Text>
        <Text style={s.bubbleT}>I found two payees named <Text style={{ fontWeight: '800' }}>John</Text>. Which one?</Text>
      </View>
      {johns.map(j => (
        <TouchableOpacity key={j.id} style={s.opt} onPress={onPick} accessibilityRole="button" accessibilityLabel={`Payee ${j.name}`}>
          <View style={s.oi}><Text style={s.oiT}>{j.name[0]}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.optName}>{j.name}</Text>
            <Text style={s.optSub}>PayNow ····{j.last4} · {j.note}</Text>
          </View>
          <Text style={s.chev}>›</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={s.optDim} onPress={onPick} accessibilityRole="button">
        <Text style={s.optDimT}>Neither of these</Text>
      </TouchableOpacity>
      <View style={s.bubble}>
        <Text style={s.bubbleT}>And “fifty” — <Text style={{ fontWeight: '800' }}>S$50.00</Text>, correct?</Text>
      </View>
      <View style={s.chips}>
        <TouchableOpacity style={s.chip} onPress={onPick}><Text style={s.chipT}>Yes, S$50.00</Text></TouchableOpacity>
        <TouchableOpacity style={s.chip} onPress={onPick}><Text style={s.chipT}>No — type it</Text></TouchableOpacity>
      </View>
      <View style={{ flex: 1 }} />
      <Text style={s.foot}>I ask. I never guess.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg, padding: 18 },
  bubble: { backgroundColor: T.surface, borderRadius: T.radius, borderTopLeftRadius: 4, padding: 14, marginBottom: 14 },
  bubbleLbl: { fontSize: 10, letterSpacing: 1, color: T.red, fontWeight: '800', marginBottom: 5 },
  bubbleT: { fontSize: 15, color: T.text, lineHeight: 22 },
  opt: { backgroundColor: T.surface, borderRadius: T.radius, borderWidth: 1.5, borderColor: T.blue, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  oi: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' },
  oiT: { fontSize: 15, fontWeight: '700', color: T.muted },
  optName: { fontSize: 15, fontWeight: '700', color: T.text },
  optSub: { fontSize: 11, color: T.muted, marginTop: 2 },
  chev: { fontSize: 22, color: T.blue, fontWeight: '300' },
  optDim: { backgroundColor: T.surface, borderRadius: T.radius, borderWidth: 1.5, borderColor: T.line, padding: 13, alignItems: 'center', marginBottom: 14 },
  optDimT: { fontSize: 13, fontWeight: '600', color: T.muted },
  chips: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, borderWidth: 1.5, borderColor: T.blue, borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: T.surface },
  chipT: { fontSize: 13, fontWeight: '700', color: T.blue },
  foot: { textAlign: 'center', fontSize: 11, color: T.muted, fontStyle: 'italic' },
});
