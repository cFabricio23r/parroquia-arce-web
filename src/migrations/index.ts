import * as migration_20260717_044438_initial from './20260717_044438_initial';

export const migrations = [
  {
    up: migration_20260717_044438_initial.up,
    down: migration_20260717_044438_initial.down,
    name: '20260717_044438_initial'
  },
];
