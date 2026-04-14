import type { TrackingEvent } from "./types";

export function trackEvent(event: string, data?: Record<string, unknown>): void {
  const trackingEvent: TrackingEvent = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // Fase 1: console.log estruturado. Será substituído por envio ao banco na fase seguinte.
  console.log("[TRACKING]", JSON.stringify(trackingEvent));
}
