import { config } from '@/auth';
import NextAuth from 'next-auth/next';

export default (req, res) => NextAuth(req, res, config);