import { useEffect, useState } from 'react'
import * as sync from '../lib/sync.js'

export function useSync() {
  const [status, setStatus] = useState(sync.getStatus)
  useEffect(() => sync.subscribe(setStatus), [])
  return status
}
