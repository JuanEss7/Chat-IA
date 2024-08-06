import { defineDb, defineTable, column } from 'astro:db';

// https://astro.build/db/config
const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    name: column.text({ unique: true }),
    email: column.text({ unique: true }),
  }
})
const Messages = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    modeloIA: column.text(),
    messageBot: column.text(),
    messageUser: column.text(),
    sendedAt: column.date(),
    userId: column.text({ unique: true, references: () => User.columns.email, }),
  }
})
export default defineDb({
  tables: { User, Messages }
});
