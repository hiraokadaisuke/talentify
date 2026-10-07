/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // The portrait worker is browser-only. Keep Node ONNX bindings out of every Next bundle.
    config.resolve.alias['@huggingface/transformers$'] = new URL(
      './node_modules/@huggingface/transformers/dist/transformers.web.js',
      import.meta.url
    ).pathname;
    config.resolve.alias['onnxruntime-web$'] = new URL(
      './node_modules/onnxruntime-web/dist/ort.bundle.min.mjs',
      import.meta.url
    ).pathname;
    config.resolve.alias['onnxruntime-node$'] = false;
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
