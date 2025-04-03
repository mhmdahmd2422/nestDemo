import * as Bcrypt from 'bcryptjs';

const saltRounds = 10

export namespace HashHelper {
  export function run(content: string): string {
    const salt = Bcrypt.genSaltSync(saltRounds)
    return Bcrypt.hashSync(content, salt)
  }

  export function verify(value: string, valueHash: string): boolean {
    return Bcrypt.compareSync(value, valueHash)
  }
}
