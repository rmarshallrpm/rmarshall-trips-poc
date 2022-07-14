/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cms.inspirato.com']
  }, 
  publicRuntimeConfig: {
    cmsUrl: 'https://cms.inspirato.com'
  } 
}

module.exports = nextConfig
