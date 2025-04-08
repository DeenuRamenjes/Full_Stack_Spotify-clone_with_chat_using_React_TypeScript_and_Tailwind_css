import { useEffect, useRef, useState } from 'react';
import usePlayerStore from '@/store/usePlayerStore';
import { useChatStore } from '@/stores/useChatStore';
import { useUser } from '@clerk/clerk-react';

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useUser();
  const { socket } = useChatStore();
  const { 
    currentSong, 
    isPlaying, 
    volume, 
    isMuted,
    setCurrentTime,
    setDuration,
    playNext
  } = usePlayerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      setDuration(audio.duration);
      if (isPlaying) {
        audio.play().catch(err => {
          console.error('Error playing audio:', err);
          setError('Failed to play audio');
        });
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Error loading audio');
      console.error('Audio error:', audio.error);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, isPlaying, setCurrentTime, setDuration, playNext]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          setError('Failed to play audio');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Emit activity updates when song changes or play state changes
  useEffect(() => {
    if (user && socket && currentSong) {
      const activity = isPlaying 
        ? `Listening to ${currentSong.title} by ${currentSong.artist}`
        : '';
      socket.emit('update_activity', { userId: user.id, activity });
    }
  }, [currentSong, isPlaying, user, socket]);

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        preload="auto"
      />
      {isLoading && (
        <div className="fixed bottom-20 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-center">
          Loading audio...
        </div>
      )}
      {error && (
        <div className="fixed bottom-20 left-0 right-0 bg-red-900 text-white p-2 text-center">
          {error}
        </div>
      )}
    </>
  );
};

export default AudioPlayer; 