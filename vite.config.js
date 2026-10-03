import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function localBrandIcons() {
  return {
    name: 'local-brand-icons',
    transformIndexHtml(html) {
      const marker = '<!-- Optional local brand icons -->'
      const directory = resolve(process.cwd(), 'public')
      const required = ['favicon.ico', 'favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png', 'site.webmanifest']
      if (!required.every(name => existsSync(resolve(directory, name)))) return html.replace(marker, '')

      const version = createHash('sha256').update(readFileSync(resolve(directory, 'favicon.ico'))).digest('hex').slice(0, 8)
      const links = [
        `<link rel="icon" href="/favicon.ico?v=${version}" sizes="any" />`,
        `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=${version}" />`,
        `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=${version}" />`,
        `<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${version}" />`,
        `<link rel="manifest" href="/site.webmanifest?v=${version}" />`,
      ]
      return html.replace(marker, links.join('\n  '))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localBrandIcons()],
  optimizeDeps: { esbuildOptions: { sourcemap: false } },
})
