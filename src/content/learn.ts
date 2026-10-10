import type { Course } from './types'

export const courses: Course[] = [
  {
    id: 'arduino',
    title: 'Arduino Basics',
    level: 'Beginner',
    blurb: 'Blink an LED, read a sensor, drive a motor. Leave with a working line-follower and a locker.',
    nextSession: 'Sat 18 Oct, 10:00',
  },
  {
    id: 'cad',
    title: 'CAD for Robots',
    level: 'Beginner',
    blurb: 'Fusion 360 from zero to a printable chassis. Tolerances, fasteners, and why your part did not fit.',
    nextSession: 'Sat 25 Oct, 10:00',
  },
  {
    id: 'pcb',
    title: 'PCB Design',
    level: 'Intermediate',
    blurb: 'KiCad schematics to fabricated boards. Motor drivers, power stages, and the smell of a mistake.',
    nextSession: 'Sat 1 Nov, 10:00',
  },
  {
    id: 'ros2',
    title: 'ROS 2 Foundations',
    level: 'Intermediate',
    blurb: 'Nodes, topics, TF, and simulating a rover in Gazebo before you trust it with real wheels.',
    nextSession: 'Sat 8 Nov, 10:00',
  },
  {
    id: 'cv',
    title: 'Computer Vision',
    level: 'Advanced',
    blurb: 'OpenCV to YOLO on embedded hardware. Build the tracker that powers Sentry, then make it faster.',
    nextSession: 'Sat 15 Nov, 10:00',
  },
]
