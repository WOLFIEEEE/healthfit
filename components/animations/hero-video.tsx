"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Sync state with actual video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  return (
    <>
      {/* Video element — Trail runner in forest (Mixkit ID 719, free license) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1600&q=85"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Accessible controls — bottom-right */}
      <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2 sm:bottom-7 sm:right-7">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
          title={isPlaying ? "Pause video" : "Play video"}
          className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition-all duration-300 hover:bg-black/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4 translate-x-[1px]" />
          )}
        </button>
        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute background video" : "Mute background video"}
          title={isMuted ? "Unmute" : "Mute"}
          className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition-all duration-300 hover:bg-black/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {isMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </button>
      </div>
    </>
  );
}
