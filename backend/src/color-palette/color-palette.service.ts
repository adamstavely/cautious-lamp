import { ConflictException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AuthPrincipal } from '../auth/principal';
import { ColorTheoryService } from './color-theory.service';
import { EsIndexService, esStatusCode, isEsNotFound } from '../common/elasticsearch/es-index.service';
import { WorkspaceAccessService, isWorkspaceSuperuser } from '../workspaces/workspace-access.service';
import { CreatePaletteDto, UpdatePaletteDto } from './dto/create-palette.dto';
import { AnalyzePaletteDto } from './dto/analyze-palette.dto';

const INDEX = 'color-palettes';

/** Who saved a palette: a signed-in user or an API key */
export interface PaletteOwner {
  type: 'user' | 'service';
  id: string;
  name: string;
}

/** A palette as stored. Palettes saved before owners were recorded have neither field. */
interface PaletteDoc {
  name: string;
  colors: Array<{ hex: string; name?: string; role?: string }>;
  owner?: PaletteOwner;
  workspaceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Saved palettes in Elasticsearch. Anyone signed in reads them; a palette's
 * owner (set from the principal that created it), editors of its workspace
 * and admin:users holders change or delete it. A palette saved before owners
 * were recorded has none, so only an admin can change it.
 */
@Injectable()
export class ColorPaletteService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly colorTheoryService: ColorTheoryService,
    private readonly esIndexService: EsIndexService,
    private readonly workspaces: WorkspaceAccessService,
  ) {}

  /** Maps Elasticsearch failures to 404 or 503 instead of a bare 500 */
  private storageError(error: unknown, id?: string): never {
    if (id && isEsNotFound(error)) {
      throw new NotFoundException(`Palette ${id} not found`);
    }
    const status = esStatusCode(error);
    if (status === undefined || status >= 500) {
      throw new ServiceUnavailableException('Palette storage is unavailable, please try again later');
    }
    throw error;
  }

  /** Whether the principal may change or delete the palette */
  async canEdit(principal: AuthPrincipal, palette: Pick<PaletteDoc, 'owner' | 'workspaceId'>): Promise<boolean> {
    if (isWorkspaceSuperuser(principal)) return true;
    const owner = palette.owner;
    if (owner && owner.type === principal.type && owner.id === principal.id) return true;
    return !!palette.workspaceId && (await this.workspaces.has(principal, palette.workspaceId, 'editor'));
  }

  private async assertCanEdit(principal: AuthPrincipal, palette: PaletteDoc): Promise<void> {
    if (await this.canEdit(principal, palette)) return;
    throw new ForbiddenException(
      palette.owner
        ? 'Only the palette\'s owner, editors of its workspace or an admin can change it'
        : 'This palette was saved before palettes had owners; only an admin can change it',
    );
  }

  private async load(id: string): Promise<{ doc: PaletteDoc; seqNo: number; primaryTerm: number }> {
    const result = await this.elasticsearchService.get<PaletteDoc>({ index: INDEX, id }).catch((error) => this.storageError(error, id));
    return { doc: result._source as PaletteDoc, seqNo: result._seq_no, primaryTerm: result._primary_term };
  }

  private async view(principal: AuthPrincipal, id: string, doc: PaletteDoc) {
    return { id, ...doc, owner: doc.owner ?? null, workspaceId: doc.workspaceId ?? null, canEdit: await this.canEdit(principal, doc) };
  }

  async createPalette(principal: AuthPrincipal, dto: CreatePaletteDto) {
    // Sharing with a workspace needs the editor role there (404 for one the caller isn't in)
    if (dto.workspaceId) await this.workspaces.require(principal, dto.workspaceId, 'editor');
    const now = new Date().toISOString();
    const palette: PaletteDoc = {
      name: dto.name,
      colors: dto.colors,
      owner: { type: principal.type, id: principal.id, name: principal.name },
      workspaceId: dto.workspaceId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await this.esIndexService.assertAvailable();
    const result = await this.elasticsearchService
      .index({ index: INDEX, document: palette, refresh: 'wait_for' })
      .catch((error) => this.storageError(error));

    return this.view(principal, result._id, palette);
  }

  async updatePalette(principal: AuthPrincipal, id: string, dto: UpdatePaletteDto) {
    const existing = await this.load(id);
    await this.assertCanEdit(principal, existing.doc);
    const palette: PaletteDoc = {
      ...existing.doc,
      name: dto.name,
      colors: dto.colors,
      createdAt: existing.doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Only if nobody changed it (or its owner) since it was read
    await this.elasticsearchService
      .index({ index: INDEX, id, document: palette, if_seq_no: existing.seqNo, if_primary_term: existing.primaryTerm, refresh: 'wait_for' })
      .catch((error) => {
        if (esStatusCode(error) === 409) throw new ConflictException('The palette changed while saving; please try again');
        return this.storageError(error, id);
      });

    return this.view(principal, id, palette);
  }

  async deletePalette(principal: AuthPrincipal, id: string): Promise<void> {
    const existing = await this.load(id);
    await this.assertCanEdit(principal, existing.doc);
    await this.elasticsearchService
      .delete({ index: INDEX, id, if_seq_no: existing.seqNo, if_primary_term: existing.primaryTerm, refresh: 'wait_for' })
      .catch((error) => {
        if (esStatusCode(error) === 409) throw new ConflictException('The palette changed while deleting; please try again');
        return this.storageError(error, id);
      });
  }

  async getPalette(principal: AuthPrincipal, id: string) {
    return this.view(principal, id, (await this.load(id)).doc);
  }

  async getAllPalettes(principal: AuthPrincipal, page = 1, pageSize = 50) {
    const size = Math.min(Math.max(pageSize, 1), 200);
    const from = (Math.max(page, 1) - 1) * size;
    let hits: Array<{ _id: string; _source?: PaletteDoc }>;
    try {
      const result = await this.elasticsearchService.search<PaletteDoc>({
        index: INDEX,
        from,
        size,
        query: { match_all: {} },
        sort: [{ createdAt: { order: 'desc', unmapped_type: 'date' } }],
      });
      hits = result.hits.hits as Array<{ _id: string; _source?: PaletteDoc }>;
    } catch (error) {
      // No palettes have been saved yet, so the index doesn't exist
      if (isEsNotFound(error)) return [];
      this.storageError(error);
    }
    return Promise.all(hits.map((hit) => this.view(principal, hit._id, hit._source as PaletteDoc)));
  }

  async analyzePalette(dto: AnalyzePaletteDto) {
    const colors = dto.colors.map((c) => c.hex);
    const analysis = this.colorTheoryService.analyzePalette(colors);
    const contrastResults = this.colorTheoryService.testContrast(colors);
    const suggestions = this.colorTheoryService.generateSuggestions(colors);

    // Detect palette type to identify intentional extreme colors
    const lightCount = analysis.filter((a) => a.luminance > 0.7).length;
    const darkCount = analysis.filter((a) => a.luminance < 0.2).length;
    const paletteType =
      lightCount > colors.length * 0.6
        ? 'light'
        : darkCount > colors.length * 0.6
        ? 'dark'
        : 'mixed';
    
    // Consider a palette "light-dominant" if it has >= 50% light colors OR lightCount >= 3
    // This helps identify palettes that are essentially light but fall just below the 60% threshold
    const isLightDominant = lightCount >= Math.max(3, colors.length * 0.5);
    
    console.log(`[Service] Palette analysis: ${colors.length} colors, ${lightCount} light, ${darkCount} dark, type=${paletteType}, lightDominant=${isLightDominant}`);

    // Find problematic colors with palette context for better fixes
    // EXCLUDE intentional dark colors in light-dominant palettes (they're needed for contrast)
    const problematicColors = analysis
      .map((a, index) => {
        const item = {
          color: colors[index],
          analysis: a,
          fixes: this.colorTheoryService.suggestFixes(a, analysis),
        };
        
        // Debug: Log every color being checked
        const isIntentionalDark = isLightDominant && a.luminance < 0.2 && darkCount <= 2;
        console.log(`[Service] Checking ${item.color}: luminance=${a.luminance.toFixed(3)}, isIntentionalDark=${isIntentionalDark}, isTooDark=${a.isTooDark}, isTooBright=${a.isTooBright}, isTooVibrant=${a.isTooVibrant}`);
        
        return item;
      })
      .filter((item) => {
        // Never flag intentional dark colors in light-dominant palettes
        const isIntentionalDark = isLightDominant && item.analysis.luminance < 0.2 && darkCount <= 2;
        if (isIntentionalDark) {
          console.log(`[Service] Excluding ${item.color} from problematic colors - intentional dark in light-dominant palette (luminance: ${item.analysis.luminance.toFixed(3)}, darkCount: ${darkCount}, isLightDominant: ${isLightDominant})`);
          return false;
        }
        
        // Also check: if the analysis says isTooDark=false but the color is dark and in a light-dominant palette, exclude it anyway
        // This is a safety check in case the analysis logic didn't catch it
        if (isLightDominant && item.analysis.luminance < 0.2 && darkCount <= 2) {
          console.log(`[Service] Safety check: Excluding ${item.color} - dark color in light-dominant palette`);
          return false;
        }
        
        const hasIssues = item.analysis.isTooDark || item.analysis.isTooBright || item.analysis.isTooVibrant;
        if (hasIssues) {
          console.log(`[Service] Flagging ${item.color} as problematic: isTooDark=${item.analysis.isTooDark}, isTooBright=${item.analysis.isTooBright}, isTooVibrant=${item.analysis.isTooVibrant}`);
        }
        return hasIssues;
      });
    
    console.log(`[Service] Final problematic colors count: ${problematicColors.length}`);
    if (problematicColors.length > 0) {
      problematicColors.forEach(pc => {
        console.log(`[Service] Problematic color: ${pc.color} - isTooDark=${pc.analysis.isTooDark}, isTooBright=${pc.analysis.isTooBright}, isTooVibrant=${pc.analysis.isTooVibrant}`);
      });
    }

    return {
      analysis,
      contrastResults,
      suggestions,
      problematicColors,
      hasClearMainColor: this.colorTheoryService.hasClearMainColor(colors),
    };
  }

  async getSuggestions(colors: string[], regenerateType?: string) {
    return this.colorTheoryService.generateSuggestions(colors, regenerateType);
  }

  async suggestContrastFix(color1: string, color2: string, targetRatio?: number) {
    return this.colorTheoryService.suggestContrastFix(color1, color2, targetRatio);
  }

  async suggestStrategicColors(colors: string[], contrastResults: any[], maxSuggestions?: number) {
    return this.colorTheoryService.suggestStrategicColors(colors, contrastResults, maxSuggestions);
  }
}

