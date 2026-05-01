/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',          // статичний експорт — папка /out/ із чистим HTML
  trailingSlash: true,       // /kultury/sonyashnyk/ замість /kultury/sonyashnyk
  images: {
    unoptimized: true        // для статичного експорту
  }
};

export default nextConfig;
