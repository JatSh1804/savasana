import { AdvancedChatBoxComponent } from "@/components/advanced-chat-box";
import { Toaster } from "@/components/ui/toaster";
// import Image from "next/image";

export default function Home() {
  return (
    <>
      <AdvancedChatBoxComponent />
      <Toaster />
    </>
  );
}
