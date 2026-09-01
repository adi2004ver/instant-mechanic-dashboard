import axios from 'axios';

// The base URL is now just '/api'. 
// Next.js will automatically proxy this to AWS using the rewrites in next.config.ts!
export const api = axios.create({
  baseURL: '/api',
});
