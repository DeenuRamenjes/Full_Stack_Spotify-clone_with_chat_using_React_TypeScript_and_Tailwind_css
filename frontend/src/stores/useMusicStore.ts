import { axiosInstance } from '@/lib/axios'
import { Album, Song, Stats } from '@/types'
import toast from 'react-hot-toast'
import {create} from 'zustand'


interface MusicStore {
  albums: Album[]
  songs: Song[]
  isLoading: boolean
  error: string | null
  currentAlbum: Album | null
  madeForYouSongs: Song[] 
  trendingSongs: Song[]
  featuredSongs: Song[]
  stats:Stats

  fetchAlbums: () => Promise<void>
  fetchAlbumById: (id: string) => Promise<void>
  fetchMadeForYouSongs: () => Promise<void>
  fetchTrendingSongs: () => Promise<void>
  fetchFeaturedSongs: () => Promise<void>
  fetchStats: () => Promise<void>
  fetchSongs: () => Promise<void>
  deleteSong: (id: string) => Promise<void>
  deleteAlbum: (id: string) => Promise<void>
}




export const useMusicStore = create<MusicStore>((set) => ({
  albums:[],
  songs:[],
  isLoading: false,
  error: null,
  currentAlbum: null,
  madeForYouSongs: [],
  trendingSongs: [],
  featuredSongs: [],
  stats: {
    totalSongs: 0,
    totalAlbums: 0,
    totalUsers: 0,
    totalArtists: 0
  },


  fetchAlbums: async () => {
    set({
      isLoading: true,
      error: null
    })
    try {
      const response = await axiosInstance.get('/album')
      set({
        albums: response.data,
        error: null
      })
    } catch(error: any) {
      console.error('Error fetching albums:', error)
      set({
        error: error.response?.data?.message || 'Failed to fetch albums'
      })
    } finally {
      set({
        isLoading: false
      })
    }
  },


  fetchAlbumById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/album/${id}`);
      set({ currentAlbum: response.data });
    } catch (error: any) {
      console.error('Error fetching album:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch album' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFeaturedSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/featured");
      set({ featuredSongs: response.data });
    } catch (error: any) {
      console.error('Error fetching featured songs:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch featured songs' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMadeForYouSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/made-for-you");
      set({ madeForYouSongs: response.data });
    } catch (error: any) {
      console.error('Error fetching made for you songs:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch made for you songs' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrendingSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/trending");
      set({ trendingSongs: response.data });
    } catch (error: any) {
      console.error('Error fetching trending songs:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch trending songs' });
    } finally {
      set({ isLoading: false });
    }
  },



  // isSongLoading: false,
  // isStatsLoading: false,


  fetchSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs");
      set({ songs: response.data });
    }
    catch{
      set({ error: 'Failed to fetch songs' });
    }
    finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try{
      const response = await axiosInstance.get("/stats");
      set({ stats: response.data });
    }
    catch{
      set({ error: 'Failed to fetch stats' });
    }
    finally {
      set({ isLoading: false });
    }
  },

  deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},
  
}))