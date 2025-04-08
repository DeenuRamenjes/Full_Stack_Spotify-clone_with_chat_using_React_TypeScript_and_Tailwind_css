import Topbar from "@/components/Topbar"
import { useMusicStore } from "@/stores/useMusicStore"
import { useEffect } from "react"
import FeaturedSection from "./component/FeaturedSection"
import { ScrollArea } from "@/components/ui/scroll-area"
import SectionGrid from "./component/SectionGrid"
import usePlayerStore from "@/store/usePlayerStore"
import { Song } from '@/types'

const HomePage = () => {
  const {
    fetchFeaturedSongs,
    fetchMadeForYouSongs,
    fetchTrendingSongs,
    isLoading: musicStoreLoading,
    madeForYouSongs: musicStoreMadeForYouSongs,
    featuredSongs: musicStoreFeaturedSongs,
    trendingSongs: musicStoreTrendingSongs,
    error: musicStoreError
  } = useMusicStore()

  const { currentSong, isPlaying, playSong, pauseSong, setQueue } = usePlayerStore()

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        console.log('Fetching songs...');
        await Promise.all([
          fetchFeaturedSongs(),
          fetchMadeForYouSongs(),
          fetchTrendingSongs()
        ]);
        console.log('Featured songs:', musicStoreFeaturedSongs);
        console.log('Made for you songs:', musicStoreMadeForYouSongs);
        console.log('Trending songs:', musicStoreTrendingSongs);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    }

    fetchSongs()
  }, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs])

  useEffect(() => {
    if (!musicStoreLoading) {
      const allSongs = [
        ...musicStoreMadeForYouSongs,
        ...musicStoreFeaturedSongs,
        ...musicStoreTrendingSongs
      ]
      if (allSongs.length > 0) {
        setQueue(allSongs)
      }
    }
  }, [musicStoreLoading, musicStoreMadeForYouSongs, musicStoreFeaturedSongs, musicStoreTrendingSongs, setQueue])

  const handlePlayPause = (song: Song) => {
    if (currentSong?._id === song._id) {
      if (isPlaying) {
        pauseSong()
      } else {
        playSong(song)
      }
    } else {
      playSong(song)
    }
  }

  if (musicStoreError) {
    return (
      <div className="flex flex-col h-screen">
        <Topbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-center p-4">
            <p className="text-lg font-semibold">Error loading songs</p>
            <p className="text-sm">{musicStoreError}</p>
          </div>
        </div>
      </div>
    )
  }

  if (musicStoreLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Topbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-100">
      <Topbar />
      <ScrollArea className="flex-1 h-[calc(82vh-80px)]">
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          <FeaturedSection />
          <div className="space-y-6 md:space-y-8">
            <SectionGrid 
              title="Made For You" 
              songs={musicStoreMadeForYouSongs} 
              isLoading={musicStoreLoading} 
              onPlayPause={handlePlayPause}
            />
            <SectionGrid 
              title="Featured" 
              songs={musicStoreFeaturedSongs} 
              isLoading={musicStoreLoading} 
              onPlayPause={handlePlayPause}
            />
            <SectionGrid 
              title="Trending" 
              songs={musicStoreTrendingSongs} 
              isLoading={musicStoreLoading} 
              onPlayPause={handlePlayPause}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default HomePage