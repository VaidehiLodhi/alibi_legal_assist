import Image from "next/image"
import { useEffect, useState } from "react";

const ShimmerMessages =()=> {
    const messages = [
      "Making law accessible one node at a time!...",
      "Generating....",
      "Bringing u the knowledge from legal depths..",
      "Searching for the right book....",
      "Almost ready....",
      "Analyzing your request....",
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-base font-medium text-[#4184F4] animate-pulse">
                {messages[currentMessageIndex]}
            </span>
        </div>
    )
}

export const MessageLoading =()=> {
    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                {/* <Image
                    src="/logo.svg"
                    alt="Floaty"
                    width={18}
                    height={18}
                    className="shrink-0"
                /> */}
                <span className="text-md text-[#4184F4] font-medium">
                    Alibi
                </span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-4">
                <ShimmerMessages/>
            </div>
        </div>
    )
}
