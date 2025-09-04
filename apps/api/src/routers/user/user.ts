import { z } from "zod"
import { router, publicProcedure } from "../../trpc.ts"
import { user } from "../../schema.ts"
import { eq } from "drizzle-orm"

export const userRouter = router({

    list: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.select().from(user).orderBy(user.createdAt)
        }),

    byId: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [row] = await ctx.db.select().from(user).where(eq(user.id, input.id))
            return row ?? null
        }),

    create: publicProcedure
        .input(z.object({
            name: z.string().min(3),
            email: z.string().email(),
            emailVerified: z.boolean().default(false),
            image: z.string().url().nullish()
        }))
        .mutation(async ({ ctx, input }) => {
            const now = new Date();

            const userData = {
                id: crypto.randomUUID(),
                name: input.name,
                email: input.email,
                emailVerified: input.emailVerified ?? false,
                image: input.image || null,
                createdAt: now,
                updatedAt: now
            };

            const res = await ctx.db.insert(user).values(userData).returning();
            return res[0];
        }),

    remove: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(user).where(eq(user.id, input.id))
            return { ok: true }
        })
})
