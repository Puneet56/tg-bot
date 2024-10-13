import { Database, DataSaver } from "./datasaver"

export class JSONDatabase implements DataSaver {
  private file: string

  constructor() {
    this.file = "test-data/db.json"
  }

  async updateOne<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(collection: T, id: string, data: U): Promise<U> {
    const db = await this.getDb();

    let chat = db[collection].find(e => e.id === id)

    if (!chat) {
      db[collection].push(data as any)
    } else {
      db[collection] = db[collection].map(e => {
        if (e.id === id) {
          e = data
        }

        return e
      })
    }

    await this.updateDb(db)

    return data
  }

  async getOne<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(collection: T, id: string): Promise<U> {
    const db = await this.getDb()

    // @ts-ignore
    return (db[collection] || []).find(e => e.id === id)
  }

  updateDb(db: Database) {
    return Bun.write(this.file, JSON.stringify(db), {
      createPath: true
    })
  }

  async create<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(collection: T, document: U): Promise<U> {
    const db = await this.getDb()

    if (!db[collection]) {
      db[collection] = []
    }

    // (db[collection] as (typeof document)[]).push(document)

    //@ts-ignore
    db[collection].push(document)
    await this.updateDb(db)

    return Promise.resolve(document)
  }

  async getAll<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(collection: T): Promise<U[]> {
    const db = await this.getDb()
    return db[collection] as U[]
  }

  private async getDb(): Promise<Database> {
    let f = Bun.file(this.file)

    if (!await f.exists()) {
      await Bun.write(this.file, JSON.stringify({
        todos: [],
        test: []
      }))
      f = Bun.file(this.file)
    }

    let db: Database
    try {
      db = JSON.parse(await f.text())
    } catch (error) {
      db = {
        todos: [],
        chats: []
      }
    }

    return db
  }
}

