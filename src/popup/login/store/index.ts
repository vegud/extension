import { computed, ComputedRef, Ref, ref } from 'vue';

interface LoginState {
  accessToken: string | null;
  loggedIn: boolean;
  lastError: string | null;
}

declare global {
  interface Window {
    plusSub_login: Ref<LoginState>
  }
}

export interface LoginStore {
  actions: {
    logIn: () => Promise<boolean>;
  },
  getters: {
    accessToken: ComputedRef<string|null>;
    loggedIn: ComputedRef<boolean>;
    lastError: ComputedRef<string|null>;
  }
}

type AuthResult = {redirectUri: string} | {error: string};

const sendAuthRequestToBackgroundScript = (): Promise<AuthResult> =>
  new Promise((resolve) =>
    chrome.runtime.sendMessage('auth', (response) => resolve(response)));

const isError = (auth: AuthResult): auth is {error: string} => typeof auth['error'] !== 'undefined';

export const init = (): LoginStore => {
  window.plusSub_login = window.plusSub_login ? ref(window.plusSub_login.value) : ref<LoginState>({
    loggedIn: false,
    accessToken: null,
    lastError: null
  });

  const reset = ({error}: {error: string | null}) => {
    window.plusSub_login.value.loggedIn = false;
    window.plusSub_login.value.accessToken = null;
    window.plusSub_login.value.lastError = error;
  }

  const successful = ({accessToken}: {accessToken: string}) => {
    window.plusSub_login.value.accessToken = accessToken;
    window.plusSub_login.value.loggedIn = true;
    window.plusSub_login.value.lastError = null;
  }

  const logIn = async () => {
    const result = await sendAuthRequestToBackgroundScript();
    if(isError(result)){
      reset({error: result.error});
      return false;
    }

    const urlHash = new URL(result.redirectUri).hash.slice(1);
    const hashParams = new URLSearchParams(urlHash);
    const notRegistered = hashParams.get('error_description')?.trim() === 'PreAuthentication failed with error User not found.';
    if(notRegistered){
      reset({error: 'NOT_REGISTERED'});
      return false;
    }
    const accessToken = hashParams.get('access_token');
    if (!accessToken) {
      reset({error: 'MISSING_ACCESS_TOKEN'});
      return false;
    }
    successful({accessToken});
    return true;
  }

  if(!window.plusSub_login.value.loggedIn) {
    void logIn();
  }

  return {
    actions: {
      logIn
    },
    getters: {
      loggedIn: computed(() => window.plusSub_login.value.loggedIn),
      accessToken: computed(() => window.plusSub_login.value.accessToken),
      lastError: computed(() => window.plusSub_login.value.lastError)
    }
  };
};