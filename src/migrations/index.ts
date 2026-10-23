import * as migration_20260717_044438_initial from './20260717_044438_initial'
import * as migration_20261023_211157_app_installs from './20261023_211157_app_installs'

export const migrations = [
  { up: migration_20260717_044438_initial.up, down: migration_20260717_044438_initial.down, name: '20260717_044438_initial' },
  { up: migration_20261023_211157_app_installs.up, down: migration_20261023_211157_app_installs.down, name: '20261023_211157_app_installs' },
]
