import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useLeaderboard } from './useLeaderboard'
import { LEADERBOARD_KEY } from '@/constants'

describe('useLeaderboard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('starts empty when no scores saved', () => {
    const lb = useLeaderboard()
    expect(lb.entries.value).toHaveLength(0)
  })

  it('saves an entry and returns it', () => {
    const lb = useLeaderboard()
    lb.save(120, 'Beginner')
    expect(lb.entries.value).toHaveLength(1)
    expect(lb.entries.value[0]).toMatchObject({ score: 120, level: 'Beginner' })
    expect(lb.entries.value[0].uid).toBeTruthy()
    expect(lb.entries.value[0].createdAt).toBeTruthy()
  })

  it('keeps entries sorted by descending score', () => {
    const lb = useLeaderboard()
    lb.save(50, 'Beginner')
    lb.save(200, 'Expert')
    lb.save(100, 'Intermediate')
    expect(lb.entries.value.map((e) => e.score)).toEqual([200, 100, 50])
  })

  it('persists to localStorage and restores it', () => {
    const lb = useLeaderboard()
    lb.save(75, 'Beginner')

    const persisted = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) as string)
    expect(persisted).toHaveLength(1)

    // Fresh composable reads from storage.
    const lb2 = useLeaderboard()
    expect(lb2.entries.value).toHaveLength(1)
  })

  it('caps the leaderboard at the maximum size', () => {
    const lb = useLeaderboard()
    for (let i = 0; i < 15; i++) {
      lb.save(i * 10, 'Beginner')
    }
    expect(lb.entries.value.length).toBeLessThanOrEqual(10)
    expect(lb.entries.value.length).toBe(10)
  })

  it('clears all entries', () => {
    const lb = useLeaderboard()
    lb.save(10, 'Beginner')
    lb.save(20, 'Beginner')
    lb.clear()
    expect(lb.entries.value).toHaveLength(0)
  })
})
