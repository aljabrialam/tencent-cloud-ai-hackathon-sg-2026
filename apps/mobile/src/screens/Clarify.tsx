import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { PAYEES } from '../mock';
import { TopBar } from './chrome';

export function Clarify({ onPick }: { onPick: () => void }) {
  const johns = PAYEES.filter(p => p.name.startsWith('John'));
  return (
    <View style={s.c}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.h}>One question</Text>
        <Text style={s.hsub}>"Send fifty to John"</Text>
        <View style={s.bubble}>
          <Text style={s.bubbleT}>I found two payees named <Text style={{ fontWeight: '800' }}>John</Text>. Which one?</Text>
        </View>
        {johns.map((p, i) => (
          <TouchableOpacity key={p.id} style={[s.opt, i === 0 && s.optSel]} onPress={onPick} accessibilityRole="button">
            <View style={[s.oi, i === 0 && s.oiSel]}>
              <Text style={[s.oiT, i === 0 && { color: '#fff' }]}>{i === 0 ? '✓' : p.name[0]}</Text>
            </View>
            <View>
              <Text style={s.optT}><Text style={{ fontWeight: '800' }}>{p.name}</Text> · PayNow ····{p.last4}</Text>
              <Text style={s.optSub}>{p.note}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={s.opt}>
          <View style={s.oi}><Text style={s.oiT}>✕</Text></View>
          <Text style={s.optT}><Text style={{ fontWeight: '800' }}>Neither of these</Text></Text>
        </View>
        <View style={s.bubble}>
          <Text style={s.bubbleT}>And <Text style={{ fontWeight: '800' }}>fifty dollars — S$50.00</Text>, correct?</Text>
        </View>
        <View style={s.chips}>
          <TouchableOpacity style={[s.chip, s.chipSel]} onPress={onPick} accessibilityRole="button">
            <Text style={[s.chipT, s.chipSelT]}>Yes, S$50.00</Text>
          </TouchableOpacity>
          <View style={s.chip}><Text style={s.chipT}>No — type it</Text></View>
        </View>
        <View style={s.foot}><Text style={s.footT}>💬 I ask. I never guess.   ● ○</Text></View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  h: { fontSize: 21, fontWeight: '800', color: T.text, paddingHorizontal: 16, paddingTop: 10 },
  hsub: { fontSize: 11, color: T.muted, paddingHorizontal: 16, paddingBottom: 8, marginTop: 2 },
  bubble: { backgroundColor: T.surface, borderRadius: 18, borderBottomLeftRadius: 4, padding: 12, marginHorizontal: 14, marginVertical: 6, maxWidth: '88%' },
  bubbleT: { fontSize: 12, color: T.text, lineHeight: 18 },
  opt: { backgroundColor: T.surface, borderWidth: 1.5, borderColor: T.line, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, marginHorizontal: 14, marginVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 10 },
  optSel: { borderColor: T.ok, backgroundColor: T.okWash },
  oi: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EFEFED', alignItems: 'center', justifyContent: 'center' },
  oiSel: { backgroundColor: T.okText },
  oiT: { fontSize: 11, fontWeight: '700', color: T.muted },
  optT: { fontSize: 11, color: T.text },
  optSub: { fontSize: 9, color: T.muted, marginTop: 2 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginTop: 6 },
  chip: { flex: 1, borderWidth: 1.5, borderColor: T.blue, borderRadius: 14, paddingVertical: 9, alignItems: 'center', backgroundColor: '#fff' },
  chipSel: { borderColor: T.okText, backgroundColor: T.okWash },
  chipT: { fontSize: 10, fontWeight: '600', color: T.blue },
  chipSelT: { color: T.okText },
  foot: { paddingHorizontal: 16, paddingVertical: 8 },
  footT: { fontSize: 9, color: T.faint },
});
