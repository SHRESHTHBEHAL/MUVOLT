export type StationId = 'workshop' | 'crew' | 'arena' | 'lab' | 'dock'

export interface Project {
  id: string
  name: string
  status: 'Active' | 'Shipped' | 'Archived'
  blurb: string
  tags: string[]
}

export interface Member {
  id: string
  name: string
  role: string
  year: string
  building: string
  advisor?: boolean
}

export interface Competition {
  id: string
  event: string
  year: number
  placement: string
  story: string
}

export interface Course {
  id: string
  title: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  blurb: string
  nextSession: string
}

export interface JoinInfo {
  why: string[]
  schedule: string
  email: string
  socials: { label: string; href: string }[]
  formEndpoint: string
}

export interface StationMeta {
  id: StationId
  label: string
  subtitle: string
}

export interface SiteMeta {
  club: 'MUVOLT'
  robot: 'BOLT-7'
  bootLine: 'MUVOLT // BAY 7 // POWERING ON'
  tagline: string
  stations: StationMeta[]
  credits: string[]
}
