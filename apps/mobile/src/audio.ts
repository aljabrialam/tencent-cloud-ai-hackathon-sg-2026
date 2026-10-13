// Mic capture for live mode (FR-021 voice path). Web uses MediaRecorder;
// native needs a dev build with expo-av — returns null there and the caller
// falls back to the transcript sidecar (still the real /api/transcribe call).

export interface Capture { audio: string; mime: string }

export async function captureMic(ms = 3500): Promise<Capture | null> {
  const MD = (globalThis as { MediaRecorder?: typeof MediaRecorder }).MediaRecorder;
  const nav = (globalThis as { navigator?: Navigator }).navigator;
  if (!MD || !nav?.mediaDevices?.getUserMedia) return null;
  try {
    const stream = await nav.mediaDevices.getUserMedia({ audio: true });
    const mime = MD.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
    const rec = new MD(stream, { mimeType: mime });
    const chunks: Blob[] = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    const done = new Promise<Blob>(res => { rec.onstop = () => res(new Blob(chunks, { type: mime })); });
    rec.start();
    await new Promise(r => setTimeout(r, ms));
    rec.stop();
    stream.getTracks().forEach(t => t.stop());
    const blob = await done;
    const buf = await blob.arrayBuffer();
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { audio: btoa(bin), mime };
  } catch {
    return null; // permission denied / no mic — caller falls back
  }
}
