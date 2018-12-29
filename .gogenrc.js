const {execSync} = require('child_process')
const sh = cmd =>
  execSync(cmd)
    .toString()
    .trim()

module.exports = async (
  {src, dest, pipeline, packages, template},
  {name, install, gitInit, prompts}
) => {
  const {description, devDeps} = await prompts(
    [
      {
        type: 'text',
        name: 'description',
        message: 'Project description',
        initial: 'my awesome project',
      },
      {
        type: 'multiselect',
        name: 'devDeps',
        message: 'Choose dev dependencies',
        choices: [
          {title: 'XO', value: 'xo', selected: false},
          {title: 'Jest', value: 'jest', selected: false},
        ],
      },
    ],
    {onCancel: process.exit}
  )

  const useXO = devDeps.includes('xo')
  const useJest = devDeps.includes('jest')
  const username = sh('git config user.name')

  await pipeline(
    src(['template/**', !useJest && '!**/test/**'].filter(n => n)),
    packages(pkg => {
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
      if (useXO) {
        pkg = {
          ...pkg,
          scripts: {
            ...pkg.scripts,
            prepare: useJest ? ['xo', pkg.scripts.prepare].join(' && ') : 'xo',
            lint: 'xo',
          },
          xo: {
            ...(useJest && {envs: ['node', 'jest']}),
            space: true,
            prettier: true,
          },
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
