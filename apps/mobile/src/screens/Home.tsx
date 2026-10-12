import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { ME, ACCOUNTS, fmt } from '../mock';

const ACTIONS = [
  { label: 'Security Hub', icon: '🛡' },
  { label: 'PayNow', icon: '🎙' },
  { label: 'Bills & GIRO', icon: '📄' },
  { label: 'Overseas', icon: '✈' },
  { label: 'Insights', icon: '📊' },
];

export function Home({ onMic }: { onMic: () => void }) {
  return (
    <View style={s.c}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Text style={s.hi}>Hi, {ME.name}!</Text>
          <Text style={s.sub}>Speak or type — I draft it, you approve it</Text>
        </View>
        <View style={s.actions}>
          {ACTIONS.map((a, i) => (
            <View key={a.label} style={s.action}>
              <View style={[s.actionIc, i === 1 && { backgroundColor: T.redWash, borderColor: T.red }]}>
                <Text style={s.actionEmoji}>{a.icon}</Text>
              </View>
              <Text style={s.actionLbl}>{a.label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.sec}>Your accounts <Text style={s.link}>View all</Text></Text>
        {ACCOUNTS.map(a => (
          <View key={a.id} style={s.acct}>
            <View>
              <Text style={s.acctName}>{a.name}</Text>
              <Text style={s.acctNo}>····{a.last4}</Text>
            </View>
            <Text style={s.acctBal}>{fmt(a.balanceCents)}</Text>
          </View>
        ))}
        <Text style={s.sec}>Recent activity</Text>
        <View style={s.row}>
          <View style={s.av}><Text style={s.avT}>M</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>Mum</Text>
            <Text style={s.rowSub}>groceries · 12 Sep</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.rowAmt}>-S$120.00</Text>
            <View style={s.pillOk}><Text style={s.pillOkT}>Sent</Text></View>
          </View>
        </View>
        <View style={s.row}>
          <View style={s.av}><Text style={s.avT}>J</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>John Tan</Text>
            <Text style={s.rowSub}>transfer · 5 Sep</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.rowAmt}>S$0.00</Text>
            <View style={s.pillGy}><Text style={s.pillGyT}>Cancelled</Text></View>
          </View>
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>
      <View style={s.bottom}>
        <View style={s.typebar}><Text style={s.typebarT}>Type a request…</Text></View>
        <TouchableOpacity style={s.fab} onPress={onMic} accessibilityLabel="Tap to talk" accessibilityRole="button">
          <Text style={s.fabT}>🎙</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  hero: { backgroundColor: T.red, padding: 20, paddingTop: 8, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  hi: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: '#FFD9DD', fontSize: 13, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 },
  action: { alignItems: 'center', width: 62 },
  actionIc: { width: 48, height: 48, borderRadius: 24, backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' },
  actionEmoji: { fontSize: 20 },
  actionLbl: { fontSize: 9, color: T.muted, marginTop: 5, textAlign: 'center' },
  sec: { fontSize: 15, fontWeight: '700', color: T.text, marginHorizontal: 18, marginTop: 22, marginBottom: 10 },
  link: { fontSize: 12, color: T.blue, fontWeight: '600' },
  acct: { backgroundColor: T.surface, marginHorizontal: 16, borderRadius: T.radius, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  acctName: { fontSize: 14, fontWeight: '600', color: T.text },
  acctNo: { fontSize: 12, color: T.muted, marginTop: 2 },
  acctBal: { fontSize: 16, fontWeight: '800', color: T.text },
  row: { backgroundColor: T.surface, marginHorizontal: 16, borderRadius: T.radius, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  av: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' },
  avT: { fontSize: 14, fontWeight: '700', color: T.muted },
  rowTitle: { fontSize: 14, fontWeight: '600', color: T.text },
  rowSub: { fontSize: 11, color: T.muted, marginTop: 1 },
  rowAmt: { fontSize: 14, fontWeight: '700', color: T.text },
  pillOk: { backgroundColor: T.okWash, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 3 },
  pillOkT: { fontSize: 10, fontWeight: '700', color: T.ok },
  pillGy: { backgroundColor: T.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 3 },
  pillGyT: { fontSize: 10, fontWeight: '700', color: T.muted },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, backgroundColor: T.bg },
  typebar: { flex: 1, backgroundColor: T.surface, borderRadius: 24, borderWidth: 1, borderColor: T.line, padding: 14 },
  typebarT: { color: T.faint, fontSize: 14 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: T.red, alignItems: 'center', justifyContent: 'center', shadowColor: T.red, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  fabT: { fontSize: 22 },
});
