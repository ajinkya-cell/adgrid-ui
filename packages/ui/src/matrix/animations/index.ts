import { pluginsList } from './plugins';
import { AnimationPlugin } from '../types';

export * from './plugins';

/**
 * Registry mapping animation string keys to their corresponding pluggable engine instances.
 */
export const ANIMATION_PLUGINS: Record<string, AnimationPlugin> = Object.fromEntries(
  pluginsList.map((plugin) => [plugin.name, plugin])
);

export default ANIMATION_PLUGINS;
