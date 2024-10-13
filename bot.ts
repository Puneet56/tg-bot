import { Api, Bot, RawApi, Context } from "grammy";
import { DataSaver } from "./db/datasaver";
import { console } from "inspector";


export const initializeBot = (db: DataSaver) => {
  const botToken = process.env.BOT_TOKEN
  const chatId = process.env.CHAT_ID

  if (!botToken) {
    throw Error("BOT_TOKEN not set in environment")
  }

  if (!chatId) {
    throw Error("CHAT_ID not set in environment")
  }

  const bot = new Bot(botToken)

  bot.catch(e => {
    console.log(e?.message)
    console.log(e?.stack)
  })

  initializeApp(bot, db)
}

const menuMarkup = `
<b>/menu</b>
<b>/hello</b>
<b>/world</b>
<b>/listTodos</b>
`




function initializeApp(bot: Bot<Context, Api<RawApi>>, db: DataSaver) {
  let aiChatId: null | string = null;


  bot.use(async (ctx, next) => {
    validate(ctx.chatId?.toString()!)

    await next();
  });



  bot.command("hello", async (ctx) => {
    ctx.reply("world!")
  })

  bot.command("world", async (ctx) => {
    ctx.reply("hello!")
  })

  bot.command("chat", async (ctx) => {
    aiChatId = new Date().toISOString()
    ctx.reply("Please enter you messages")
  })

  bot.command("end", async (ctx) => {
    aiChatId = null
    ctx.reply("AI chat ended")
  })

  bot.command("menu", async (ctx) => {
    await ctx.reply(menuMarkup, {
      parse_mode: "HTML"
    });
  });

  bot.command("listTodos", async (ctx) => {
    const todos = await db.getAll("todos")

    const resp = `Todos:


${todos.map(t => t.title).join("\n\n")}
`

    await ctx.reply(resp)
  })

  bot.on("message:text", async (ctx) => {
    console.log(
      `Chat id: ${ctx.chatId} | ${ctx.from.first_name} wrote ${"text" in ctx.message ? ctx.message.text : ""
      }`,
    );


    if (aiChatId) {
      let chat = await db.getOne("chats", aiChatId)
      if (!chat) {
        chat = {
          id: aiChatId,
          messages: []
        }
      }

      chat.messages.push({ content: ctx.message.text, role: "user" })

      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        body: JSON.stringify({
          model: "llama3.2",
          stream: false,
          messages: chat.messages
        })
      })

      const { message: data } = await res.json()
      chat.messages.push(data)


      await db.updateOne("chats", aiChatId, chat)

      ctx.reply(data.content, {
        // parse_mode: "MarkdownV2"
      })

      return
    }

    db.create("todos", {
      chatId: ctx.chatId,
      title: ctx.message.text,
      id: crypto.randomUUID()
    })

    await ctx.react("👍")
    await ctx.reply("Todo added")
  });

  bot.start({
    onStart() {
      console.log('Bot started successfully')
    },
    timeout: 60
  })
}


function validate(chatId: string) {
  const chatIdenv = process.env.CHAT_ID
  if (chatIdenv !== chatId) {
    throw Error(`Unauthorized access by chatId:${chatId}`)
  }
}
