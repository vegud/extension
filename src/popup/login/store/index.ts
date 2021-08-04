import { computed, ComputedRef, Ref, ref } from 'vue';
import { get as storageGet, set as storageSet } from 'storage';

interface LoginState {
  authToken: string | null;
  loggedIn: boolean;
}

declare global {
  interface Window {
    plusSub_login: Ref<LoginState>
  }
}

export interface LoginStore {
  actions: {
    signIn: (payload: {mail: string, pw: string}) => Promise<{status: 'success'|'error', message: string}>;
    signOut: () => Promise<void>;
  },
  getters: {
    login: ComputedRef<LoginState | null>;
    initialized: ComputedRef<boolean>;
  }
}

export const init = (): LoginStore => {
  window.plusSub_login = window.plusSub_login ? ref(window.plusSub_login.value) : ref<LoginState>({
    loggedIn: false,
    authToken: null
  });
  const initialized = ref(false);

  storageGet(['authorization']).then(async ({authorization}) => {
    if(!authorization){
      window.plusSub_login.value.loggedIn = false;
      window.plusSub_login.value.authToken = null;
      initialized.value = true;
      return;
    }

      const loginResponse = await fetch(`https://c1szga65f2.execute-api.eu-west-1.amazonaws.com/login`, {
        method: 'POST',
        headers: {
          authorization
        }
      }).then(r => r.json());

      window.plusSub_login.value = {
        loggedIn: loginResponse.status === 'success',
        authToken: loginResponse.status === 'success' ? authorization : null
      };
      initialized.value = true;
  });

  const utf8ToBase64 =  str => window.btoa(unescape(encodeURIComponent( str )));

  return {
    actions: {
      signIn: async ({mail, pw}: {mail: string, pw: string}): Promise<{status: 'success'|'error', message: string}> => {
        const authorization = utf8ToBase64(`${mail} ${pw}`);

        const loginResponse = await fetch(`https://c1szga65f2.execute-api.eu-west-1.amazonaws.com/login`, {
          method: 'POST',
          headers: {
            authorization
          }
        }).then(r => r.json());
        if (loginResponse.status === 'success') {
          await storageSet({authorization});
          window.plusSub_login.value = {
            loggedIn: true,
            authToken: authorization
          };
        }
        return loginResponse;
      },
      signOut: async () => {
        window.plusSub_login.value = {
          loggedIn: false,
          authToken: null
        };
        await storageSet({authorization: null});
      }
    },
    getters: {
      login: computed(() => window.plusSub_login.value),
      initialized: computed(() => initialized.value)
    }
  };
};