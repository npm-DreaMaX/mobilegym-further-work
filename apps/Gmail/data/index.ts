import defaults from './defaults.json';
import { manifest } from '../manifest';
export const GMAIL_CONFIG = { ...defaults, appId: manifest.id };
