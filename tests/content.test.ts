import { describe, it, expect } from 'vitest'
import { projects } from '../src/content/projects'
import { team } from '../src/content/team'
import { competitions } from '../src/content/competitions'
import { courses } from '../src/content/learn'
import { join } from '../src/content/join'
import { site } from '../src/content/site'

describe('content', () => {
  it('has the six named projects', () => {
    expect(projects.map((p) => p.name)).toEqual([
      'Atlas Mk II', 'Hex', 'Sentry', 'Grip', 'Swarm', 'Lineo',
    ])
    for (const p of projects) expect(['Active', 'Shipped', 'Archived']).toContain(p.status)
  })

  it('has 13 members with exactly one advisor', () => {
    expect(team).toHaveLength(13)
    expect(team.filter((m) => m.advisor)).toHaveLength(1)
  })

  it('has 4 to 6 competitions including Robocon', () => {
    expect(competitions.length).toBeGreaterThanOrEqual(4)
    expect(competitions.length).toBeLessThanOrEqual(6)
    expect(competitions.some((c) => c.event.includes('Robocon'))).toBe(true)
  })

  it('has 5 courses including ROS 2', () => {
    expect(courses).toHaveLength(5)
    expect(courses.some((c) => c.title.includes('ROS 2'))).toBe(true)
  })

  it('has join info with a form endpoint', () => {
    expect(join.formEndpoint).toBe('https://example.com/muvolt-join')
    expect(join.why.length).toBeGreaterThan(0)
  })

  it('site meta is pinned', () => {
    expect(site.club).toBe('MUVOLT')
    expect(site.robot).toBe('BOLT-7')
    expect(site.bootLine).toBe('MUVOLT // BAY 7 // POWERING ON')
    expect(site.stations.map((s) => s.id)).toEqual(['workshop', 'crew', 'arena', 'lab', 'dock'])
    expect(site.credits.length).toBeGreaterThan(0)
  })
})
