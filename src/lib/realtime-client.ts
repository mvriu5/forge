"use client"

import { createRealtime } from "@upstash/realtime/client"
import type { RealtimeEvents } from "@/lib/realtime"

export const { useRealtime } = createRealtime<RealtimeEvents>()
