// use browser action because page action doesn't seem to work on incognito mode
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// use browser action because page action doesn't seem to work on incognito mode
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const url = new URL('https://vegud.auth.eu-west-1.amazoncognito.com/oauth2/authorize');
url.searchParams.append('identity_provider', 'Facebook');
url.searchParams.append('redirect_uri', 'https://bndkbjglnoggidapphiojioiennkbbdc.chromiumapp.org/provider_cb');
url.searchParams.append('response_type', 'token');
url.searchParams.append('client_id', '3o9pfdccmapn4nvmidftuka90c');
url.searchParams.append('scope', 'email');

const auth = async (): Promise<{accessToken: string}> => {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({
      'interactive': true,
      url: url.toString()
    }, async (redirectUri) => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
        return;
      }

      if (!redirectUri) {
        reject(new Error('missing redirectUri'));
        return;
      }

      const urlHash = new URL(redirectUri).hash.slice(1);
      const hashParams = new URLSearchParams(urlHash);
      const accessToken = hashParams.get('access_token');

      if (!accessToken) {
        reject(new Error('missing accessToken'));
        return;
      }
      resolve({ accessToken });
    });
  });
};

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    console.warn('missing tab id');
    return;
  }
  const {accessToken} = await auth();
  await chrome.storage.sync.set({accessToken});

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
