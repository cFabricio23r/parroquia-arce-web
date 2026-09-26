import * as migration_20260717_044438_initial from './20260717_044438_initial';
import * as migration_20260925_000000_clergy from './20260925_000000_clergy';
import * as migration_20260925_160000_social_live from './20260925_160000_social_live';

export const migrations = [
  {
    up: migration_20260717_044438_initial.up,
    down: migration_20260717_044438_initial.down,
    name: '20260717_044438_initial',
  },
  {
    up: migration_20260925_000000_clergy.up,
    down: migration_20260925_000000_clergy.down,
    name: '20260925_000000_clergy',
  },
  {
    up: migration_20260925_160000_social_live.up,
    down: migration_20260925_160000_social_live.down,
    name: '20260925_160000_social_live',
  },
];
