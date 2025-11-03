import { Fragment, MessageRole, MessageType } from "@/lib/generated/prisma";
import {Card} from "@/components/ui/card"
import { cn } from "@/lib/utils";
import {format} from "date-fns"
import { Button } from "@/components/ui/button";
import { ChevronRight, Code2, Code2Icon } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface UserMessageProps {
    content: string;
}

const UserMessage =({content}: UserMessageProps)=> {
    return (
      <div className="flex justify-end border-gray-500 pb-4 pr-2 pl-10">
        <Card className="rounded-lg text-black font-normal p-3 shadow-none border-1 border-[#ff7441] max-w-[80%] break-words bg-[#FFF8F6]">
          {content}
        </Card>
      </div>
    );
}

interface AssistantMessageProps {
    content: string;
    fragment: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
}

const AssistantMessage =({
    content,
    fragment,
    createdAt, 
    isActiveFragment, 
    onFragmentClick,
    type,
} : AssistantMessageProps) => {
    // Heuristically format a big paragraph into Markdown sections & bullet points
    const formatAlibiMarkdown = (raw: string) => {
        if (!raw) return raw;
        // If it's already markdown with lists or headings, keep it
        if (/\n-\s|\n\*\s|^#|```/m.test(raw)) return raw;

        let s = raw.trim();
        // Promote common labels to headings
        const labels = [
            "summary",
            "context",
            "facts",
            "evidence",
            "analysis",
            "risk",
            "recommendation",
            "next steps",
            "conclusion",
            "timeline",
            "dates",
            "lawyer",
        ];
        for (const label of labels) {
            const re = new RegExp(`(?:^|\n)\s*${label}\s*:`, "ig");
            s = s.replace(re, (m) => `\n\n### ${label.replace(/\b\w/g, c => c.toUpperCase())}\n`);
        }

        // Split into paragraphs, convert each non-heading paragraph into bullet list
        const paragraphs = s.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
        const toBullets = (text: string) => {
            // Split sentences
            const sentences = text
                .replace(/\s+/g, " ")
                .split(/(?<=[\.!?])\s+/)
                .map((t) => t.trim())
                .filter((t) => t.length > 0);
            if (sentences.length <= 1) return `- ${text}`;
            return sentences.map((t) => `- ${t}`).join("\n");
        };
        const out: string[] = [];
        for (const p of paragraphs) {
            if (/^#{2,3}\s/.test(p)) {
                out.push(p); // heading block
            } else {
                out.push(toBullets(p));
            }
        }
        return out.join("\n\n");
    };
    const formatted = formatAlibiMarkdown(content);
    return (
      <div
        className={cn(
          "flex flex-col group px-2 pb-4 rounded-lg",
          type === "ERROR" && "text-red-700 dark:text-red-500"
        )}
      >
        <div className="flex items-center gap-2 pl-2 mb-2 rounded-lg">
          {/*TODO: add logo */}
          <span className="text-normal font-bold text-[#4184F4]">ALIBI</span>
          <span className="text-xs text-gray-900">
            {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
          </span>
        </div>
        <div className="pl-8.5 flex p-4 flex-col text-black border-[#4184F4] border-1 bg-[#F6FAFE] font-normal gap-y-4 rounded-lg">
          <MarkdownRenderer className="text-black" content={formatted} />
        </div>
      </div>
    );
}

interface FragmentCardProps {
    fragment: Fragment;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
}

const FragmentCard =({
    fragment,
    isActiveFragment,
    onFragmentClick,
} : FragmentCardProps) => {
    return (
        <Button
            className={cn(
                "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
                isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-primary"
            )}
            onClick={()=>onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5"/>
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">
                    {fragment.title}
                </span>
                <span className="text-sm">Preview</span>
            </div>
            <div className="flex items-center justify-center mt-0.5">
                <ChevronRight className="size-4"/>
            </div>
        </Button>
    )
}

interface MessageCardProps {
    content: string;
    role: MessageRole;
    fragment: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
}

export const MessageCard =({
    content,
    role,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type
} : MessageCardProps)=> {
    if(role === "ASSISTANT") {
        return (
            <AssistantMessage
                content={content}
                fragment={fragment}
                createdAt={createdAt}
                isActiveFragment={isActiveFragment}
                onFragmentClick={onFragmentClick}
                type={type}
            />
        )
    }

    return (
        <UserMessage
            content={content}
        />
    )
}