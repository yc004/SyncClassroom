import nextra from 'nextra'

const withNextra = nextra({
  search: {
    codeblocks: false
  }
})

export default withNextra({
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.jsx'
    }
  }
})
