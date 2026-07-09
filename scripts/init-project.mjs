#!/usr/bin/env node

import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { access, copyFile, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getRootDir() {
  return process.cwd()
}

function getMetaPath() {
  return path.join(getRootDir(), '.project-meta.json')
}

const PACKAGE_NAME_RE = /^[a-z][a-z0-9-]*$/
const PORT_RE = /^(?:[1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/

function parseArgs(argv) {
  const options = {}

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (!arg.startsWith('--')) {
      continue
    }

    const key = arg.slice(2)
    const next = argv[index + 1]

    if (!next || next.startsWith('--')) {
      options[key] = true
      continue
    }

    options[key] = next
    index += 1
  }

  return options
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function readMeta() {
  const raw = await readFile(getMetaPath(), 'utf8')
  return JSON.parse(raw)
}

async function writeMeta(meta) {
  await writeFile(getMetaPath(), `${JSON.stringify(meta, null, 2)}\n`, 'utf8')
}

function validatePackageName(name) {
  if (!PACKAGE_NAME_RE.test(name)) {
    throw new Error('Package name must use lowercase letters, numbers, and hyphens only.')
  }
}

function validatePort(port, label) {
  if (!PORT_RE.test(String(port))) {
    throw new Error(`${label} must be a valid TCP port between 1 and 65535.`)
  }
}

function validateDisplayName(displayName) {
  if (!displayName.trim()) {
    throw new Error('Display name is required.')
  }
}

async function promptValue(rl, question, fallback) {
  const answer = (await rl.question(`${question} [${fallback}]: `)).trim()
  return answer || fallback
}

async function resolveOptions(argv) {
  const args = parseArgs(argv)
  const meta = await readMeta()
  const rl = createInterface({ input, output })
  const force = Boolean(args.force)

  try {
    if (meta.initialized && !force) {
      throw new Error('Project has already been initialized. Use --force to initialize again.')
    }

    const name = args.name ?? (await promptValue(rl, 'Package name', meta.templateName))
    const displayName =
      args['display-name'] ?? (await promptValue(rl, 'Display name', meta.displayName))
    const description = args.description ?? (await promptValue(rl, 'Description', meta.description))
    const webPort = args['web-port'] ?? (await promptValue(rl, 'Web port', String(meta.webPort)))
    const apiPort = args['api-port'] ?? (await promptValue(rl, 'API port', String(meta.apiPort)))

    validatePackageName(name)
    validateDisplayName(displayName)
    validatePort(webPort, 'Web port')
    validatePort(apiPort, 'API port')

    if (!description.trim()) {
      throw new Error('Description is required.')
    }

    return {
      name,
      displayName,
      description,
      webPort: Number(webPort),
      apiPort: Number(apiPort),
      force,
    }
  } finally {
    rl.close()
  }
}

async function replaceInFile(filePath, replacements) {
  let content = await readFile(filePath, 'utf8')

  for (const [from, to] of replacements) {
    content = content.split(from).join(to)
  }

  await writeFile(filePath, content, 'utf8')
}

async function ensureEnvFromExample(examplePath, envPath, replacements) {
  if (!(await fileExists(envPath))) {
    await copyFile(examplePath, envPath)
  }

  await replaceInFile(envPath, replacements)
}

async function updateVitePort(webPort) {
  const viteConfigPath = path.join(getRootDir(), 'apps/web/vite.config.ts')
  let content = await readFile(viteConfigPath, 'utf8')

  if (content.includes('port: Number(process.env.WEB_PORT)')) {
    return
  }

  content = content.replace(
    /port:\s*Number\(process\.env\.WEB_PORT\)\s*\|\|\s*\d+/,
    `port: Number(process.env.WEB_PORT) || ${webPort}`,
  )

  await writeFile(viteConfigPath, content, 'utf8')
}

async function updateReadme({ name, displayName, description, webPort, apiPort }) {
  const readmePath = path.join(getRootDir(), 'README.md')
  const content = `# ${displayName}

${description}

## Quick start

\`\`\`bash
corepack enable
pnpm install
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
pnpm dev
\`\`\`

- Web: http://localhost:${webPort}
- API health: http://localhost:${apiPort}/health

## Initialize from template

This project was initialized from \`inwanding-fullstack-template\` as \`${name}\`.

Run \`pnpm init:project\` again only with \`--force\` if you need to rename the project.
`

  await writeFile(readmePath, content, 'utf8')
}

export async function initProject(argv = process.argv.slice(2)) {
  const options = await resolveOptions(argv)
  const rootDir = getRootDir()
  const webOrigin = `http://localhost:${options.webPort}`
  const apiOrigin = `http://localhost:${options.apiPort}`

  const packageJsonPath = path.join(rootDir, 'package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  packageJson.name = options.name
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')

  await replaceInFile(path.join(rootDir, 'apps/web/index.html'), [
    ['<title>Inwanding Fullstack</title>', `<title>${options.displayName}</title>`],
  ])

  await replaceInFile(path.join(rootDir, 'apps/web/src/components/common/AppHeader.vue'), [
    ['Inwanding Fullstack', options.displayName],
  ])

  await ensureEnvFromExample(
    path.join(rootDir, 'apps/web/.env.example'),
    path.join(rootDir, 'apps/web/.env'),
    [['http://localhost:3000', apiOrigin]],
  )

  await ensureEnvFromExample(
    path.join(rootDir, 'apps/api/.env.example'),
    path.join(rootDir, 'apps/api/.env'),
    [
      ['PORT=3000', `PORT=${options.apiPort}`],
      ['http://localhost:5173', webOrigin],
    ],
  )

  await updateVitePort(options.webPort)
  await updateReadme(options)

  await writeMeta({
    initialized: true,
    templateName: 'inwanding-fullstack-template',
    name: options.name,
    displayName: options.displayName,
    description: options.description,
    webPort: options.webPort,
    apiPort: options.apiPort,
    initializedAt: new Date().toISOString(),
  })

  return options
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  initProject()
    .then((result) => {
      console.log(`Initialized project "${result.name}" (${result.displayName}).`)
      console.log(`Web: http://localhost:${result.webPort}`)
      console.log(`API: http://localhost:${result.apiPort}`)
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exitCode = 1
    })
}
