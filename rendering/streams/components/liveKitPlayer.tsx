import { LiveKitRoom, VideoTrack, AudioTrack, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Loader2 } from "lucide-react";
import "@livekit/components-styles";

interface LiveKitStreamPlayerProps {
  token: string;
  serverUrl: string;
}

export function LiveKitStreamPlayer({ token, serverUrl }: LiveKitStreamPlayerProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      className="relative flex-1 w-full h-full min-h-[300px] flex flex-col justify-between overflow-hidden bg-slate-950"
    >
      <VideoRenderer />
    </LiveKitRoom>
  );
}

function VideoRenderer() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const videoTrack = tracks.find((t) => t.source === Track.Source.Camera);
  const audioTrack = tracks.find((t) => t.source === Track.Source.Microphone);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {videoTrack && videoTrack.publication?.isSubscribed ? (
        <VideoTrack
          trackRef={videoTrack}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="text-white/70 flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#2d7a4f]" />
          <p className="text-sm">Connecting to stream...</p>
        </div>
      )}
      {audioTrack && audioTrack.publication?.isSubscribed && (
        <AudioTrack trackRef={audioTrack} />
      )}
    </div>
  );
}
