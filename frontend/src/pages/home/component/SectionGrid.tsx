import { Song } from "@/types/song"
import { Play, Pause } from "lucide-react"
import usePlayerStore from "@/store/usePlayerStore"

interface SectionGridProps {
    title: string;
    songs: Song[];
    isLoading: boolean;
    onPlayPause: (song: Song) => void;
}

const SectionGrid = ({ title, songs, isLoading, onPlayPause }: SectionGridProps) => {
    const { currentSong, isPlaying } = usePlayerStore();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-zinc-800/50 rounded-lg p-4 animate-pulse">
                            <div className="w-full aspect-square bg-zinc-700/50 rounded-lg mb-3" />
                            <div className="h-4 bg-zinc-700/50 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-zinc-700/50 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (songs.length === 0) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <div className="text-zinc-400">No songs available</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {songs.map((song) => (
                    <div
                        key={song._id}
                        className="bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-700/50 transition-colors cursor-pointer group"
                        onClick={() => onPlayPause(song)}
                    >
                        <div className="relative">
                            <img
                                src={song.imageUrl}
                                alt={song.title}
                                className="w-full aspect-square object-cover rounded-lg mb-3"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                                {currentSong?._id === song._id && isPlaying ? (
                                    <Pause className="w-12 h-12 text-white" />
                                ) : (
                                    <Play className="w-12 h-12 text-white" />
                                )}
                            </div>
                        </div>
                        <h3 className="font-semibold text-white truncate">{song.title}</h3>
                        <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SectionGrid