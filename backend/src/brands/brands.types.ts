import { Actor } from '../workspaces/workspace.types';

export const BRANDS_INDEX = 'design-system-brands';
/** Injection token for the brand store */
export const BRAND_STORE = Symbol('BRAND_STORE');

export const BRAND_PROPERTIES = {
  id: { type: 'keyword' },
  name: { type: 'keyword' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

/** A brand's value for one design token (GET /tokens); tokens without an override keep their base value */
export interface TokenOverride {
  token: string;
  value: string;
}

/** As stored in design-system-brands and returned by the API */
export interface BrandDoc {
  id: string;
  name: string;
  description: string;
  tokenOverrides: TokenOverride[];
  createdAt: string;
  updatedAt: string;
  createdBy: Actor;
  updatedBy: Actor;
}
