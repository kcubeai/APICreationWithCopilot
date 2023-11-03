/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: 'http://localhost:3000',
  reactStrictMode: true,
  images: {
    loader: 'imgix',
    path: '', // Empty path to make the URLs absolute
  },
  // useFileSystemPublicRoutes: false
}

module.exports = nextConfig
