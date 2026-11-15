/** Design tools this server can read from */
export const SUPPORTED_DESIGN_TOOLS = ['figma', 'penpot'] as const;
export type DesignToolName = (typeof SUPPORTED_DESIGN_TOOLS)[number];

/**
 * Why Adobe XD connections can't be read. Older token sync connections may
 * still name it, so it is reported rather than silently ignored.
 */
export const ADOBE_XD_UNSUPPORTED =
  'Adobe XD is not supported: Adobe has discontinued the XD plugin and cloud document APIs a sync would read from. Use Figma or Penpot, or edit the tokens directly.';

/** What a design tool value maps to in the design system */
export type TokenKind = 'color' | 'spacing' | 'radius' | 'dimension' | 'fontSize' | 'fontWeight' | 'fontFamily' | 'lineHeight';

/** A token read from a design file, already mapped to a design-system name, type and category */
export interface DesignToolToken {
  /** Stable id in the design tool (a variable or style id, plus the facet for text styles) */
  id: string;
  /** As named in the design tool */
  designName: string;
  /** The design-system token name it maps to */
  name: string;
  value: string;
  kind: TokenKind;
  type: string;
  category: string;
  description?: string;
  /** Where in the file it came from */
  source: 'variable' | 'style' | 'library-color' | 'library-typography' | 'token';
}

/** A component (or a component set, with its variants) read from a design file */
export interface DesignToolComponent {
  /** The design node id */
  id: string;
  name: string;
  /** Grouping path in the design tool ("Forms/Inputs"), if any */
  path?: string;
  description?: string;
  /** Variant names for a component set ("Size=Large, State=Hover") */
  variants: string[];
  kind: 'component' | 'component-set';
  /** Opens the node in the design tool, when the tool has such links */
  url?: string;
}

/** Everything a sync needs from one design file */
export interface DesignFileSnapshot {
  tool: DesignToolName;
  fileId: string;
  name: string;
  version: string;
  lastModified?: string;
  tokens: DesignToolToken[];
  components: DesignToolComponent[];
  /** Things the reader skipped or couldn't read, for the person reviewing the sync */
  warnings: string[];
  /** Figma variables: read, or why they couldn't be (plan, account type or token scope) */
  variables: { status: 'read' | 'unavailable' | 'not-applicable'; message?: string };
}

/** What the readers need from a saved connection */
export interface DesignFileSource {
  tool: string;
  fileId?: string;
  fileUrl?: string;
}
