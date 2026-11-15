import { createDesignSystemService, createDesignSystemStores } from './testing/in-memory-stores';

describe('DesignSystemService.getComponentMetadata (Loupe Tool)', () => {
  const metadataFor = async (env: NodeJS.ProcessEnv) => {
    const service = await createDesignSystemService(createDesignSystemStores());
    return service.getComponentMetadata(service.getAllComponents(), env);
  };

  it('links docs to routes the app has, with no placeholder source or Figma links', async () => {
    const metadata = await metadataFor({});
    expect(metadata.button).toMatchObject({ name: 'Button', icon: 'rectangle-horizontal', links: { docs: '/components/buttons' } });
    for (const [id, entry] of Object.entries(metadata)) {
      if (id !== 'button') expect(entry.links.docs).toBe('/components');
      expect(entry.links).not.toHaveProperty('github');
      expect(entry.links).not.toHaveProperty('figma');
    }
  });

  it('makes docs links absolute with APP_PUBLIC_URL', async () => {
    const metadata = await metadataFor({ APP_PUBLIC_URL: 'https://design.example.com/' });
    expect(metadata.button.links.docs).toBe('https://design.example.com/components/buttons');
  });

  it('fills the configured source and Figma templates', async () => {
    const metadata = await metadataFor({
      COMPONENT_SOURCE_URL_TEMPLATE: 'https://github.com/acme/ds/tree/main/src/{name}',
      COMPONENT_FIGMA_URL_TEMPLATE: 'https://www.figma.com/design/KEY/Components?node-id={id}',
    });
    expect(metadata.button.links).toEqual({
      docs: '/components/buttons',
      github: 'https://github.com/acme/ds/tree/main/src/Button',
      figma: 'https://www.figma.com/design/KEY/Components?node-id=button',
    });
  });
});
