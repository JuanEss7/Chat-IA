import GitHub from '@auth/core/providers/github'
import Google from '@auth/core/providers/google'
import { defineConfig } from 'auth-astro'
import { db, User } from 'astro:db'

export default defineConfig({
    providers: [
        GitHub({
            clientId: import.meta.env.GITHUB_CLIENT_ID ?? '',
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET ?? '',
        }),
        Google({
            clientId: import.meta.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET ?? '',
        })
    ],
    // callbacks: {
    //     session: async ({ session, user }) => {
    //         return session
    //     },
    // }
})