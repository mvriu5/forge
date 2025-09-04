import { z } from "zod";
import { router, publicProcedure } from "../../trpc.ts";
import { dashboard } from "../../schema.ts";
import { eq } from "drizzle-orm";

export const dashboardRouter = router({

    list: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.select().from(dashboard).orderBy(dashboard.createdAt);
        }),

    byId: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const [row] = await ctx.db.select().from(dashboard).where(eq(dashboard.id, input.id));
            return row ?? null;
        }),

    create: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            name: z.string().min(1),
            isPublic: z.boolean().optional().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            const now = new Date();
            const data = {
                id: crypto.randomUUID(),
                userId: input.userId,
                name: input.name,
                isPublic: input.isPublic ?? false,
                createdAt: now,
                updatedAt: now
            };
            const res = await ctx.db.insert(dashboard).values(data).returning();
            return res[0];
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string().uuid(),
            name: z.string().min(1).optional(),
            isPublic: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const patch: Partial<typeof dashboard.$inferInsert> = {
                ...(input.name !== undefined ? { name: input.name } : {}),
                ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
                updatedAt: new Date(),
            };
            const res = await ctx.db.update(dashboard)
                .set(patch)
                .where(eq(dashboard.id, input.id))
                .returning();
            return res[0] ?? null;
        }),

    remove: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(dashboard).where(eq(dashboard.id, input.id));
            return { ok: true };
        }),
})
