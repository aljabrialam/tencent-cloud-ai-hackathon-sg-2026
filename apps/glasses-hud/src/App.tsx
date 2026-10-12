import {useState} from 'react';
import {App as WearablesApp, useBackNavigation} from '@wearables-ui-toolkit/mrbd';
import {StatesList} from './StatesList';
import {StateDetail} from './StateDetail';
import type {HudState, StateGroup} from './types';

const qs = typeof window !== 'undefined' ? window.location.search : '';
const initialState = (qs.match(/[?&]state=([a-z]+)/)?.[1] as HudState) ?? null;

export default function App() {
  const [group, setGroup] = useState<StateGroup | null>(null);
  const [state, setState] = useState<HudState | null>(initialState);

  useBackNavigation(() => {
    if (state !== null) {
      setState(null);
      return true;
    }
    if (group !== null) {
      setGroup(null);
      return true;
    }
    return false;
  });

  return (
    <WearablesApp>
      {state === null ? (
        <StatesList group={group} go={setState} openGroup={setGroup} />
      ) : (
        <StateDetail state={state} go={setState} />
      )}
    </WearablesApp>
  );
}
