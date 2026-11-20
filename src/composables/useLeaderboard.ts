import { ref } from 'vue'
import { LEADERBOARD_KEY } from '@/constants'
import type { LeaderboardEntry } from '@/types'

const STORAGE_MAX = 10

let cache: LeaderboardEntry[] | null = null

const readFromStorage = (): LeaderboardEntry[] => {
  if (cache) return cache
  try {
    const raw =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(LEADERBOARD_KEY)
        : null
    cache = raw ? (JSON.parse(raw) as LeaderboardEntry[]) : []
  } catch {
    cache = []
  }
  return cache
}

const persist = (entries: LeaderboardEntry[]): void => {
  cache = entries
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries))
    }
  } catch {
    // Storage unavailable (private mode, disabled): ignore.
  }
}

export const useLeaderboard = () => {
  const entries = ref<LeaderboardEntry[]>(readFromStorage())

  const refresh = (): void => {
    entries.value = readFromStorage()
  }

  const save = (
    score: number,
    level: string,
    uid = Math.random().toString(36).slice(2, 10),
  ): void => {
    const updated = readFromStorage()
    updated.push({
      score,
      level,
      createdAt: new Date().toISOString(),
      uid,
    })
    updated.sort((a, b) => b.score - a.score)
    const top = updated.slice(0, STORAGE_MAX)
    persist(top)
    entries.value = top
  }

  const clear = (): void => {
    persist([])
    entries.value = []
  }

  return { entries, refresh, save, clear }
}
