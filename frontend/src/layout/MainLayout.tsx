import {Outlet} from 'react-router-dom';
import {ResizablePanelGroup, ResizablePanel, ResizableHandle} from '@/components/ui/resizable';
import LeftSidebar from './component/LeftSidebar';
import FriendsActivity from './component/FriendsActivity';
import AudioPlayer from './component/AudioPlayer';
import PlaybackControls from './component/PlaybackControls';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const MainLayout = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className='h-screen bg-black text-white flex flex-col'>
            {isMobile && (
                <div className="flex items-center justify-between p-2 bg-zinc-900">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <img src="/spotify.png" alt="Logo" className='size-8' />
                </div>
            )}
            <ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
                <AudioPlayer/>
                {(!isMobile || isSidebarOpen) && (
                    <>
                        <ResizablePanel defaultSize={20} minSize={isMobile ? 0 : 10} maxSize={30}>
                            <LeftSidebar/>
                        </ResizablePanel>
                        <ResizableHandle className='w-2 bg-black rounded-lg transition-colors'/>
                    </>
                )}
                <ResizablePanel defaultSize={isMobile ? 100 : 60}>
                    <Outlet/>
                </ResizablePanel>
                {!isMobile && (
                    <>
                        <ResizableHandle className='w-2 bg-black rounded-lg transition-colors'/>
                        <ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
                            <FriendsActivity/>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
            <PlaybackControls/>
        </div>
    );
}

export default MainLayout;