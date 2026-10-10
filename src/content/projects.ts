import type { Project } from './types'

export const projects: Project[] = [
  {
    id: 'atlas',
    name: 'Atlas Mk II',
    status: 'Active',
    blurb:
      'A six-wheeled autonomous rover with a rocker-bogie suspension, running SLAM on a Jetson Orin. Atlas maps the engineering block corridors at night and is the chassis BOLT-7 was modelled on.',
    tags: ['ROS 2', 'SLAM', 'Jetson', 'CAD'],
  },
  {
    id: 'hex',
    name: 'Hex',
    status: 'Active',
    blurb:
      'An 18-servo hexapod that learned to walk from a reinforcement-learning policy trained in simulation. It still trips on cables. We are working on the cables.',
    tags: ['Servos', 'RL', 'Sim2Real', 'Python'],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    status: 'Shipped',
    blurb:
      'A pan-tilt turret that tracks moving objects with a YOLO model and fires foam darts at anything that looks like a stray tennis ball. Won the internal hack night, twice.',
    tags: ['Computer Vision', 'YOLO', 'Stepper Motors'],
  },
  {
    id: 'grip',
    name: 'Grip',
    status: 'Active',
    blurb:
      'A soft robotic hand with silicone fingers driven by pneumatic actuators. Can hold an egg, a screwdriver, and, after version 4, a cup of chai without spilling.',
    tags: ['Soft Robotics', 'Pneumatics', 'Silicone Casting'],
  },
  {
    id: 'swarm',
    name: 'Swarm',
    status: 'Shipped',
    blurb:
      'Five palm-sized bots that coordinate over ESP-NOW to form shapes on the floor. Demoed at the campus open day; one of them is still missing.',
    tags: ['ESP32', 'Swarm', 'Mesh Networking'],
  },
  {
    id: 'lineo',
    name: 'Lineo',
    status: 'Archived',
    blurb:
      'The line-follower every fresher builds in their first month. Two IR sensors, one H-bridge, a lifetime of debugging. Lineo is how you earn your locker.',
    tags: ['Arduino', 'IR Sensors', 'Beginner'],
  },
]
