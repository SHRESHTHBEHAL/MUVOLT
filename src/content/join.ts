import type { JoinInfo } from './types'

export const join: JoinInfo = {
  why: [
    'Build real robots, not slide decks. Every member ships hardware in their first semester.',
    'Compete nationally. We travel to Robocon, Technoxian, and whatever else has a trophy.',
    'Learn from people one year ahead of you, then teach the people one year behind.',
    'Access to the bay: printers, a CNC, a reflow oven, and a drawer of parts nobody has catalogued.',
  ],
  schedule: 'Workshops every Saturday 10:00 to 13:00. Build nights Tuesdays and Thursdays from 18:00. The bay is open whenever someone has the key.',
  email: 'hello@muvolt.club',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/muvolt' },
    { label: 'GitHub', href: 'https://github.com/muvolt' },
    { label: 'YouTube', href: 'https://youtube.com/@muvolt' },
    { label: 'Discord', href: 'https://discord.gg/muvolt' },
  ],
  // Leave empty until you have a real endpoint: the form then completes locally and sends nothing.
  formEndpoint: '',
}
