import { LoginStore } from '@/login/store';

export interface SelectSubtitleStore {
  actions: {
    list: () => Promise<string[]>
    download: (entry: string) => Promise<string>
  }
}


export const init = ({ loginStore }: { loginStore: LoginStore }): SelectSubtitleStore => {
  return {
    actions: {
      list: async () => {
        return fetch(`https://c1szga65f2.execute-api.eu-west-1.amazonaws.com/list`, {
          method: 'POST',
          headers: {
            authorization: loginStore.getters.login.value?.authToken ?? ''
          }
        }).then((r) => r.json());
      },
      download: async (entry: string) => {
        return fetch(`https://c1szga65f2.execute-api.eu-west-1.amazonaws.com/get?key=${entry}`, {
          method: 'POST',
          headers: {
            authorization: loginStore.getters.login.value?.authToken ?? ''
          }
        }).then((r) => r.text());
      }
    }
  };
};