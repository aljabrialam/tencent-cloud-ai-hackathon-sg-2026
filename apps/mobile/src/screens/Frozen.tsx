import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { TopBar } from './chrome';

export function Frozen({ onAudit }: { onAudit: () => void }) {
  return (
    <View style={s.c}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.h}>⛔ Frozen</Text>
        <View style={s.banner}>
          <Text style={s.bannerT}>
            <Text style={{ fontWeight: '800' }}>I may have misunderstood.{'\n'}</Text>
            A second, independent agent compared the draft to what you said and found a difference. <Text style={{ fontWeight: '800' }}>Nothing was sent.</Text>
          </Text>
        </View>
        <View style={s.card}>
          <View style={s.cmp}>
            <View style={{ flex: 1 }}>
              <Text style={s.cmpK}>You said</Text>
              <Text style={s.cmpV}>"two hundred"</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cmpK}>Draft shows</Text>
              <Text style={s.cmpVErr}>S$2,000.00</Text>
            </View>
          </View>
          <View style={s.frow}><Text style={s.fk}>Field</Text><Text style={s.fvErr}>amount</Text></View>
        </View>
        <Text style={s.note}>The authorise button is removed until this is resolved. The freeze is in your audit trail.</Text>
        <View style={s.cta}><Text style={s.ctaT}>SAY IT AGAIN</Text></View>
        <View style={[s.cta, s.ctaDis]}><Text style={s.ctaDisT}>Fix the amount to S$200.00</Text></View>
        <TouchableOpacity onPress={onAudit} accessibilityRole="button">
          <Text style={s.ghost}>Cancel — nothing sent</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  h: { fontSize: 21, fontWeight: '800', color: T.err, paddingHorizontal: 16, paddingTop: 10 },
  banner: { backgroundColor: T.errWash, borderWidth: 1, borderColor: '#F3C1BA', borderRadius: 16, marginHorizontal: 14, marginVertical: 8, padding: 12 },
  bannerT: { fontSize: 11, color: T.text, lineHeight: 17 },
  card: { backgroundColor: T.surface, borderRadius: T.radius, marginHorizontal: 14, marginVertical: 6, overflow: 'hidden' },
  cmp: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: T.line },
  cmpK: { fontSize: 10, color: T.muted },
  cmpV: { fontSize: 12, fontWeight: '700', color: T.text, marginTop: 2 },
  cmpVErr: { fontSize: 14, fontWeight: '800', color: T.err, marginTop: 2 },
  frow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  fk: { fontSize: 10, color: T.muted },
  fvErr: { fontSize: 11, fontWeight: '700', color: T.err },
  note: { fontSize: 9, color: T.muted, lineHeight: 14, paddingHorizontal: 16, paddingVertical: 6 },
  cta: { backgroundColor: T.red, borderRadius: 999, paddingVertical: 14, marginHorizontal: 16, marginTop: 8, alignItems: 'center' },
  ctaT: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  ctaDis: { backgroundColor: '#EFEFED', marginTop: 8 },
  ctaDisT: { color: T.muted, fontSize: 11, fontWeight: '600' },
  ghost: { textAlign: 'center', fontSize: 11, fontWeight: '600', color: T.text, paddingVertical: 12 },
});
