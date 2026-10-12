import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { T } from '../theme';
import { DRAFT, fmt } from '../mock';

export function Authorise({ onDone }: { onDone: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    const t = setTimeout(onDone, 2400); // mock Face ID completes itself
    return () => { loop.stop(); clearTimeout(t); };
  }, [pulse, onDone]);

  return (
    <View style={s.c}>
      <Text style={s.tag}>SIGNING ON DEVICE</Text>
      <Text style={s.h}>Face ID to send {fmt(DRAFT.amountCents)}</Text>
      <View style={s.card}>
        <Text style={s.lbl}>WHAT IS BEING SIGNED</Text>
        <Text style={s.hash}>sha256(draft {DRAFT.id})</Text>
        <Text style={s.hash}>to={DRAFT.to} ····{DRAFT.toLast4} · amt={DRAFT.amountCents}c</Text>
        <View style={s.div} />
        <Text style={s.note}>The signature binds this exact draft. If anything changes, this signature dies with it.</Text>
      </View>
      <View style={{ flex: 1 }} />
      <Animated.View style={[s.face, { transform: [{ scale: pulse }] }]}>
        <Text style={s.faceT}>⦿</Text>
      </Animated.View>
      <Text style={s.tiny}>Face ID · mock — real binding is the draft hash, not the biometric</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: T.bg, padding: 20, alignItems: 'center' },
  tag: { fontSize: 11, letterSpacing: 1.2, fontWeight: '800', color: T.red, alignSelf: 'flex-start' },
  h: { fontSize: 24, fontWeight: '800', color: T.text, marginTop: 6, marginBottom: 20, alignSelf: 'flex-start' },
  card: { backgroundColor: T.surface, borderRadius: 20, padding: 18, width: '100%' },
  lbl: { fontSize: 10, letterSpacing: 1, fontWeight: '800', color: T.muted, marginBottom: 8 },
  hash: { fontFamily: 'Courier', fontSize: 12, color: T.text, marginBottom: 4 },
  div: { height: 1, backgroundColor: T.line, marginVertical: 10 },
  note: { fontSize: 12, color: T.muted, lineHeight: 18 },
  face: { width: 88, height: 88, borderRadius: 44, backgroundColor: T.redWash, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  faceT: { fontSize: 44, color: T.red },
  tiny: { fontSize: 11, color: T.muted, textAlign: 'center' },
});
