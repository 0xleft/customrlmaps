import NextAuth from "next-auth/next";
import { config } from "@/auth";

export default (req, res) => NextAuth(req, res, config);