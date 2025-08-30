"use client"

import { Toaster } from "@/components/ui/toaster"

export default function EventNotifications() {
  return (
    <>
      <Toaster />
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-4 top-20 z-30 flex max-w-sm flex-col gap-2"
      >
        {/* Toasts will appear here */}
      </div>
    </>
  )
}
