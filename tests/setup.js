Object.defineProperty(global, 'requestAnimationFrame', {
  writable: true,
  value: (cb) => setTimeout(cb, 0),
});
