export type HudState =
  | 'ambient'
  | 'listening'
  | 'clarify'
  | 'card'
  | 'waiting'
  | 'sent'
  | 'frozen'
  | 'scam';

export interface StateMeta {
  id: HudState;
  title: string;
  subtitle: string;
}

export interface StateGroup {
  id: string;
  title: string;
  subtitle: string;
  states: StateMeta[];
}

export const GROUPS: StateGroup[] = [
  {
    id: 'capture',
    title: 'Capture',
    subtitle: 'Speak and clarify',
    states: [
      {id: 'ambient', title: 'Ambient', subtitle: 'Lens dark until you speak'},
      {id: 'listening', title: 'Listening', subtitle: 'Rolling transcript'},
      {id: 'clarify', title: 'Clarify', subtitle: 'Voice or pinch'},
    ],
  },
  {
    id: 'review',
    title: 'Review',
    subtitle: 'Draft, phone signs',
    states: [
      {id: 'card', title: 'Draft card', subtitle: 'Glanceable summary'},
      {id: 'waiting', title: 'Waiting', subtitle: 'Phone is signing'},
      {id: 'sent', title: 'Sent', subtitle: 'Then auto-dismiss'},
    ],
  },
  {
    id: 'stopped',
    title: 'Stopped',
    subtitle: 'Nothing moves',
    states: [
      {id: 'frozen', title: 'Frozen', subtitle: 'Validator disagreed'},
      {id: 'scam', title: 'Scam pause', subtitle: 'Steady amber'},
    ],
  },
];

export function findState(id: HudState): StateMeta {
  for (const g of GROUPS) {
    const found = g.states.find(s => s.id === id);
    if (found) return found;
  }
  throw new Error(`unknown state ${id}`);
}
