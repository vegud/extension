import { setAppState, setAppStatePartial, snapshot } from '#/../shared/appState';
import { parse } from '@plussub/srt-vtt-parser/dist/src';

declare global {
  interface Window {
    plussub: {
      parse: () => void;
    };
  }
}

window.plussub = {
  async parse() {
    setAppStatePartial({ state: 'PARSING' });
    const parsed = await parse(snapshot().srt.raw ?? '');
    // get a new snapshot because maybe has something change in the meantime
    const appState = snapshot();
    setAppState({
      ...appState,
      state: 'DONE',
      srt: {
        raw: appState.srt.raw,
        parsed: parsed.entries
      }
    });
  }
};
