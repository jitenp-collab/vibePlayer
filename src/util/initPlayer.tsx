import TrackPlayer, { PlayerCommand } from '@rntp/player';

export const initPlayer = () => {
  try {
    TrackPlayer.setupPlayer({
      android: {
        notification: {
          channelId: 'vibeplayer_playback',
          channelName: 'Music Playback',
          smallIcon: 'ic_launcher',
        },
      },
    });

    TrackPlayer.setCommands({
      capabilities: [
        PlayerCommand.PlayPause,
        PlayerCommand.Next,
        PlayerCommand.Previous,
        PlayerCommand.Seek,
      ],
      handling: 'native',
    });

    // console.log('TrackPlayer ready');
  } catch (e) {
    console.log('TrackPlayer setup error:', e);
  }
};