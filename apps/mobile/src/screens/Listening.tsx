import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import { TopBar, TabBar } from './chrome';

const BARS = [10, 24, 38, 18, 34, 12, 28, 42, 15, 31, 9, 23, 36, 14, 27, 11];

function marked(text: string, hi?: string, ul?: string) {
  if (!hi && !ul) return <Text style={s.tsrT}>{text} ▌</Text>;
  const parts: React.ReactNode[] = [];
  let rest = text, k = 0;
  while (rest.length) {
    const ih = hi ? rest.indexOf(hi) : -1;
    const iu = ul ? rest.indexOf(ul) : -1;
    if (ih < 0 && iu < 0) { parts.push(rest); break; }
    const useHi = ih >= 0 && (iu < 0 || ih < iu);
    const sub = useHi ? hi! : ul!;
    const i = useHi ? ih : iu;
    if (i > 0) parts.push(rest.slice(0, i));
    parts.push(<Text key={k++} style={useHi ? s.b : s.u}>{sub}</Text>);
    rest = rest.slice(i + sub.length);
  }
  return <Text style={s.tsrT}>{parts} ▌</Text>;
}

export function Listening({ onStop, transcript }: { onStop: () => void; transcript?: { text: string; hi?: string; ul?: string } }) {
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

  const tsr = transcript ?? { text: 'Send two hundred to Mum for groceries', hi: 'two hundred', ul: 'Mum' };

  return (
    <View style={s.c}>
      <TopBar />
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
        {marked(tsr.text, tsr.hi, tsr.ul)}
      </View>
      <Text style={s.tiny}>English · confidence 0.97 · tap to stop</Text>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={s.stop} onPress={onStop} accessibilityLabel="Stop listening" accessibilityRole="button">
        <View style={s.stopSq} />
      </TouchableOpacity>
      <Text style={s.stopLbl}>STOP</Text>
      <TabBar active={1} items={[{ icon: '⌫', label: '' }, { icon: '🎙', label: '' }, { icon: '✕', label: '' }]} />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.redWash, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'center', marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.red },
  badgeT: { color: T.red, fontSize: 10, fontWeight: '700' },
  title: { textAlign: 'center', fontSize: 19, fontWeight: '800', color: T.text, marginTop: 8 },
  wave: { flexDirection: 'row', gap: 3, alignItems: 'center', justifyContent: 'center', height: 52, paddingVertical: 10 },
  bar: { width: 3.5, borderRadius: 3, backgroundColor: T.red },
  tsr: { backgroundColor: T.surface, borderRadius: 18, padding: 14, marginHorizontal: 14 },
  tsrLbl: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tsrLblT: { fontSize: 8, letterSpacing: 0.8, color: T.muted, fontWeight: '700' },
  tsrOk: { fontSize: 8, color: T.okText, fontWeight: '700' },
  tsrT: { fontSize: 13, color: T.text, lineHeight: 20 },
  b: { color: T.red, fontWeight: '800' },
  u: { color: T.red, fontWeight: '700', textDecorationLine: 'underline', textDecorationColor: T.red },
  tiny: { fontSize: 9, color: T.muted, textAlign: 'center', paddingVertical: 8 },
  stop: { width: 64, height: 64, borderRadius: 32, backgroundColor: T.red, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', shadowColor: T.red, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  stopSq: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#fff' },
  stopLbl: { fontSize: 9, color: T.muted, textAlign: 'center', marginTop: 6, marginBottom: 2, letterSpacing: 1 },
});
