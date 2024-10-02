import cron from 'node-cron';
import { JSONDatabase } from "./db/json-db"
import { Api } from 'grammy';


const notifyTodos = async () => {
  console.log("Sending todos")

  const botToken = process.env.BOT_TOKEN
  const chatId = process.env.CHAT_ID

  if (!botToken) {
    throw Error("BOT_TOKEN not set in environment")
  }

  if (!chatId) {
    throw Error("CHAT_ID not set in environment")
  }

  const db = new JSONDatabase()
  const todos = await db.getAll("todos")

  const api = new Api(botToken)
  const resp = `Today's todos:


${todos.map(t => t.title).join("\n\n")}
`

  await api.sendMessage(chatId, resp)
}


cron.schedule('30 3 * * *', () => {
  notifyTodos().then(() => { console.log("Todos sent successfully") }).catch((e) => console.log(e))
});


console.log('Cron job scheduled');

