import { SignedOut,UserButton } from '@clerk/clerk-react'
import { LayoutDashboardIcon } from 'lucide-react'
import {Link} from 'react-router-dom'
import SignInAuthButton from './SignInAuthButton'
import { useAuthStore } from '@/stores/useAuthStore'
import { buttonVariants } from './ui/button'
import { cn } from '@/lib/utils'


const Topbar = () => {
    const {isAdmin} = useAuthStore()
    
    // console.log("isAdmin",{isAdmin})
  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
        <Link to={"/"} className='flex items-center'> 
                    <img src="/spotify.png" alt="Spotify" className="size-8 mr-2"/>
                    Spotify
        </Link>
        <div className="flex gap-4 items-center">
            {isAdmin && (
                <Link to={"/admin"} className={cn(buttonVariants({variant:"outline"}))}> 
                    <LayoutDashboardIcon className='size-4 mr-2'/>
                    Admin Dashboard
                </Link>
            )}
            <SignedOut>
                <SignInAuthButton/>
            </SignedOut>
            <UserButton/>
        </div>
    </div>
  )
}

export default Topbar