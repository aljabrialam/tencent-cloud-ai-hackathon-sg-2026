import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { T } from '../theme';
import { DRAFT } from '../mock';
import { TopBar } from './chrome';

export function Authorise({ onDone, draft = DRAFT }: { onDone: () => void; draft?: typeof DRAFT }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    const t = setTimeout(onDone, 2600); // mock signing completes itself
    return () => { loop.stop(); clearTimeout(t); };
  }, [pulse, onDone]);

  return (
    <View style={s.c}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
        <Text style={s.h}>Authorise</Text>
        <Text style={s.hsub}>This code identifies <Text style={{ fontWeight: '800' }}>exactly</Text> what you're approving. Any change = a new code = new signature.</Text>
        <View style={s.hash}><Text style={s.hashT}>{draft.id.split('·').join(' · ')}</Text></View>
        <Animated.View style={[s.face, { transform: [{ scale: pulse }] }]}>
          <Text style={s.faceT}>🙂</Text>
        </Animated.View>
        <Text style={s.tiny}>{draft.method === 'PIN' ? 'Face ID · simulated' : `${draft.method} · simulated`}</Text>
        <View style={s.card}>
          <View style={s.frow}><Text style={s.fk}>Step-up (POL-TIER-04)</Text><Text style={s.fv}>+ SMS code</Text></View>
          <View style={[s.frow, { borderBottomWidth: 0 }]}><Text style={s.fk}>Sent to</Text><Text style={s.fv}>····8821</Text></View>
        </View>
        <View style={s.code}>
          {['4', '2', '7', '·', '', '', ''].map((d, i) =>
            d === '·'
              ? <View key={i} style={[s.cbox, { borderWidth: 0, width: 8 }]}><Text style={s.cboxT}>·</Text></View>
              : <View key={i} style={s.cbox}><Text style={s.cboxT}>{d}</Text></View>)}
        </View>
        <View style={s.signed}><Text style={s.signedT}>Signed on this device ✓</Text></View>
        <Text style={s.ghost}>Cancel</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg },
  h: { fontSize: 21, fontWeight: '800', color: T.text, paddingHorizontal: 16, paddingTop: 10, alignSelf: 'flex-start' },
  hsub: { fontSize: 11, color: T.muted, paddingHorizontal: 16, marginTop: 2, lineHeight: 16, alignSelf: 'flex-start' },
  hash: { backgroundColor: T.surface, borderRadius: 12, marginHorizontal: 14, marginTop: 10, paddingVertical: 10, alignSelf: 'stretch', alignItems: 'center' },
  hashT: { fontFamily: 'Courier', fontSize: 12, color: T.blue, letterSpacing: 2 },
  face: { width: 74, height: 74, borderRadius: 37, borderWidth: 2.5, borderColor: T.ok, backgroundColor: T.okWash, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  faceT: { fontSize: 32 },
  tiny: { fontSize: 9, color: T.muted, marginTop: 6 },
  card: { backgroundColor: T.surface, borderRadius: T.radius, marginHorizontal: 14, marginTop: 10, alignSelf: 'stretch', overflow: 'hidden' },
  frow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.line },
  fk: { fontSize: 10, color: T.muted },
  fv: { fontSize: 11, fontWeight: '700', color: T.text },
  code: { flexDirection: 'row', gap: 7, marginTop: 12 },
  cbox: { width: 28, height: 36, borderWidth: 1.5, borderColor: T.line, borderRadius: 10, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' },
  cboxT: { fontSize: 15, fontWeight: '800', color: T.text },
  signed: { backgroundColor: '#EFEFED', borderRadius: 999, paddingVertical: 13, marginHorizontal: 16, marginTop: 14, alignSelf: 'stretch', alignItems: 'center' },
  signedT: { color: T.muted, fontSize: 11, fontWeight: '600' },
  ghost: { textAlign: 'center', fontSize: 11, fontWeight: '600', color: T.text, paddingVertical: 10 },
});
