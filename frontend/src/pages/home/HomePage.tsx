import Topbar from "@/components/Topbar"
import { useMusicStore } from "@/stores/useMusicStore"
import { useEffect } from "react"
import FeaturedSection from "./component/FeaturedSection"
import { ScrollArea } from "@/components/ui/scroll-area"
import SectionGrid from "./component/SectionGrid"
import { usePlayerStore } from "@/stores/usePlayerStore"

const HomePage = () => {

  const {initializeQueue} = usePlayerStore()

  const {
    fetchFeaturedSongs,
    fetchMadeForYouSongs,
    fetchTrendingSongs,
    isLoading,
    madeForYouSongs,
    featuredSongs,  
    trendingSongs,
  }=useMusicStore()

  useEffect(() => {
    fetchFeaturedSongs()
    fetchMadeForYouSongs()
    fetchTrendingSongs()
  },[fetchFeaturedSongs,fetchMadeForYouSongs,fetchTrendingSongs])


  useEffect(() => {
    if(madeForYouSongs.length > 0 && featuredSongs.length>0 && trendingSongs.length>0){
      const allSongs=[...madeForYouSongs,...featuredSongs,...trendingSongs]
      initializeQueue(allSongs)
    } 
  },[initializeQueue,madeForYouSongs,featuredSongs,trendingSongs])


  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900">
      <Topbar/>
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-3 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Good Afternoon</h1>
          <FeaturedSection/>
          <div className="space-y-4 sm:space-y-6">
            <SectionGrid title="Made For You" songs={madeForYouSongs} isLoading={isLoading} />
            <SectionGrid title="Trending" songs={trendingSongs} isLoading={isLoading}/>
          </div>
        </div>
      </ScrollArea>
    </main>
  )
}

export default HomePage