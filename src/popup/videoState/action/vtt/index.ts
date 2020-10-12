import {Video} from "@/videoState/types";
import {srcToSource} from "@/videoState/state";

import {SrtEntry} from "@/appState";
import {addVttToHostVideo, removeVttFromHostVideo} from './host';
import {addVttToIFrameVideo, removeVttFromIFrameVideo} from './iframe';

interface AddVttToPayload {
  video: Video;
  subtitle: SrtEntry[];
}

export const addVttTo = ({ video, subtitle }: AddVttToPayload): void => {
  if (video.in === 'HOST') {
    addVttToHostVideo({ video, subtitle });
  } else {
    addVttToIFrameVideo({ video, source: srcToSource[video.src], subtitle });
  }
  video.hasSubtitle = true;
};

interface RemoveVttFromPayload {
  video: Video;
}

export const removeVttFrom = ({ video}: RemoveVttFromPayload): void => {
  if (video.in === 'HOST') {
    removeVttFromHostVideo({ video });
  } else {
    removeVttFromIFrameVideo({ video, source: srcToSource[video.src] });
  }
  video.hasSubtitle = false;
};
