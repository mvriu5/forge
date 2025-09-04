import { z } from "zod";
import { router, publicProcedure } from "../../trpc.ts";
import { settings } from "../../schema.ts";
import { eq } from "drizzle-orm";

export const settingsRouter = router({

    list: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.select().from(settings).orderBy(settings.createdAt);
        }),

    byId: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const [row] = await ctx.db.select().from(settings).where(eq(settings.id, input.id));
            return row ?? null;
        }),

    byUser: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const [row] = await ctx.db.select().from(settings).where(eq(settings.userId, input.userId));
            return row ?? null;
        }),

    create: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            lastDashboardId: z.string().uuid().nullable().optional(),
            config: z.any().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const now = new Date();
            const data = {
                id: crypto.randomUUID(),
                userId: input.userId,
                lastDashboardId: input.lastDashboardId ?? null,
                config: input.config ?? null,
                createdAt: now,
                updatedAt: now,
            };
            const res = await ctx.db.insert(settings).values(data).returning();
            return res[0];
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string().uuid(),
            lastDashboardId: z.string().uuid().nullable().optional(),
            config: z.any().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const patch: Partial<typeof settings.$inferInsert> = {
                ...(input.lastDashboardId !== undefined ? { lastDashboardId: input.lastDashboardId } : {}),
                ...(input.config !== undefined ? { config: input.config } : {}),
                updatedAt: new Date(),
            };
            const res = await ctx.db.update(settings)
                .set(patch)
                .where(eq(settings.id, input.id))
                .returning();
            return res[0] ?? null;
        }),

    remove: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(settings).where(eq(settings.id, input.id));
            return { ok: true };
        }),
})
