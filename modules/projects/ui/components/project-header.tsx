import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronLeftIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

interface Props {
    projectId: string;
}

export const ProjectHeader =({projectId}: Props)=> {
    const trpc = useTRPC();
    const {data: project} = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({id: projectId})
    )

    const {setTheme, theme} = useTheme();

    return (
      <header className=" font-bold text-black p-4 flex justify-between items-center border-b bg-black">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="focus-visible: bg-white rounded-none ring-0 pl-2!"
            >
              {/* <Image
                            src="/logo.svg"
                            alt="Floaty"
                            width={18}
                            height={18}
                        /> */}
              <span className="text-normal font-normal">{project.name.toUpperCase()}</span>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="bg-white rounded-none"
          >
            <DropdownMenuItem className="text-black" asChild>
              <Link href="/">
                <ChevronLeftIcon />
                <span className="font-normal">Go to Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <SunMoonIcon className="size-4 text-black" />
                <span className="text-black font-normal">Appearance</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-white text-black font-normal">
                  <DropdownMenuRadioGroup
                    className="text-black"
                    value="light"
                    onValueChange={(theme) => {
                      setTheme(theme);
                    }}
                  >
                    <DropdownMenuRadioItem value="light">
                      <span>Light</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <span>Dark</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <span>Wotah</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
}