import { initializeBot } from "./bot"
import { JSONDatabase } from "./db/json-db"

const db = new JSONDatabase()

initializeBot(db)
