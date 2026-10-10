// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
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

import { fireEvent, waitFor, within } from '@testing-library/react'
import { JoinPanel } from '../src/panels/JoinPanel'
import { join } from '../src/content/join'

describe('JoinPanel', () => {
  it('shows the success state without a network call when no endpoint is configured', async () => {
    const original = join.formEndpoint
    join.formEndpoint = ''
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { container } = render(<JoinPanel />)
    const q = within(container)
    fireEvent.change(q.getByPlaceholderText('Name'), { target: { value: 'Member 1' } })
    fireEvent.change(q.getByPlaceholderText('Email'), { target: { value: 'm1@example.org' } })
    fireEvent.change(container.querySelector('select')!, { target: { value: 'First Year' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => expect(q.getByText(/Docked/)).toBeTruthy())
    expect(q.getByText(/reply within a few days/)).toBeTruthy()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
    join.formEndpoint = original
  })
})
