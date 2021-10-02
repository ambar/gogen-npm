const {execSync} = require('child_process')
const sh = (cmd) => execSync(cmd).toString().trim()

module.exports = async (
  {src, dest, pipeline, packages, template, install, gitInit, prompts},
  {name}
) => {
  const {description, devDeps} = await prompts(
    [
      {
        type: 'text',
        name: 'description',
        message: 'Project description',
        initial: 'My awesome project',
      },
      {
        type: 'multiselect',
        name: 'devDeps',
        message: 'Choose dev dependencies',
        choices: [
          {
            title: 'recommended (Prettier/ESLint)',
            value: 'recommended',
            selected: false,
          },
          {title: 'jest (Testing)', value: 'jest', selected: false},
        ],
      },
    ],
    {onCancel: process.exit}
  )

  const useRecommended = devDeps.includes('recommended')
  const useJest = devDeps.includes('jest')
  const username = sh('git config user.name')

  await pipeline(
    src(
      [
        'template/**',
        !useJest && '!**/test/**',
        !useRecommended && '!**/.{eslintrc,prettierrc}.js',
      ].filter(Boolean)
    ),
    packages((pkg) => {
      pkg.files = ['lib']
      if (useJest) {
        pkg.scripts = {
          ...pkg.scripts,
          prepare: 'npm test',
          test: 'jest',
          'test:coverage': 'jest --coverage',
          'test:watch': 'jest --watch --notify',
        }
      }
      if (useRecommended) {
        pkg.scripts = {
          ...pkg.scripts,
          prepare: ['npm run lint', pkg.scripts.prepare]
            .filter(Boolean)
            .join(' && '),
          lint: 'recommended',
          'lint:fix': 'recommended --fix',
        }
      }
      return {
        ...pkg,
        description,
      }
    }),
    template({name, description, username}),
    dest()
  )
  await install(devDeps, {dev: true})
  await gitInit()
}
