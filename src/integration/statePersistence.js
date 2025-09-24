export function registerPersistence({ store, getState }) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  function persist() {
    const state = getState();
    if (state) {
      store.save(state);
    }
  }

  window.addEventListener('beforeunload', persist);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      persist();
    }
  });

  return () => {
    window.removeEventListener('beforeunload', persist);
  };
}
