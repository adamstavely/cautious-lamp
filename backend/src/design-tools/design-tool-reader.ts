import { ADOBE_XD_UNSUPPORTED, DesignFileSnapshot, DesignFileSource } from './design-tool.types';
import { DesignToolError, DesignToolHttp } from './design-tool-http';
import { FigmaClient, figmaFileKey } from './figma.client';
import { PenpotClient, penpotFileRef } from './penpot.client';

/** Injection token for the reader */
export const DESIGN_TOOL_READER = Symbol('DESIGN_TOOL_READER');

/** Reads a connection's design file from Figma or Penpot */
export class DesignToolReader {
  private readonly figma: FigmaClient;
  private readonly penpot: PenpotClient;

  constructor(http: DesignToolHttp) {
    this.figma = new FigmaClient(http);
    this.penpot = new PenpotClient(http);
  }

  /** Throws DesignToolError with a message for the person syncing */
  async read(source: DesignFileSource, credential: string | undefined): Promise<DesignFileSnapshot> {
    if (source.tool === 'adobe-xd') throw new DesignToolError(ADOBE_XD_UNSUPPORTED);
    if (source.tool !== 'figma' && source.tool !== 'penpot') throw new DesignToolError(`${source.tool} is not a supported design tool`);
    if (!credential) {
      throw new DesignToolError(
        source.tool === 'figma'
          ? 'The connection has no Figma personal access token; add one to read the file'
          : 'The connection has no Penpot access token; add one to read the file',
      );
    }
    if (source.tool === 'figma') return this.figma.read(figmaFileKey(source.fileId, source.fileUrl), credential);
    return this.penpot.read(penpotFileRef(source.fileId, source.fileUrl), credential);
  }
}
