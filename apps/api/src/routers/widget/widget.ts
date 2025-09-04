import { z } from "zod";
import { router, publicProcedure } from "../../trpc.ts";
import { widget } from "../../schema.ts";
import { eq } from "drizzle-orm";

const JsonConfig = z.any().optional()

export const widgetRouter = router({

    list: publicProcedure
        .query(async ({ctx}) => {
            return ctx.db.select().from(widget).orderBy(widget.createdAt);
        }),

    listByDashboard: publicProcedure
        .input(z.object({dashboardId: z.string().uuid()}))
        .query(async ({ctx, input}) => {
            return ctx.db.select().from(widget)
                .where(eq(widget.dashboardId, input.dashboardId))
                .orderBy(widget.createdAt);
        }),

    listByUser: publicProcedure
        .input(z.object({userId: z.string()}))
        .query(async ({ctx, input}) => {
            return ctx.db.select().from(widget)
                .where(eq(widget.userId, input.userId))
                .orderBy(widget.createdAt);
        }),

    byId: publicProcedure
        .input(z.object({id: z.string().uuid()}))
        .query(async ({ctx, input}) => {
            const [row] = await ctx.db.select().from(widget).where(eq(widget.id, input.id));
            return row ?? null;
        }),

    create: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            dashboardId: z.string().uuid(),
            widgetType: z.string().min(1),
            height: z.number().int().positive(),
            width: z.number().int().positive(),
            config: JsonConfig,
            positionX: z.number().int().nonnegative(),
            positionY: z.number().int().nonnegative(),
        }))
        .mutation(async ({ctx, input}) => {
            const now = new Date();
            const data = {
                id: crypto.randomUUID(),
                userId: input.userId,
                dashboardId: input.dashboardId,
                widgetType: input.widgetType,
                height: input.height,
                width: input.width,
                config: input.config ?? null,
                positionX: input.positionX,
                positionY: input.positionY,
                createdAt: now,
                updatedAt: now,
            };
            const res = await ctx.db.insert(widget).values(data).returning();
            return res[0];
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string().uuid(),
            widgetType: z.string().min(1).optional(),
            height: z.number().int().positive().optional(),
            width: z.number().int().positive().optional(),
            config: JsonConfig,
            positionX: z.number().int().nonnegative().optional(),
            positionY: z.number().int().nonnegative().optional(),
            dashboardId: z.string().uuid().optional(),
        }))
        .mutation(async ({ctx, input}) => {
            await ctx.db.delete(widget).where(eq(widget.id, input.id))
            return {ok: true}
        })
})
