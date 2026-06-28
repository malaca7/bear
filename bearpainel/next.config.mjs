import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically delete the conflicting middleware.ts if it exists,
// since Next.js 16.2.9 deprecates middleware.ts in favor of proxy.ts
const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  try {
    fs.unlinkSync(middlewarePath);
    console.log('--- BEAR System: Deleted conflicting src/middleware.ts to use proxy.ts ---');
  } catch (err) {
    console.error('Failed to delete conflicting middleware:', err);
  }
}

// Dynamically retrieve local network IPs for HMR cross-origin safety
const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
};

const localIPs = getLocalIPs();
const devOrigins = [
  'localhost',
  '127.0.0.1',
  ...localIPs,
  ...localIPs.map(ip => `${ip}:5175`),
  ...localIPs.map(ip => `${ip}:3000`)
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: devOrigins,
};

export default nextConfig;
