import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { DesignSystemService } from '../design-system/design-system.service';
import { DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { actorOf, isSafeId, newId } from '../workspaces/workspace-access.service';
import { CreateBrandDto, UpdateBrandDto } from './brands.dto';
import { BRAND_STORE, BrandDoc, TokenOverride } from './brands.types';

/**
 * Brands: named sets of design-token overrides on top of the base tokens
 * (docs/AUTH.md, "Brands"). Stored in Elasticsearch; names are unique,
 * ignoring case, and every override names a token that exists.
 */
@Injectable()
export class BrandsService {
  constructor(
    @Inject(BRAND_STORE) private readonly store: DocumentStore<BrandDoc>,
    private readonly designSystem: DesignSystemService,
  ) {}

  /** Every brand, by name */
  async list(): Promise<BrandDoc[]> {
    return (await this.store.list()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(id: string): Promise<BrandDoc> {
    const stored = isSafeId(id) ? await this.store.get(id) : null;
    if (!stored) throw new NotFoundException('Brand not found');
    return stored.doc;
  }

  async create(input: CreateBrandDto, principal: AuthPrincipal): Promise<BrandDoc> {
    await this.assertNameFree(input.name);
    const now = new Date().toISOString();
    const actor = actorOf(principal);
    const brand: BrandDoc = {
      id: newId('brd'),
      name: input.name,
      description: input.description ?? '',
      tokenOverrides: this.cleanOverrides(input.tokenOverrides ?? []),
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
    };
    try {
      await this.store.create(brand);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ConflictException('Brand already exists');
      throw error;
    }
    return brand;
  }

  async update(id: string, input: UpdateBrandDto, principal: AuthPrincipal): Promise<BrandDoc> {
    const stored = isSafeId(id) ? await this.store.get(id) : null;
    if (!stored) throw new NotFoundException('Brand not found');
    const brand = stored.doc;
    if (input.name !== undefined && input.name.toLowerCase() !== brand.name.toLowerCase()) {
      await this.assertNameFree(input.name);
    }
    if (input.name !== undefined) brand.name = input.name;
    if (input.description !== undefined) brand.description = input.description;
    if (input.tokenOverrides !== undefined) brand.tokenOverrides = this.cleanOverrides(input.tokenOverrides);
    brand.updatedAt = new Date().toISOString();
    brand.updatedBy = actorOf(principal);
    try {
      await this.store.replace(brand, stored.version);
    } catch (error) {
      if (error instanceof VersionConflictError) throw new ConflictException('The brand was changed by someone else, please reload and try again');
      throw error;
    }
    return brand;
  }

  async delete(id: string): Promise<void> {
    if (!isSafeId(id) || !(await this.store.delete(id))) throw new NotFoundException('Brand not found');
  }

  private async assertNameFree(name: string): Promise<void> {
    const taken = (await this.store.list()).some((b) => b.name.toLowerCase() === name.toLowerCase());
    if (taken) throw new ConflictException(`A brand named '${name}' already exists`);
  }

  /** One override per token, each naming a design token that exists */
  private cleanOverrides(overrides: TokenOverride[]): TokenOverride[] {
    const byToken = new Map<string, string>();
    for (const { token, value } of overrides) {
      if (!this.designSystem.getTokenByName(token)) throw new BadRequestException(`Token '${token}' not found`);
      if (byToken.has(token)) throw new BadRequestException(`Token '${token}' is overridden more than once`);
      byToken.set(token, value);
    }
    return [...byToken].map(([token, value]) => ({ token, value }));
  }
}
