import UsersListSkeleton from "@/components/skeletons/UsersListSkelotons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/stores/useChatStore"

const UserList = () => {
    const {users,selectedUser,isLoading,setSelectedUser,onlineUsers}=useChatStore()
  return (
    <div className="border-r border-zinc-800">
        <div className="flex flex-col h-full">
            <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-2 p-4">
                    {isLoading ?(
                        <UsersListSkeleton/>
                    ):(
                        users.map((user) => (
                            <div key={user._id}
                            onClick={()=>setSelectedUser(user)}
                            className={`flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg transition-colors cursor-pointer
                            ${selectedUser?.clerkId === user._id ? "bg-zinc-700" : "hover:bg-zinc-700/50"}`}
                            >
                                <div className="relative">
                                    <Avatar className="size-8 md:size-12">
                                        <AvatarImage src={user.imageUrl}/>
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                {/* Online Indicator */}
                                <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-zinc-900
                                    ${onlineUsers.has(user.clerkId) ? "bg-green-500" : "bg-zinc-500"}`}
										/>
									</div>

									<div className='flex-1 min-w-0 lg:block hidden'>
										<span className='font-medium truncate'>{user.name}</span>
									</div>

                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    </div>
  )
}

export default UserList