import { createApp, App } from 'vue';
import appComponent from './App.vue';
import FontAwesomeIcon from "@/components/FontAwesomeIcon/fontAwesome";
import {get as storageGet} from 'storage';

let app: App;

export const init = async (): Promise<void> => {
  if (document.getElementById('plusSubShadow')) {
    document.documentElement.style.setProperty('--plusSub-shadow-top', `${window.scrollY + 30}px`)
  } else {
    const {preferredLanguage, style} = await storageGet(['preferredLanguage', 'api', 'style']);
    app = createApp(appComponent, {preferredLanguage: preferredLanguage ?? 'en', style: style ?? {}}).component('fa', FontAwesomeIcon);
    document.documentElement.style.setProperty('--plusSub-shadow-top', `${window.scrollY + 30}px`);

    const appShadowDiv = document.createElement('div');
    appShadowDiv.id = 'plusSubShadow';
    appShadowDiv.style.position = "absolute";
    appShadowDiv.style.zIndex = "10000";
    appShadowDiv.style.top = "var(--plusSub-shadow-top)";
    appShadowDiv.style.right = "16px";
    appShadowDiv.style.width = "400px";
    appShadowDiv.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2)";
    const shadow = appShadowDiv.attachShadow({ mode: 'open' });

    const appDiv = document.createElement('div');
    appDiv.id = 'plussub';
    shadow.appendChild(appDiv);

    shadow.prepend(document.getElementById('plussub-style') as HTMLElement);
    document.body.prepend(appShadowDiv);
    app.mount(appDiv);
  }
};

export const useApp = (): App => {
  return app;
};

init();
