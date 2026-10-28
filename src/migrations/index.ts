import * as migration_20260717_044438_initial from './20260717_044438_initial';
import * as migration_20260925_000000_clergy from './20260925_000000_clergy';
import * as migration_20260925_160000_social_live from './20260925_160000_social_live';
import * as migration_20260928_000000_activity_tools from './20260928_000000_activity_tools';
import * as migration_20260928_130000_activity_filters_toggle from './20260928_130000_activity_filters_toggle';
import * as migration_20261023_211157_app_installs from './20261023_211157_app_installs'
import * as migration_20261025_000000_app_download from './20261025_000000_app_download'
import * as migration_20261026_000000_drop_settings_rels from './20261026_000000_drop_settings_rels'

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
  {
    up: migration_20260928_000000_activity_tools.up,
    down: migration_20260928_000000_activity_tools.down,
    name: '20260928_000000_activity_tools',
  },
  {
    up: migration_20260928_130000_activity_filters_toggle.up,
    down: migration_20260928_130000_activity_filters_toggle.down,
    name: '20260928_130000_activity_filters_toggle',
  },
  { up: migration_20261023_211157_app_installs.up, down: migration_20261023_211157_app_installs.down, name: '20261023_211157_app_installs' },
  {
    up: migration_20261025_000000_app_download.up,
    down: migration_20261025_000000_app_download.down,
    name: '20261025_000000_app_download',
  },
  {
    up: migration_20261026_000000_drop_settings_rels.up,
    down: migration_20261026_000000_drop_settings_rels.down,
    name: '20261026_000000_drop_settings_rels',
  },
];
