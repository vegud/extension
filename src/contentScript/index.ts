import { fromEvent, merge, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { postMessage } from './postMessage';
import { init as initHighlight } from './highlight';
import { init as initVideo } from './video';
import { init as initSubtitle } from './subtitle';
import { init as initTime } from './time';

(async () => {
  console.warn(`cs: ${window.location.origin}`);

  const connectionSubject = new Subject<boolean>();
  let connected = false;
  connectionSubject.subscribe((event) => {
    connected = event;
  });

  const messageObservable = fromEvent<MessageEvent>(window.self, 'message').pipe(filter((k) => k.data.plusSubActionFromPopup));

  messageObservable.pipe<MessageEvent<{ plusSubActionFromPopup: string }>>(filter((k) => k.data.plusSubActionFromPopup === 'REQUEST_FOR_REGISTER')).subscribe(() => {
    console.warn(`cs (${window.location.origin}): req for reg`);
    if (connected) {
      console.warn(`cs (${window.location.origin}): but already connected`);
      return;
    }
    console.warn(`cs (${window.location.origin}): send register me`);
    postMessage({ plusSubActionFromContentScript: 'REGISTER_ME_REQUEST_FROM_IFRAME' });
  });

  messageObservable.pipe<MessageEvent<{ plusSubActionFromPopup: string }>>(filter((k) => k.data.plusSubActionFromPopup === 'REGISTER_ACK')).subscribe(() => {
    console.warn(`cs (${window.location.origin}): register ack`);
    connectionSubject.next(true);
  });

  messageObservable.pipe<MessageEvent<{ plusSubActionFromPopup: string }>>(filter((k) => k.data.plusSubActionFromPopup === 'UNMOUNT')).subscribe(() => {
    connectionSubject.next(false);
    console.warn(`cs (${window.location.origin}): unmount`);
  });

  const { videoMap } = initVideo({ messageObservable, connectionObservable: connectionSubject });
  initHighlight({ getElementFrom: (id: string) => videoMap.getElementFrom(id), messageObservable });
  initSubtitle({ getElementFrom: (id: string) => videoMap.getElementFrom(id), messageObservable });
  initTime({ getElementFrom: (id: string) => videoMap.getElementFrom(id), messageObservable, connectionObservable: connectionSubject });

  postMessage({ plusSubActionFromContentScript: 'REGISTER_ME_REQUEST_FROM_IFRAME' });
})();