// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Fallback } from '../src/fallback/Fallback'
import { projects } from '../src/content/projects'
import { team } from '../src/content/team'
import { courses } from '../src/content/learn'
import { competitions } from '../src/content/competitions'

describe('Fallback page', () => {
  it('renders every project, member, course and competition', () => {
    render(<Fallback canReturn={false} />)
    for (const p of projects) expect(screen.getAllByText(p.name).length).toBeGreaterThan(0)
    for (const m of team) expect(screen.getAllByText(m.name).length).toBeGreaterThan(0)
    for (const c of courses) expect(screen.getAllByText(c.title).length).toBeGreaterThan(0)
    for (const c of competitions) expect(screen.getAllByText(c.event).length).toBeGreaterThan(0)
  })
  it('shows the WebGL notice when given one', () => {
    render(<Fallback notice="no webgl here" canReturn={false} />)
    expect(screen.getByText('no webgl here')).toBeTruthy()
    expect(screen.getAllByText(/Masters Union/).length).toBeGreaterThan(0)
  })
})
