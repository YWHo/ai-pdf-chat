"use client";
import React from "react";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SendIcon } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = {
  chatId: number;
};

function ChatComponent({ chatId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.get<Message[]>(
        `/api/chat-messages/?id=${chatId}`
      );
      return response.data;
    },
  });
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      className="relative max-h-screen overflow-scroll"
      id="message-container"
    >
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* message list */}
      <MessageList messages={messages} isLoading={isLoading} />
      <form
        name="askQuestion"
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white flex"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask any question"
          className="w-full"
        />
        <Button className="bg-blue-600 ml-2">
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default ChatComponent;
