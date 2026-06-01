/**
 * The minimal fields needed to reference and reconstruct a WMS layer.
 * Only this subset is persisted in the database; all other fields are
 * derived at runtime via toRuntimeWmsConfig().
 */
export function toStoredWmsRef(layer) {
  return {
    id: layer.id,
    name: layer.name,
    url: layer.url,
    typ: 'WMS',
    layers: layer.layers,
    version: layer.version,
    opacity: layer.opacity ?? 1,
    transparency: layer.transparency ?? 0,
    minScale: layer.minScale,
    maxScale: layer.maxScale,
  };
}

/**
 * Reconstructs the full runtime layer config from a stored WMS reference.
 * Safe to call on both legacy full configs (they spread cleanly) and new
 * minimal references.
 */
export function toRuntimeWmsConfig(ref) {
  return {
    ...ref,
    visibility: true,
    showInLayerTree: false,
    zIndex: 200,
  };
}

/**
 * Checks whether a WMS endpoint is reachable.
 * Uses mode:'no-cors' so CORS restrictions don't produce false negatives.
 * Only genuine network failures (DNS, TCP refused, timeout) return false.
 */
export async function isWmsAvailable(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const sep = url.includes('?') ? '&' : '?';
    await fetch(`${url}${sep}SERVICE=WMS&REQUEST=GetCapabilities`, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}
