import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { T } from '../theme';

const BARS = [6, 16, 26, 12, 22, 9, 18, 28, 10, 20, 7, 15];

export function Listening({ onStop }: { onStop: () => void }) {
  const anims = useRef(BARS.map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(a, { toValue: 1, duration: 280 + i * 35, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0.3, duration: 280 + i * 35, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [anims]);

  return (
    <View style={s.c}>
      <View style={s.badge}><View style={s.dot} /><Text style={s.badgeT}>Listening…</Text></View>
      <Text style={s.title}>I'm listening</Text>
      <View style={s.wave}>
        {anims.map((a, i) => (
          <Animated.View key={i} style={[s.bar, { height: BARS[i], transform: [{ scaleY: a }] }]} />
        ))}
      </View>
      <View style={s.tsr}>
        <View style={s.tsrLbl}>
          <Text style={s.tsrLblT}>LIVE TRANSCRIPT</Text>
          <Text style={s.tsrOk}>✓ Clear</Text>
        </View>
        <Text style={s.tsrT}>Send <Text style={s.b}>two hundred</Text> to <Text style={s.u}>Mum</Text> for groceries ▌</Text>
      </View>
      <Text style={s.tiny}>English · confidence 0.97 · tap to stop</Text>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={s.stop} onPress={onStop} accessibilityLabel="Stop listening" accessibilityRole="button">
        <View style={s.stopSq} />
      </TouchableOpacity>
      <Text style={s.tiny}>nothing is drafted until you stop</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg, padding: 22, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: T.redWash, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: T.red },
  badgeT: { color: T.red, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '300', color: T.text, marginTop: 26 },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40, marginVertical: 20 },
  bar: { width: 4, borderRadius: 2, backgroundColor: T.red },
  tsr: { backgroundColor: T.surface, borderRadius: T.radius, padding: 16, width: '100%' },
  tsrLbl: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tsrLblT: { fontSize: 10, letterSpacing: 1, color: T.muted, fontWeight: '700' },
  tsrOk: { fontSize: 10, color: T.ok, fontWeight: '700' },
  tsrT: { fontSize: 16, color: T.text, lineHeight: 24 },
  b: { fontWeight: '800' },
  u: { textDecorationLine: 'underline', fontWeight: '700' },
  tiny: { fontSize: 11, color: T.muted, marginTop: 10 },
  stop: { width: 68, height: 68, borderRadius: 34, backgroundColor: T.red, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stopSq: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#fff' },
});
