import type { Quadrant } from './types'

export const QUADRANT_GRID: (Quadrant | null)[][] = [
  ['R1', 'O1', 'Y1', 'G1'],
  ['R2', 'O2', 'Y2', 'G2'],
  ['R3', 'O3', 'Y3', 'G3'],
  [null, null, null, 'G4'],
]

export const QUADRANT_COMPASS: Record<Quadrant, string> = {
  R1: 'NW',
  R2: 'W',
  R3: 'SW',
  O1: 'N',
  O2: 'Center',
  O3: 'S',
  Y1: 'NE',
  Y2: 'Mid',
  Y3: 'SE',
  G1: 'E',
  G2: 'E',
  G3: 'E',
  G4: 'E',
}
