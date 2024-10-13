import { Todos } from "../modules/todos"

export type Message = {
  role: "user" | "assistant",
  content: string
}

export type Chat = {
  id: string
  messages: Message[]
}


export interface Database {
  todos: Todos[],
  chats: Chat[]
}

export interface DataSaver {
  create<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(
    collection: T,
    document: U
  ): Promise<U>

  getOne<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(
    collection: T,
    id: string
  ): Promise<U>

  updateOne<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(
    collection: T,
    id: string,
    data: U
  ): Promise<U>

  getAll<T extends keyof Database, U = Database[T] extends (infer U)[] ? U : never>(
    collection: T,
  ): Promise<U[]>

}
