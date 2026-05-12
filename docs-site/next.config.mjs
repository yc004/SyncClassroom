import nextra from 'nextra'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const basePath = isGitHubPages && repositoryName && !repositoryName.endsWith('.github.io')
  ? `/${repositoryName}`
  : ''

const withNextra = nextra({
  search: {
    codeblocks: false
  }
})

export default withNextra({
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  ...(isGitHubPages
    ? {
        output: 'export',
        basePath,
        assetPrefix: basePath,
        trailingSlash: true
      }
    : {}),
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.jsx'
    }
  }
})
