import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export default function New() {
  return (
    <>
      <Button>new</Button>
    </>
  );
}
