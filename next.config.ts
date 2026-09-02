import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remova qualquer bloco "eslint: { ... }" daqui
  typescript: {
    ignoreBuildErrors: true, // Se estiver usando para ignorar erros de build
  },
};

export default nextConfig;