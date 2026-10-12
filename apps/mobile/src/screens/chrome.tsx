import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { T } from '../theme';

// Shared phone chrome — mirrors the mockup's .topbar / .tabbar.
export function TopBar() {
  return (
    <View style={s.top}>
      <View style={s.ticon}><Text style={s.ticonT}>←</Text></View>
      <Text style={s.brand}>digiVoice</Text>
      <View style={s.ticon}><Text style={s.ticonT}>💬</Text></View>
    </View>
  );
}

export function TabBar({ active = 0, items }: { active?: number; items: { icon: string; label: string }[] }) {
  return (
    <View style={s.tabs}>
      {items.map((t, i) => (
        <View key={i} style={s.tb}>
          <Text style={[s.tbi, i === active && s.tbOn]}>{t.icon}</Text>
          <Text style={[s.tbT, i === active && s.tbOn]}>{t.label}</Text>
        </View>
      ))}
    </View>
  );
}

export const TABS = [
  { icon: '⌂', label: 'Home' },
  { icon: '⇄', label: 'Pay & Transfer' },
  { icon: '◈', label: 'digiWealth' },
  { icon: '＋', label: 'Apply' },
  { icon: '⋯', label: 'More' },
];

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8 },
  ticon: { width: 30, height: 30, borderRadius: 15, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' },
  ticonT: { fontSize: 13, color: T.text },
  brand: { fontSize: 11, fontWeight: '600', color: T.muted, letterSpacing: 0.2 },
  tabs: { backgroundColor: T.navy, flexDirection: 'row', paddingTop: 8, paddingBottom: 12 },
  tb: { flex: 1, alignItems: 'center', gap: 3 },
  tbi: { fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  tbT: { fontSize: 8, color: 'rgba(255,255,255,0.55)' },
  tbOn: { color: '#fff' },
});
