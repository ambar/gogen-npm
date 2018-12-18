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
          {title: 'ESLint', value: 'eslint', selected: false},
          {title: 'Jest', value: 'jest', selected: false},
          {title: 'Prettier', value: 'prettier', selected: false},
        ],
      },
    ],
    {onCancel: process.exit}
  )

  const useJest = devDeps.includes('jest')
  await pipeline(
    src('template/**'),
    packages({
      description,
      files: ['lib'],
      ...(useJest && {
        scripts: {
          prepare: 'npm test',
          test: 'jest',
          'test:coverage': 'jest --coverage',
          'test:watch': 'jest --watch --notify',
        },
      }),
    }),
    template({name, description}),
    dest()
  )
  await install()
  await gitInit()
}
