import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { SCAM_REASONS } from '../mock';
import { TopBar } from './chrome';

export function Scam({ onDone }: { onDone: () => void }) {
  return (
    <View style={s.c}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.h}>⚠ Pause. This looks like a scam.</Text>
        <View style={s.banner}>
          <Text style={s.bannerT}><Text style={{ fontWeight: '800' }}>Why we're pausing</Text> — your request has patterns scammers use.</Text>
        </View>
        <View style={s.card}>
          {SCAM_REASONS.map(r => (
            <View key={r} style={s.reason}>
              <Text style={s.ri}>▲</Text>
              <Text style={s.rT}>{r}</Text>
            </View>
          ))}
        </View>
        <View style={[s.cta, s.ctaNavy]}>
          <Text style={s.ctaT}>📞 Call DBS scam hotline 1800 339 6963</Text>
        </View>
        <View style={[s.cta, s.ctaDis]}>
          <Text style={s.ctaDisT}>💬 Text a trusted person instead</Text>
        </View>
        <Text style={s.note}>Continuing anyway requires waiting 30 s, then Face ID <Text style={{ fontWeight: '800' }}>and</Text> a code sent to ····8821.</Text>
        <View style={[s.cta, s.ctaDis]}>
          <Text style={s.ctaDisT}>I understand — continue in 0:27</Text>
        </View>
        <TouchableOpacity onPress={onDone} accessibilityRole="button">
          <Text style={s.ghost}>Cancel — safest choice</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  h: { fontSize: 20, fontWeight: '800', color: T.warnText, paddingHorizontal: 16, paddingTop: 10 },
  banner: { backgroundColor: T.warnWash, borderWidth: 1, borderColor: '#EFD9AE', borderRadius: 16, marginHorizontal: 14, marginVertical: 8, padding: 12 },
  bannerT: { fontSize: 11, color: T.text, lineHeight: 17 },
  card: { backgroundColor: T.surface, borderRadius: T.radius, marginHorizontal: 14, marginVertical: 6, paddingVertical: 8, paddingHorizontal: 14 },
  reason: { flexDirection: 'row', gap: 8, paddingVertical: 6, alignItems: 'flex-start' },
  ri: { fontSize: 10, color: T.warnText, marginTop: 1 },
  rT: { flex: 1, fontSize: 11, color: T.text, lineHeight: 16 },
  cta: { borderRadius: 999, paddingVertical: 14, marginHorizontal: 16, marginTop: 8, alignItems: 'center' },
  ctaNavy: { backgroundColor: T.navy },
  ctaT: { color: '#fff', fontSize: 11, fontWeight: '800' },
  ctaDis: { backgroundColor: '#EFEFED' },
  ctaDisT: { color: T.muted, fontSize: 11, fontWeight: '600' },
  note: { fontSize: 9, color: T.muted, textAlign: 'center', lineHeight: 14, paddingHorizontal: 16, paddingVertical: 8 },
  ghost: { textAlign: 'center', fontSize: 11, fontWeight: '600', color: T.text, paddingVertical: 10 },
});
