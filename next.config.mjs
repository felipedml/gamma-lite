/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Se quiser “forçar” o build mesmo com problemas de TS/ESLint,
  // troque estes dois para true. Mantive como false (seguro).
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  }
};

export default nextConfig;
