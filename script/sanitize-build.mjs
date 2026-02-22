import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.argv[2] || 'dist'

const hasExtension = (specifier) => /\.(js|mjs|cjs|json)$/i.test(specifier)
const isRelative = (specifier) => specifier.startsWith('./') || specifier.startsWith('../')
const withJs = (specifier) => (isRelative(specifier) && !hasExtension(specifier) ? `${specifier}.js` : specifier)

const patchFile = async (filePath) => {
  const original = await fs.readFile(filePath, 'utf8')
  let next = original

  next = next.replace(/(from\s+['"])(\.{1,2}\/[^'"\n]+)(['"])/g, (_, p1, p2, p3) => `${p1}${withJs(p2)}${p3}`)
  next = next.replace(/(import\s*\(\s*['"])(\.{1,2}\/[^'"\n]+)(['"]\s*\))/g, (_, p1, p2, p3) => `${p1}${withJs(p2)}${p3}`)
  next = next.replace(/(import\s+['"])(\.{1,2}\/[^'"\n]+)(['"])/g, (_, p1, p2, p3) => `${p1}${withJs(p2)}${p3}`)

  if (next !== original) {
    await fs.writeFile(filePath, next)
  }
}

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full)
    } else if (entry.isFile() && full.endsWith('.js')) {
      await patchFile(full)
    }
  }
}

await walk(root)
