"use client"

import { useState, useEffect } from "react"
import { Timestamp } from "firebase/firestore"
import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"

interface ClientSideDateTimeProps {
  date: Timestamp | Date
  showTime?: boolean
  timeOnly?: boolean
}

export function ClientSideDateTime({
  date,
  showTime = false,
  timeOnly = false,
}: ClientSideDateTimeProps) {
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    const jsDate = date instanceof Timestamp ? date.toDate() : date
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const zonedDate = toZonedTime(jsDate, timeZone)

    let formatString = "dd/MM/yyyy"
    if (timeOnly) {
      formatString = "HH:mm"
    } else if (showTime) {
      formatString = "dd/MM/yyyy HH:mm"
    }

    setFormattedDate(format(zonedDate, formatString))
  }, [date, showTime, timeOnly])

  return <>{formattedDate}</>
}
