/** @type {import('next').NextConfig} */
const nextConfig = {
  /** 
   * needed for WalletConnect 
   * @see {@link https://docs.walletconnect.com/web3modal/nextjs/about?platform=wagmi#extra-configuration}
   */
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  }
}

module.exports = nextConfig
