import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";
import { Fragment } from "@/lib/generated/prisma";
import { MessageLoading } from "./message-loading";

interface Props {
    projectId: string;
    activateFragment: Fragment|null;
    setActivateFragment: (fragment: Fragment | null) => void;
}

export const MessagesContainer =({
    projectId,
    activateFragment,
    setActivateFragment
} : Props)=> {
    const bottomRef = useRef<HTMLDivElement>(null);
    const trpc = useTRPC();
    const {data: messages} = useSuspenseQuery(trpc.messages.getMany.queryOptions({
            projectId: projectId,
    },  {
        //TODO: Temporary live feature
        refetchInterval: 5000,
    }))
    //may cause problems
    useEffect(()=> {
        const lastAssistantMessageWithFragment = messages.findLast(
            (message) => message.role === "ASSISTANT" && !!message.fragment,
        )

        if(lastAssistantMessageWithFragment) {
            setActivateFragment(lastAssistantMessageWithFragment.fragment)
        }
    }, [messages, setActivateFragment]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages.length]);

    const lastMessage = messages[messages.length - 1];
    const isLastMessageUser = lastMessage?.role === "USER";

    return (
      <div className="flex flex-col flex-1 min-h-0 bg-white">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="pt-2 pr-1 font-bold">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                content={message.content}
                role={message.role}
                fragment={message.fragment}
                createdAt={message.createdAt}
                isActiveFragment={activateFragment?.id === message.fragment?.id}
                onFragmentClick={() => setActivateFragment(message.fragment)}
                type={message.type}
              />
            ))}
            {isLastMessageUser && <MessageLoading />}
            <div ref={bottomRef} />
          </div>
        </div>
        <div className="relative p-1 bg-[#000000]">
          <div className="absolute -top-6 left-0 right-0 h-6 pointer-events-none" />
          <MessageForm projectId={projectId} />
        </div>
      </div>
    );
}