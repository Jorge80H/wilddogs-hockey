import { init } from '@instantdb/react';
import type { InstantSchema } from './instantSchema';

// ID de tu app en InstantDB
const APP_ID = import.meta.env.VITE_INSTANT_APP_ID || '27acc1e8-fce9-4800-a9cd-c769cea6844f';

// Inicializa InstantDB con schema tipado
const db = init<InstantSchema>({ appId: APP_ID });

export { db };
