/** Form state for an application's editable fields */
export const detailsForm = (app = null) => ({
  name: app?.name ?? '',
  description: app?.description ?? '',
  repository: app?.repository ?? '',
  version: app?.version ?? '',
  applicationUrl: app?.applicationUrl ?? '',
  teamId: app?.teamId ?? '',
  designSystemVersion: app?.designSystemVersion ?? '',
  environment: app?.metadata?.environment ?? '',
  framework: app?.metadata?.framework ?? '',
  language: app?.metadata?.language ?? '',
  tags: (app?.metadata?.tags ?? []).join(', '),
});

const metadataOf = (form) => {
  const metadata = {};
  if (form.environment) metadata.environment = form.environment;
  if (form.framework.trim()) metadata.framework = form.framework.trim();
  if (form.language.trim()) metadata.language = form.language.trim();
  const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (tags.length) metadata.tags = tags;
  return metadata;
};

/** Body for POST /applications/register (without workspace and capabilities) */
export const registrationFields = (form) => {
  const body = { name: form.name.trim() };
  for (const key of ['description', 'repository', 'version', 'applicationUrl', 'teamId', 'designSystemVersion']) {
    const value = form[key]?.trim();
    if (value) body[key] = value;
  }
  const metadata = metadataOf(form);
  if (Object.keys(metadata).length) body.metadata = metadata;
  return body;
};

/**
 * Body for PUT /applications/:id: changed fields only. Cleared text fields are
 * sent as '' (the server stores that as "not set"). URLs can't be '' on the
 * server, so a cleared URL is sent as '' only where allowed.
 */
export const updateFields = (form, app) => {
  const body = {};
  if (form.name.trim() !== app.name) body.name = form.name.trim();
  for (const key of ['description', 'version', 'teamId']) {
    const value = form[key].trim();
    if (value !== (app[key] ?? '')) body[key] = value;
  }
  for (const key of ['repository', 'applicationUrl']) {
    const value = form[key].trim();
    if (value && value !== app[key]) body[key] = value;
  }
  const metadata = metadataOf(form);
  const before = app.metadata ?? {};
  const metadataChanged = ['environment', 'framework', 'language', 'tags'].some(
    (key) => JSON.stringify(metadata[key] ?? null) !== JSON.stringify(before[key] ?? null),
  );
  if (metadataChanged) body.metadata = metadata;
  return body;
};
