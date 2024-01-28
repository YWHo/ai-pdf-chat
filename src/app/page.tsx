import { Toaster } from "react-hot-toast";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { auth, UserButton } from "@clerk/nextjs";
import { ArrowRightIcon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { getSubscriptionStatus } from "@/lib/subscription";
import SubscriptionButton from "../components/SubscriptionButton";
import { getFirstChat } from "@/lib/chat";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const isPro = await getSubscriptionStatus();
  const firstChat = await getFirstChat(userId);
  return (
    <>
      {/* Note: refer to https://hypercolor.dev to get gradient color
              setting on tailwind */}
      <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center">
              <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
              <UserButton afterSignOutUrl="/" />
            </div>
            <div className="flex mt-2">
              {isAuth && firstChat && (
                <Link href={`/chat/${firstChat.id}`}>
                  <Button>
                    Go to Chats <ArrowRightIcon className="ml-2" />
                  </Button>
                </Link>
              )}
              <div className="ml-3">
                {isAuth && <SubscriptionButton isPro={isPro} />}
              </div>
            </div>
            <p className="max-w-xl mt-2 text-lg text-slate-600">
              Join millions of students, researchers and professionals to
              instantly answer questions and understand research with AI
            </p>
            <div className="w-full mt-4">
              {isAuth ? (
                <FileUpload />
              ) : (
                <Link href="/sign-in">
                  <Button>
                    Login to get Started! <LogInIcon className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
