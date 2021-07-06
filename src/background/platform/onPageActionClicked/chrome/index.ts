// use browser action because page action doesn't seem to work on incognito mode
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// use browser action because page action doesn't seem to work on incognito mode
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const url = new URL('https://vegud2.auth.eu-west-1.amazoncognito.com/oauth2/authorize');
url.searchParams.append('identity_provider', 'Facebook');
url.searchParams.append('redirect_uri', 'https://lodkihmjefnchnabpmjifgcacncllkil.chromiumapp.org/provider_cb');
url.searchParams.append('response_type', 'token');
url.searchParams.append('client_id', '76mptk4ppgstrrcknkhh8a1htf');
url.searchParams.append('scope', 'email');


type AuthResult = {redirectUri: string} | {error: string};

const auth = async (): Promise<AuthResult> => {
  console.warn('auth!');
  return new Promise((resolve) => {
    chrome.identity.launchWebAuthFlow({ interactive: true, url: url.toString() }, async (redirectUri) => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError.message);
        resolve({error: chrome.runtime.lastError.message ?? 'unknown error'});
        return;
      }
      console.warn('wohu!');
      console.warn(redirectUri);

      if (!redirectUri) {
        resolve({error: 'missing redirectUri'});
        return;
      }
      resolve({redirectUri});
    });
  });
};

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    console.warn('missing tab id');
    return;
  }
  try {
    await chrome.scripting.insertCSS({ files: ['./font.css'], target: { allFrames: false, tabId: tab.id } });
    console.warn('insert done');
  } catch (e) {
    console.warn('insert css failed', e);
  }
  try {
    // chrome.tabs.executeScript({ file: './contentScript.js', allFrames: true });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await chrome.scripting.executeScript({
      files: ['./popup.js'],
      target: {
        allFrames: false,
        tabId: tab.id
      }
    });
  } catch (e) {
    console.warn('insert script failed', e);
  }
});

chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
  if (message === 'auth') {
    auth().then(r => sendResponse(r));
    return true;
  }
});