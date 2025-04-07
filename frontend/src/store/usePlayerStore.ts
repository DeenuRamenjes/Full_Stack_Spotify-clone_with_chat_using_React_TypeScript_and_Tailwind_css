import { create } from 'zustand';
import { Song } from '@/types/song';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (songs: Song[]) => void;
}

const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 1,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  queue: [],
  currentIndex: -1,

  playSong: (song) => set((state) => {
    // If the same song is already playing, just toggle play/pause
    if (state.currentSong?._id === song._id) {
      return { isPlaying: !state.isPlaying };
    }
    // Otherwise, play the new song and reset time
    const songIndex = state.queue.findIndex(s => s._id === song._id);
    return { 
      currentSong: song, 
      isPlaying: true,
      currentTime: 0,
      currentIndex: songIndex !== -1 ? songIndex : state.currentIndex
    };
  }),

  pauseSong: () => set({ isPlaying: false }),

  setVolume: (volume) => set({ volume }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setQueue: (songs) => set({ queue: songs }),

  playNext: () => set((state) => {
    if (state.queue.length === 0) return state;
    
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.queue.length) return state;
    
    return {
      currentSong: state.queue[nextIndex],
      currentIndex: nextIndex,
      isPlaying: true,
      currentTime: 0
    };
  }),

  playPrevious: () => set((state) => {
    if (state.queue.length === 0) return state;
    
    const prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) return state;
    
    return {
      currentSong: state.queue[prevIndex],
      currentIndex: prevIndex,
      isPlaying: true,
      currentTime: 0
    };
  }),
}));

export default usePlayerStore; 