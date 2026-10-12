import {ListItem, Page, VerticalList} from '@wearables-ui-toolkit/mrbd';
import type {HudState, StateGroup} from './types';
import {GROUPS} from './types';

export function StatesList({
  group,
  go,
  openGroup,
}: {
  group: StateGroup | null;
  go: (s: HudState) => void;
  openGroup: (g: StateGroup) => void;
}) {
  if (group === null) {
    return (
      <Page
        headerText="digiVoice HUD"
        headerMetadata="display only"
        enableSystemBarInset={false}>
        <div className="action-page-shell">
          <VerticalList insetForHeader ariaLabel="HUD state groups" tabIndex={0}>
            {GROUPS.map(g => (
              <ListItem
                key={g.id}
                title={g.title}
                subtitle={g.subtitle}
                onClick={() => openGroup(g)}
              />
            ))}
          </VerticalList>
        </div>
      </Page>
    );
  }

  return (
    <Page
      headerText="digiVoice"
      headerMetadata={group.title}
      enableSystemBarInset={false}>
      <div className="action-page-shell">
        <VerticalList insetForHeader ariaLabel={group.title} tabIndex={0}>
          {group.states.map(s => (
            <ListItem
              key={s.id}
              title={s.title}
              subtitle={s.subtitle}
              onClick={() => go(s.id)}
            />
          ))}
        </VerticalList>
      </div>
    </Page>
  );
}
