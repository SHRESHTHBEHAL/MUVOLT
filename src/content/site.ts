import type { SiteMeta } from './types'

export const site: SiteMeta = {
  club: 'MUVOLT',
  robot: 'BOLT-7',
  bootLine: 'MUVOLT // BAY 7 // POWERING ON',
  tagline: 'We build robots. Sometimes they build back.',
  stations: [
    { id: 'workshop', label: 'Workshop', subtitle: 'Projects' },
    { id: 'crew', label: 'Crew Quarters', subtitle: 'Team' },
    { id: 'arena', label: 'Arena', subtitle: 'Competitions' },
    { id: 'lab', label: 'Lab', subtitle: 'Learn' },
    { id: 'dock', label: 'Dock', subtitle: 'Join' },
  ],
  credits: [
    'THE BAY',
    'a MUVOLT production',
    '',
    'BOLT-7 .......... itself',
    'Hangar ........... procedural geometry',
    'Sound ............ synthesised, no robots harmed',
    'Physics .......... Rapier',
    'Rendering ........ three.js',
    '',
    'In memory of BOLT-1 through BOLT-6.',
    'You found the arcade. Tell nobody.',
  ],
}
