import {
  Button,
  ButtonRail,
  Page,
  Panel,
  ScrollView,
  TextColor,
  TextStyle,
  TextView,
} from '@wearables-ui-toolkit/mrbd';
import type {HudState} from './types';
import {findState} from './types';

function Hint({children}: {children: string}) {
  return (
    <TextView as="p" textStyle={TextStyle.META2} textColor={TextColor.SECONDARY}>
      {children}
    </TextView>
  );
}

function StateBody({state, go}: {state: HudState; go: (s: HudState) => void}) {
  switch (state) {
    case 'ambient':
      return (
        <TextView as="p" textStyle={TextStyle.BODY2} textColor={TextColor.SECONDARY}>
          Nothing on the lens until you speak. No balances ever linger.
        </TextView>
      );
    case 'listening':
      return (
        <>
          <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED}>
            “Send two hundred to Mum for groceries…”
          </TextView>
          <Hint>tap temple = say it back</Hint>
          <Hint>band pulses on each parsed entity</Hint>
        </>
      );
    case 'clarify':
      return (
        <>
          <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED}>
            Two payees named John — which one?
          </TextView>
          <Hint>answer aloud, or pinch to select</Hint>
          <ButtonRail>
            <Button title="John Tan" onClick={() => go('card')} />
            <Button title="John Lim" onClick={() => go('card')} />
          </ButtonRail>
        </>
      );
    case 'card':
      return (
        <>
          <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED}>
            S$200.00 → Mum
          </TextView>
          <TextView as="p" textStyle={TextStyle.BODY2}>
            ending 4521 — verified
          </TextView>
          <TextView as="p" textStyle={TextStyle.BODY2} textColor={TextColor.ACCENT}>
            Approve on your phone →
          </TextView>
          <Hint>draft a3f9·08c2</Hint>
          <Hint>pinch = forward · 2×pinch = dismiss</Hint>
          <ButtonRail>
            <Button title="Send to phone" onClick={() => go('waiting')} />
            <Button title="Dismiss" onClick={() => go('ambient')} />
          </ButtonRail>
        </>
      );
    case 'waiting':
      return (
        <>
          <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED}>
            S$200.00 → Mum
          </TextView>
          <TextView as="p" textStyle={TextStyle.BODY2} textColor={TextColor.SECONDARY}>
            Waiting for phone — Face ID
          </TextView>
          <Hint>pinch-hold = read aloud again</Hint>
        </>
      );
    case 'sent':
      return (
        <>
          <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED}>
            Sent to Mum
          </TextView>
          <TextView as="p" textStyle={TextStyle.BODY2}>S$200.00 · TXN-88214</TextView>
          <Hint>clears to ambient in ~4 s</Hint>
        </>
      );
    case 'frozen':
      return (
        <>
          <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED}>
            I may have misunderstood
          </TextView>
          <TextView as="p" textStyle={TextStyle.BODY2}>
            “two hundred” vs S$2,000.00 — nothing sent.
          </TextView>
          <TextView as="p" textStyle={TextStyle.BODY2} textColor={TextColor.ACCENT}>
            Speak to correct →
          </TextView>
          <Hint>pinch = say it again</Hint>
        </>
      );
    case 'scam':
      return (
        <>
          <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED}>
            Paused — this looks like a scam.
          </TextView>
          <TextView as="p" textStyle={TextStyle.BODY2}>
            Authority + urgency + new account.
          </TextView>
          <TextView as="p" textStyle={TextStyle.BODY2}>
            See your phone to continue.
          </TextView>
        </>
      );
  }
}

export function StateDetail({
  state,
  go,
}: {
  state: HudState;
  go: (s: HudState) => void;
}) {
  const meta = findState(state);
  return (
    <Page headerText="digiVoice" headerMetadata={meta.title} enableSystemBarInset={false}>
      <div className="action-page-shell">
        <ScrollView insetForHeader ariaLabel="Lens state" tabIndex={0}>
          <Panel width="100%">
            <div className="content-inset">
              <StateBody state={state} go={go} />
            </div>
          </Panel>
        </ScrollView>
      </div>
    </Page>
  );
}
