import { Inter } from "next/font/google";
import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const getServerSideProps = async ({ req, res }) => {
}

export default function Admin() {
  return (
    <>

      <h1>Admin</h1>
    </>
  );
}