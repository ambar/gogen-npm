const {mock} = require('gogen')

const directory = 'dist'
const answers = {
  description: 'superb',
  devDeps: [],
}

describe('template', () => {
  it('creates with defaults', async () => {
    const {files, readFile} = await mock('.', directory, {
      answers,
    })
    expect(files).toMatchSnapshot()
    expect(JSON.parse(readFile('package.json'))).toMatchSnapshot()
  })

  it('creates with jest', async () => {
    const {readFile} = await mock('.', directory, {
      answers: {
        ...answers,
        devDeps: ['jest'],
      },
    })
    expect(JSON.parse(readFile('package.json'))).toMatchSnapshot()
  })
})
