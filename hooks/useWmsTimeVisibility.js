import { onBeforeUnmount } from 'vue';

// Track callers that requested the WMS time control to be hidden.
const hiddenOwners = new Set();

// Store previous display values per DOM element so restore is safe when multiple callers
// toggle visibility at different times.
const previousDisplayMap = new WeakMap();

// MutationObserver to catch late-mounted #wmsTime elements (e.g. different mount order)
let observer = null;

function applyWmsTimeVisibility() {
  if (typeof document === 'undefined') return;

  const elems = Array.from(document.querySelectorAll('#wmsTime'));
  if (!elems.length) return;

  if (hiddenOwners.size > 0) {
    for (const el of elems) {
      if (!previousDisplayMap.has(el)) {
        // Save the inline style value (may be empty string)
        previousDisplayMap.set(el, el.style.display === '' ? null : el.style.display);
      }
      el.style.display = 'none';
    }
    return;
  }

  // No owners want it hidden => restore previous display for all matched elements
  for (const el of elems) {
    if (previousDisplayMap.has(el)) {
      const prev = previousDisplayMap.get(el);
      if (prev === null) {
        el.style.removeProperty('display');
      } else {
        el.style.display = prev;
      }
      previousDisplayMap.delete(el);
    } else {
      // Ensure any inline hiding is removed when nothing requests hiding
      el.style.removeProperty('display');
    }
  }
}

function ensureObserver() {
  if (observer) return;
  if (typeof MutationObserver === 'undefined') return;

  observer = new MutationObserver(() => {
    // Try to apply visibility whenever DOM changes (debounce not necessary here)
    applyWmsTimeVisibility();
  });

  try {
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (err) {
    // Ignore errors when the environment restricts DOM observation.
    void err;
  }
}

function disconnectObserverIfIdle() {
  if (!observer) return;
  if (hiddenOwners.size === 0) {
    try {
      observer.disconnect();
    } catch (err) {
      void err;
    }
    observer = null;
  }
}

export function useWmsTimeVisibility() {
  const owner = Symbol('wms-time-visibility-owner');

  const setWmsTimeHidden = (isHidden) => {
    if (isHidden) {
      hiddenOwners.add(owner);
      ensureObserver();
    } else {
      hiddenOwners.delete(owner);
    }
    applyWmsTimeVisibility();
    disconnectObserverIfIdle();
  };

  const refreshWmsTimeVisibility = () => {
    applyWmsTimeVisibility();
  };

  onBeforeUnmount(() => {
    hiddenOwners.delete(owner);
    applyWmsTimeVisibility();
    disconnectObserverIfIdle();
  });

  return {
    refreshWmsTimeVisibility,
    setWmsTimeHidden
  };
}
