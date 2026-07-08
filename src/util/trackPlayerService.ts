import TrackPlayer, { Event, type BackgroundEvent } from '@rntp/player';

export default async function playbackService(event: BackgroundEvent) {
  switch (event.type) {
    case Event.RemotePlay:
      TrackPlayer.play();
      break;
    case Event.RemotePause:
      TrackPlayer.pause();
      break;
    case Event.RemoteNext:
      TrackPlayer.skipToNext();
      break;
    case Event.RemotePrevious:
      TrackPlayer.skipToPrevious();
      break;
    case Event.RemoteStop:
      TrackPlayer.stop();
      break;
    case Event.RemoteSeek:
      TrackPlayer.seekTo(event.position);
      break;
    case Event.RemoteSkipForward:
      TrackPlayer.seekBy(event.interval);
      break;
    case Event.RemoteSkipBackward:
      TrackPlayer.seekBy(-event.interval);
      break;
  }
}