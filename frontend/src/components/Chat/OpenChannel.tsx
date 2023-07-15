import { ChatContext, ChatList } from "@/contexts/ChatContext";
import { PaperPlaneTilt, UsersThree, XCircle } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import ChatUsersChannelPopOver, { ChatMember } from "./ChatUsersChannelPopOver";
import chatService from "@/services/chatClient";

interface Message {
  id: number;
  content: string;
  userLogin: string;
}

export function OpenChannel() {
  const { selectedChat, handleCloseChat } = useContext(ChatContext);
  // List messages from the websocket
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [numberOfUsersInChat, setNumberOfUsersInChat] = useState<number>(0);
  const [users, setUsers] = useState<ChatMember[]>([]);

  chatService.socket?.on("listMessages", (messages: Message[]) => {
    setMessages(() => messages);
  });
  chatService.socket?.on("message", (message: Message) => {
    setMessages([...messages, message]);
  });
  chatService.socket?.on("listMembers", (members: ChatMember[]) => {
    setNumberOfUsersInChat(members.length);
    setUsers(members);
  });

  const handleSendMessage = () => {
    chatService.socket?.emit("message", {
      chatId: selectedChat.id,
      content: message
    });

    setMessage("");

    setTimeout(() => {
      const messagesContainer = document.getElementById("messages-container");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  if (selectedChat.chatType === "PROTECTED") {
    // password logic
  }

  if (selectedChat.chatType === "PRIVATE") {
    // private logic
  }

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div className="flex flex-row justify-between items-center h-8">
        <div className="flex items-center">
          <ChatUsersChannelPopOver
            users={users}
          >
            <div className="flex space-x-1 items-center">
              <span className="text-xs">({numberOfUsersInChat})</span>
              <UsersThree className="text-white" size={20} />
            </div>
          </ChatUsersChannelPopOver>
        </div>
        <h3 className="text-white text-lg">{selectedChat.name}</h3>
        <XCircle
          className="cursor-pointer"
          color="white"
          size={20}
          onClick={() => handleCloseChat(selectedChat.id)}
        />
      </div>
      <div
        id="messages-container"
        className="flex flex-col flex-1 max-h-[70vh] bg-black42-100 overflow-y-scroll overscroll-contain mb-4 rounded-lg
            scrollbar scrollbar-w-1 scrollbar-rounded-lg scrollbar-thumb-rounded-lg scrollbar-thumb-black42-100 scrollbar-track-black42-300"
      >
        {/* add alternated users messages inside scrollable area */}
        {messages.map((message: any) => (
          <div
            key={message.id}
            // TODO: Implement user context to compare user login with message user
            className={`${message.userLogin === 'caio'
              ? "text-white bg-purple42-200 self-end"
              : "text-white bg-black42-300 self-start"
              } py-2 px-4 w-3/4 rounded-lg mx-2 my-2 break-words`}
          >
            <span className="font-semibold">{message.userLogin}: </span>
            {message.content}
          </div>
        ))}
      </div>
      <div className="flex flex-row justify-between items-center h-9 mt-4 mb-8 relative">
        <textarea
          className="bg-black42-400 text-white rounded-lg p-2 placeholder-gray-700 resize-none w-full pr-16 scrollbar scrollbar-w-1 scrollbar-rounded-lg scrollbar-thumb-rounded-lg scrollbar-thumb-black42-100 scrollbar-track-black42-300"
          placeholder="Digite sua mensagem"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          // send message on keypress enter
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
              e.preventDefault();
            }
          }}
        />
        <button
          className="bg-purple42-200 text-white rounded-lg p-3 placeholder-gray-700 absolute z-10 right-4"
          onClick={() => handleSendMessage()}
        >
          <PaperPlaneTilt size={20} color="white" />
        </button>
      </div>
    </div>
  );
}
