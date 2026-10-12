import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { ME, ACCOUNTS } from '../mock';
import { TabBar, TABS } from './chrome';

const ACTIONS = [
  { icon: '🛡', label: 'Security\nHub', dot: true },
  { icon: '⚡', label: 'PayNow' },
  { icon: '🧾', label: 'Bills &\nGIRO' },
  { icon: '🌐', label: 'Overseas' },
  { icon: '💡', label: 'Insights' },
];

export function Home({ onMic }: { onMic: () => void }) {
  return (
    <View style={s.c}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={s.hero}>
          <View style={s.hrow}>
            <View style={s.acctId}>
              <View style={s.dotId}><Text style={s.dotIdT}>◉</Text></View>
              <Text style={s.acctIdT}>digibank</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={s.hbtn}><Text style={s.hbtnT}>🔔</Text></View>
              <View style={s.hbtn}><Text style={s.hbtnT}>💬</Text></View>
            </View>
          </View>
          <Text style={s.greet}>Hi, {ME.name}!</Text>
          <Text style={s.gsub}>Speak or type — I draft it, you approve it</Text>
        </View>
        <View style={s.igrid}>
          {ACTIONS.map(a => (
            <View key={a.label} style={s.it}>
              <View style={s.ic}>
                <Text style={{ fontSize: 14 }}>{a.icon}</Text>
                {a.dot && <View style={s.dot} />}
              </View>
              <Text style={s.itT}>{a.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.sec}><Text style={s.secT}>Your accounts</Text><Text style={s.secL}>View all</Text></View>
        {ACCOUNTS.map(a => (
          <View key={a.id} style={s.acct}>
            <View>
              <Text style={s.acctLbl}>{a.name} ····{a.last4}</Text>
              <Text style={s.acctAmt}>SGD {(a.balanceCents / 100).toLocaleString('en-SG', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={s.aic}><Text style={{ fontSize: 12 }}>{a.icon}</Text></View>
          </View>
        ))}
        <View style={s.sec}><Text style={s.secT}>Recent activity</Text></View>
        <View style={s.rgroup}>
          <View style={[s.rrow, s.rfirst]}>
            <View style={s.av}><Text style={s.avT}>M</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.rTitle}>Mum</Text>
              <View style={s.pillOk}><Text style={s.pillOkT}>✓ Sent</Text></View>
            </View>
            <Text style={s.rAmt}>-S$120.00</Text>
          </View>
          <View style={[s.rrow, s.rlast]}>
            <View style={s.av}><Text style={s.avT}>J</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.rTitle}>John Tan</Text>
              <View style={s.pillGy}><Text style={s.pillGyT}>Cancelled</Text></View>
            </View>
            <Text style={s.rAmt}>S$0.00</Text>
          </View>
        </View>
      </ScrollView>
      <View style={s.dock}>
        <View style={s.typebar}><Text style={s.typebarT}>Type a request…</Text></View>
        <TouchableOpacity style={s.fabmic} onPress={onMic} accessibilityLabel="Tap to talk" accessibilityRole="button">
          <Text style={{ fontSize: 20 }}>🎙</Text>
        </TouchableOpacity>
      </View>
      <TabBar active={0} items={TABS} />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  hero: { backgroundColor: T.red2, paddingBottom: 46, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, marginBottom: -30 },
  hrow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  acctId: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotId: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  dotIdT: { color: '#fff', fontSize: 11 },
  acctIdT: { color: '#fff', fontSize: 11, fontWeight: '700' },
  hbtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  hbtnT: { fontSize: 10 },
  greet: { color: '#fff', fontSize: 24, fontWeight: '800', paddingHorizontal: 16, marginTop: 4 },
  gsub: { color: '#fff', opacity: 0.9, fontSize: 10.5, paddingHorizontal: 16, marginTop: 3 },
  igrid: { flexDirection: 'row', backgroundColor: T.surface, marginHorizontal: 14, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 6 },
  it: { flex: 1, alignItems: 'center', gap: 5 },
  ic: { width: 34, height: 34, borderRadius: 17, backgroundColor: T.redWash, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: T.red, borderWidth: 1.5, borderColor: '#fff' },
  itT: { fontSize: 8, fontWeight: '600', color: T.text, textAlign: 'center', lineHeight: 10 },
  sec: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 16, marginTop: 14, marginBottom: 6 },
  secT: { fontSize: 13, fontWeight: '800', color: T.text },
  secL: { fontSize: 10, color: T.red, fontWeight: '600' },
  acct: { backgroundColor: T.surface, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14, marginHorizontal: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  acctLbl: { fontSize: 10, color: T.muted },
  acctAmt: { fontSize: 15, fontWeight: '800', color: T.text, marginTop: 2 },
  aic: { width: 30, height: 30, borderRadius: 15, backgroundColor: T.redWash, alignItems: 'center', justifyContent: 'center' },
  rgroup: { marginHorizontal: 14 },
  rrow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.line },
  rfirst: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  rlast: { borderBottomLeftRadius: 18, borderBottomRightRadius: 18, borderBottomWidth: 0 },
  av: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EFEFED', alignItems: 'center', justifyContent: 'center' },
  avT: { fontSize: 11, fontWeight: '700', color: T.muted },
  rTitle: { fontSize: 12, fontWeight: '600', color: T.text, marginBottom: 3 },
  rAmt: { fontSize: 12, fontWeight: '700', color: T.text },
  pillOk: { backgroundColor: T.okWash, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  pillOkT: { fontSize: 8, fontWeight: '700', color: T.okText },
  pillGy: { backgroundColor: '#EFEFED', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  pillGyT: { fontSize: 8, fontWeight: '700', color: T.muted },
  dock: { backgroundColor: T.surface, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12, borderTopWidth: 1, borderTopColor: T.line },
  typebar: { backgroundColor: T.bg, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 16, marginRight: 56 },
  typebarT: { color: T.faint, fontSize: 11 },
  fabmic: { position: 'absolute', right: 14, top: -24, width: 52, height: 52, borderRadius: 26, backgroundColor: T.red, alignItems: 'center', justifyContent: 'center', shadowColor: T.red, shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
});
