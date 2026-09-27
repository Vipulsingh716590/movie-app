import { HttpContextToken } from '@angular/common/http';

/**
 * Set on requests the user did not ask for directly (e.g. trailer lookups on card hover).
 * The global loading spinner and error banner ignore them.
 */
export const BACKGROUND_REQUEST = new HttpContextToken<boolean>(() => false);
