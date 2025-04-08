import { create } from 'zustand';
import { Song } from '@/types';

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
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
}

const usePlayerStore = create<PlayerState>((set) => ({
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

    // Find the song in the queue
    const songIndex = state.queue.findIndex(s => s._id === song._id);
    
    // If the song is not in the queue, something is wrong with our queue state
    // This shouldn't happen since we set the queue when songs are loaded
    if (songIndex === -1) {
      console.error('Song not found in queue:', song);
      return state;
    }

    // Play the song from the queue
    return { 
      currentSong: song, 
      isPlaying: true,
      currentTime: 0,
      currentIndex: songIndex
    };
  }),

  pauseSong: () => set({ isPlaying: false }),

  setVolume: (volume) => set({ volume }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setQueue: (songs) => set((state) => {
    // Keep track of the current song if it exists
    const currentSongId = state.currentSong?._id;
    
    // Update the queue with all songs
    const newQueue = [...songs];
    
    // Find the current song's position in the new queue
    const newIndex = currentSongId 
      ? newQueue.findIndex(song => song._id === currentSongId)
      : -1;
    
    return { 
      queue: newQueue,
      currentIndex: newIndex,
      // Keep the current song if it's in the new queue
      currentSong: newIndex !== -1 ? state.currentSong : null,
      // Keep playing only if the current song is in the new queue
      isPlaying: newIndex !== -1 ? state.isPlaying : false
    };
  }),

  addToQueue: (song) => set((state) => {
    // Don't add if already in queue
    if (state.queue.some(s => s._id === song._id)) {
      return state;
    }
    return {
      queue: [...state.queue, song]
    };
  }),

  removeFromQueue: (songId) => set((state) => {
    const newQueue = state.queue.filter(song => song._id !== songId);
    const wasCurrentSong = state.currentSong?._id === songId;
    const newIndex = wasCurrentSong ? -1 : state.currentIndex;
    
    return {
      queue: newQueue,
      currentIndex: newIndex,
      currentSong: wasCurrentSong ? null : state.currentSong,
      isPlaying: wasCurrentSong ? false : state.isPlaying
    };
  }),

  clearQueue: () => set({
    queue: [],
    currentIndex: -1,
    currentSong: null,
    isPlaying: false,
    currentTime: 0
  }),

  playNext: () => set((state) => {
    if (!state.queue.length || state.currentIndex === -1) {
      return state;
    }
    
    const nextIndex = (state.currentIndex + 1) % state.queue.length;
    const nextSong = state.queue[nextIndex];
    
    if (!nextSong) {
      console.error('Next song not found in queue');
      return state;
    }

    return { 
      currentSong: nextSong, 
      isPlaying: true,
      currentTime: 0,
      currentIndex: nextIndex
    };
  }),

  playPrevious: () => set((state) => {
    if (!state.queue.length || state.currentIndex === -1) {
      return state;
    }
    
    const prevIndex = (state.currentIndex - 1 + state.queue.length) % state.queue.length;
    const prevSong = state.queue[prevIndex];
    
    if (!prevSong) {
      console.error('Previous song not found in queue');
      return state;
    }

    return { 
      currentSong: prevSong, 
      isPlaying: true,
      currentTime: 0,
      currentIndex: prevIndex
    };
  }),
}));

export default usePlayerStore; 