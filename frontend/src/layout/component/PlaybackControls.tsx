import { useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX 
} from 'lucide-react';
import usePlayerStore from '@/store/usePlayerStore';

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const PlaybackControls = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    playSong,
    pauseSong,
    setVolume,
    toggleMute,
    setCurrentTime,
    playNext,
    playPrevious
  } = usePlayerStore();

  const progressRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    if (!currentSong) return;
    if (isPlaying) {
      pauseSong();
    } else {
      playSong(currentSong);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentSong) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const progressWidth = rect.width;
    const newTime = (clickPosition / progressWidth) * duration;
    
    setCurrentTime(newTime);
    const audio = document.querySelector('audio');
    if (audio) {
      audio.currentTime = newTime;
    }
  };

  if (!currentSong) {
    return (
      <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-center">
        <p className="text-gray-400">No song selected</p>
      </div>
    );
  }

  return (
    <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center px-4">
      {/* Song Info */}
      <div className="flex items-center w-1/4 min-w-0">
        <img
          src={currentSong.imageUrl}
          alt={currentSong.title}
          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
        />
        <div className="ml-3 min-w-0">
          <h3 className="text-white font-medium truncate" title={currentSong.title}>
            {currentSong.title}
          </h3>
          <p className="text-gray-400 text-sm truncate" title={currentSong.artist}>
            {currentSong.artist}
          </p>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={playPrevious}
            className="text-gray-400 hover:text-white"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button 
            onClick={playNext}
            className="text-gray-400 hover:text-white"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center space-x-2 mt-2">
          <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(currentTime)}</span>
          <div
            ref={progressRef}
            className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center space-x-2 ml-4">
        <button onClick={toggleMute} className="text-gray-400 hover:text-white">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 accent-green-500"
        />
      </div>
    </div>
  );
};

export default PlaybackControls;
