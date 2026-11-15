import { Injectable } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common/enums/request-method.enum';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { IS_PUBLIC_KEY, REQUIRED_PERMISSIONS_KEY } from '../auth/principal';
import { packageVersion } from '../health/health.service';

/** The one API version there is. Routes outside its base path predate it and stay where they are. */
export const CURRENT_VERSION = 'v1';
export const CURRENT_BASE_PATH = '/api/v1';

export interface ApiRoute {
  method: string;
  path: string;
  /** false for the few routes mounted outside /api/v1 (patterns library, palettes, versions) */
  versioned: boolean;
  /** Callable without a credential */
  public: boolean;
  /** Permissions the route requires on top of signing in */
  permissions: string[];
}

export interface ApiVersion {
  version: string;
  status: 'current';
  basePath: string;
  /** The server's release (backend package.json) */
  release: string;
  /** Routes the running server registers under basePath */
  routeCount: number;
}

const joinPath = (...parts: string[]) => `/${parts.join('/')}`.replace(/\/+/g, '/').replace(/(.)\/$/, '$1');
const firstPath = (value: unknown): string => (Array.isArray(value) ? String(value[0] ?? '') : String(value ?? ''));

/**
 * What the API offers, read from the controllers the server actually
 * registered: there is one version (v1), and the route list is the real one.
 */
@Injectable()
export class ApiVersioningService {
  private routes: ApiRoute[] | null = null;

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
  ) {}

  /** Every route the server registers, sorted by path then method */
  getRoutes(): ApiRoute[] {
    this.routes ??= this.discover();
    return this.routes;
  }

  getAllVersions(): ApiVersion[] {
    return [this.getCurrentVersion()];
  }

  getCurrentVersion(): ApiVersion {
    return {
      version: CURRENT_VERSION,
      status: 'current',
      basePath: CURRENT_BASE_PATH,
      release: packageVersion(),
      routeCount: this.getRoutes().filter((route) => route.versioned).length,
    };
  }

  /** `v1` or `1`; null for any other version */
  getVersion(version: string): ApiVersion | null {
    return normalise(version) === CURRENT_VERSION ? this.getCurrentVersion() : null;
  }

  isVersionSupported(version: string): boolean {
    return normalise(version) === CURRENT_VERSION;
  }

  private discover(): ApiRoute[] {
    const routes: ApiRoute[] = [];
    for (const wrapper of this.discovery.getControllers()) {
      const controller = wrapper.metatype as (new (...args: unknown[]) => unknown) | undefined;
      if (!controller || !wrapper.instance) continue;
      const prefix = firstPath(Reflect.getMetadata(PATH_METADATA, controller));
      const prototype = Object.getPrototypeOf(wrapper.instance);
      for (const name of this.scanner.getAllMethodNames(prototype)) {
        const handler = prototype[name];
        const path = Reflect.getMetadata(PATH_METADATA, handler);
        if (path === undefined) continue;
        const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod;
        const full = joinPath(prefix, firstPath(path));
        const meta = <T>(key: string): T | undefined => Reflect.getMetadata(key, handler) ?? Reflect.getMetadata(key, controller);
        routes.push({
          method: RequestMethod[method],
          path: full,
          versioned: full === CURRENT_BASE_PATH || full.startsWith(`${CURRENT_BASE_PATH}/`),
          public: meta<boolean>(IS_PUBLIC_KEY) === true,
          permissions: meta<string[]>(REQUIRED_PERMISSIONS_KEY) ?? [],
        });
      }
    }
    return routes.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  }
}

function normalise(version: string): string {
  return version.startsWith('v') ? version : `v${version}`;
}
