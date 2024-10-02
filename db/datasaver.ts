import { Todos } from "../modules/todos"

type Test = {
  id: String
  name: String
}

export interface Database {
  todos: Todos[],
  test: Test[]
}

// type Collection = "todos" | "test"

export interface DataSaver {
  create<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(
    collection: T,
    document: U
  ): Promise<U>

  getAll<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(
    collection: T,
  ): Promise<U[]>
}
