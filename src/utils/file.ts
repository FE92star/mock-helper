import fs from 'node:fs'

export function readJsonFile(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const fileContents = fs.readFileSync(file, { encoding: 'utf-8' })

      resolve(fileContents)
    }
    catch (error) {
      reject(error)
    }
  })
}

export function writeJsonFile(file: string, json: any) {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(file, JSON.stringify(json, null, 2), {
        encoding: 'utf-8',
      })

      resolve(file)
    }
    catch (error) {
      reject(error)
    }
  })
}
