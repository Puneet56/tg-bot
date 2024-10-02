import { Database, DataSaver } from "./datasaver"

export class JSONDatabase implements DataSaver {
  private file: string

  constructor() {
    this.file = "test-data/db.json"
  }

  updateDb(db: Database) {
    Bun.write(this.file, JSON.stringify(db))
  }

  async create<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(collection: T, document: U): Promise<U> {
    const db = await this.getDb()

    if (!db[collection]) {
      db[collection] = []
    }

    // (db[collection] as (typeof document)[]).push(document)

    //@ts-ignore
    db[collection].push(document)
    this.updateDb(db)

    return Promise.resolve(document)
  }

  async getAll<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(collection: T): Promise<U[]> {
    const db = await this.getDb()
    return db[collection] as U[]
  }

  private async getDb(): Promise<Database> {
    let f = Bun.file(this.file)

    if (!await f.exists()) {
      await Bun.write(this.file, "")
      f = Bun.file(this.file)
    }

    let db: Database
    try {
      db = JSON.parse(await f.text())
    } catch (error) {
      db = {
        todos: [],
        test: []
      }
    }

    return db
  }
}

