import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const candles = (start: number, step: number) =>
    Array.from({ length: 24 }, (_, index) => {
        const open = start + Math.sin(index / 2) * step + index * step * 0.12
        const close = open + Math.cos(index / 3) * step * 0.55
        return {
            time: 1_769_000_000 + index * 3_600,
            low: Number((Math.min(open, close) - step * 0.3).toFixed(2)),
            high: Number((Math.max(open, close) + step * 0.3).toFixed(2)),
            open: Number(open.toFixed(2)),
            close: Number(close.toFixed(2)),
        }
    })

const meta = { title: "Widgets/Crypto", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Crypto",
        config: { timeframe: "24h", products: ["BTC-USD", "ETH-USD", "SOL-USD"] },
        mockData: {
            timeframe: "24h",
            products: ["BTC-USD", "ETH-USD", "SOL-USD"],
            currencies: [
                { id: "BTC", name: "Bitcoin" },
                { id: "ETH", name: "Ethereum" },
                { id: "SOL", name: "Solana" },
            ],
            prices: [
                { product: "BTC-USD", base: "BTC", quote: "USD", price: 104250.42, changePercent: 2.84, candles: candles(99_500, 900) },
                { product: "ETH-USD", base: "ETH", quote: "USD", price: 3840.12, changePercent: -1.26, candles: candles(3_920, -18) },
                { product: "SOL-USD", base: "SOL", quote: "USD", price: 218.73, changePercent: 5.41, candles: candles(198, 2.4) },
            ],
        },
    },
}
