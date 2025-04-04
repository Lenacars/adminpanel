/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['secure.gravatar.com', 'localhost', 'i0.wp.com', 'i1.wp.com', 'i2.wp.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Monaco Editor için web worker yapılandırması
    if (!isServer) {
      config.output.globalObject = 'self';
    }
    
    return config;
  },
  // Content Security Policy ayarları
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://*.wp.com https://*.wordpress.com; img-src 'self' data: https://*.wp.com https://*.wordpress.com; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};

export default nextConfig;

