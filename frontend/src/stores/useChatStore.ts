import { axiosInstance } from "@/lib/axios";
import { Message, User } from "@/types";
import { create } from "zustand";
import {io} from "socket.io-client"
import toast from "react-hot-toast";

interface ChatStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	socket:any
	isConnected: boolean
	onlineUsers:Set<String>
	userActivities:Map<String,String>
	messages:Message[]
	selectedUser: User | null

	fetchUsers: () => Promise<void>;
	initSocket:(userId:string)=>void
	disconnectSocket:()=>void
	sendMessage:(receiverId:string,senderId:string,content:string)=>void
	fetchMessages:(userId:string)=>Promise<void>	
	setSelectedUser:(user: User | null) => void
}

const baseUrl=import.meta.env.MODE==="development" ? "http://localhost:5000" : "/"

const socket = io(baseUrl,{
	autoConnect:false,
	withCredentials:true
});

export const useChatStore = create<ChatStore>((set,get) => ({
	users: [],
	isLoading: false,
	error: null,
	socket:socket,
	isConnected: false,
	onlineUsers:new Set(),
	userActivities:new Map(),
	messages:[],
	selectedUser:null,

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users");
			set({ users: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	initSocket:(userId:string)=>{
		if(!get().isConnected){
			socket.auth = { userId };
			socket.connect();
			socket.emit("user_connected", userId);
			
			socket.on("connect", () => {
				set({ isConnected: true });
			});

			socket.on("disconnect", () => {
				set({ isConnected: false });
			});

			socket.on("users_online", (users:string[]) => {
				set({ onlineUsers: new Set(users) });
			});
			
			socket.on("activities",(activities:[string,string][])=>{
				set({ userActivities: new Map(activities) });
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => ({
					onlineUsers: new Set([...state.onlineUsers, userId]),
				}));
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					return { onlineUsers: newOnlineUsers };
				});
			});

			// Handle incoming messages
			socket.on("receive_message", (message: Message) => {
				const currentUser = get().selectedUser;
				if (currentUser && (message.senderId === currentUser.clerkId || message.receiverId === currentUser.clerkId)) {
					set((state) => ({
						messages: [...state.messages, message],
					}));
				}
			});

			// Handle sent messages - update immediately for sender
			socket.on("message_sent", (message: Message) => {
				const currentUser = get().selectedUser;
				if (currentUser && (message.senderId === currentUser.clerkId || message.receiverId === currentUser.clerkId)) {
					set((state) => {
						// Check if message already exists to avoid duplicates
						const messageExists = state.messages.some(m => m._id === message._id);
						if (!messageExists) {
							return {
								messages: [...state.messages, message],
							};
						}
						return state;
					});
				}
			});

			socket.on("activity_updated", ({ userId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					return { userActivities: newActivities };
				});
			});

			socket.on("error", (error: string) => {
				toast.error(error);
			});
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.disconnect();
			set({ isConnected: false });
		}
	},

	sendMessage: async (receiverId, senderId, content) => {
		const socket = get().socket;
		if (!socket) return;

		try {
			// Create a temporary message object for immediate UI update
			const tempMessage: Message = {
				_id: Date.now().toString(), // Temporary ID
				senderId,
				receiverId,
				content,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};

			// Update UI immediately for sender
			set((state) => ({
				messages: [...state.messages, tempMessage],
			}));

			// Send message to server
			socket.emit("send_message", { receiverId, senderId, content });
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message");
		}
	},

	fetchMessages: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			set({ messages: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	setSelectedUser: (user) => {
		set({ selectedUser: user });
	},
}));
