import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))

const NON_INTERACTIVE_ARGS = [
  '--name',
  'demo-app',
  '--display-name',
  'Demo App',
  '--description',
  'Demo application',
  '--web-port',
  '5174',
  '--api-port',
  '3001',
]

async function withTempProject(run) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'init-project-'))

  try {
    await run(tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

async function writeTemplateFiles(tempDir) {
  const files = {
    'package.json': JSON.stringify({ name: 'inwanding-fullstack-template' }, null, 2),
    '.project-meta.json': JSON.stringify(
      {
        initialized: false,
        templateName: 'inwanding-fullstack-template',
        displayName: 'Inwanding Fullstack',
        description: 'Template description',
        webPort: 5173,
        apiPort: 3000,
      },
      null,
      2,
    ),
    'apps/web/index.html': '<title>Inwanding Fullstack</title>\n',
    'apps/web/vite.config.ts': 'port: Number(process.env.WEB_PORT) || 5173,\n',
    'apps/web/.env.example': 'VITE_API_BASE_URL=http://localhost:3000\n',
    'apps/api/.env.example':
      'NODE_ENV=development\nPORT=3000\nCORS_ORIGIN=http://localhost:5173\nLOG_LEVEL=info\n',
    'apps/web/src/components/common/AppHeader.vue': 'Inwanding Fullstack\n',
    'README.md': '# inwanding-fullstack-template\n',
  }

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(tempDir, relativePath)
    await mkdir(path.dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, content, 'utf8')
  }
}

async function withChdir(tempDir, run) {
  const previousRoot = process.cwd()
  process.chdir(tempDir)

  try {
    return await run()
  } finally {
    process.chdir(previousRoot)
  }
}

async function loadInitProject() {
  return import(pathToFileURL(path.join(scriptsDir, 'init-project.mjs')).href)
}

test('initProject updates package metadata and env files', async () => {
  await withTempProject(async (tempDir) => {
    await writeTemplateFiles(tempDir)

    await withChdir(tempDir, async () => {
      const { initProject } = await loadInitProject()
      const result = await initProject(NON_INTERACTIVE_ARGS)

      assert.equal(result.name, 'demo-app')
      assert.equal(result.displayName, 'Demo App')

      const packageJson = JSON.parse(await readFile(path.join(tempDir, 'package.json'), 'utf8'))
      assert.equal(packageJson.name, 'demo-app')

      const webEnv = await readFile(path.join(tempDir, 'apps/web/.env'), 'utf8')
      assert.match(webEnv, /http:\/\/localhost:3001/)

      const apiEnv = await readFile(path.join(tempDir, 'apps/api/.env'), 'utf8')
      assert.match(apiEnv, /PORT=3001/)
      assert.match(apiEnv, /http:\/\/localhost:5174/)

      const meta = JSON.parse(await readFile(path.join(tempDir, '.project-meta.json'), 'utf8'))
      assert.equal(meta.initialized, true)
      assert.equal(meta.name, 'demo-app')
    })
  })
})

test('initProject refuses repeat initialization without force', async () => {
  await withTempProject(async (tempDir) => {
    await writeFile(
      path.join(tempDir, '.project-meta.json'),
      JSON.stringify({ initialized: true, name: 'demo-app' }, null, 2),
      'utf8',
    )
    await writeFile(path.join(tempDir, 'package.json'), '{"name":"demo-app"}', 'utf8')

    await withChdir(tempDir, async () => {
      const { initProject } = await loadInitProject()
      await assert.rejects(() => initProject(), /already been initialized/i)
    })
  })
})

test('initProject refuses repeat non-interactive initialization without force', async () => {
  await withTempProject(async (tempDir) => {
    await writeTemplateFiles(tempDir)

    await withChdir(tempDir, async () => {
      const { initProject } = await loadInitProject()
      await initProject(NON_INTERACTIVE_ARGS)

      const packageJsonBefore = await readFile(path.join(tempDir, 'package.json'), 'utf8')
      const metaBefore = await readFile(path.join(tempDir, '.project-meta.json'), 'utf8')

      await assert.rejects(() => initProject(NON_INTERACTIVE_ARGS), /already been initialized/i)

      const packageJsonAfter = await readFile(path.join(tempDir, 'package.json'), 'utf8')
      const metaAfter = await readFile(path.join(tempDir, '.project-meta.json'), 'utf8')

      assert.equal(packageJsonAfter, packageJsonBefore)
      assert.equal(metaAfter, metaBefore)
    })
  })
})

test('initProject allows repeat non-interactive initialization with --force', async () => {
  await withTempProject(async (tempDir) => {
    await writeTemplateFiles(tempDir)

    await withChdir(tempDir, async () => {
      const { initProject } = await loadInitProject()
      await initProject(NON_INTERACTIVE_ARGS)

      const forceArgs = [
        '--force',
        '--name',
        'renamed-app',
        '--display-name',
        'Renamed App',
        '--description',
        'Renamed application',
        '--web-port',
        '5180',
        '--api-port',
        '3002',
      ]

      const result = await initProject(forceArgs)

      assert.equal(result.name, 'renamed-app')
      assert.equal(result.displayName, 'Renamed App')

      const packageJson = JSON.parse(await readFile(path.join(tempDir, 'package.json'), 'utf8'))
      assert.equal(packageJson.name, 'renamed-app')

      const meta = JSON.parse(await readFile(path.join(tempDir, '.project-meta.json'), 'utf8'))
      assert.equal(meta.initialized, true)
      assert.equal(meta.name, 'renamed-app')
      assert.equal(meta.webPort, 5180)
      assert.equal(meta.apiPort, 3002)
    })
  })
})
