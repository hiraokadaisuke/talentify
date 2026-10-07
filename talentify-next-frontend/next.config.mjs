/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // The portrait worker is browser-only, including during Next's server compilation.
    config.resolve.alias['@huggingface/transformers$'] = new URL(
      './node_modules/@huggingface/transformers/dist/transformers.web.js', import.meta.url
    ).pathname;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
