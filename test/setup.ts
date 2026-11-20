import { JSDOM } from 'jsdom'

// jsdom 25+ lazily creates Storage (localStorage/sessionStorage) and only
// populates it when the Window was constructed with an origin-aware `url`.
// Vitest's bundled jsdom window keeps an opaque origin, leaving `localStorage`
// undefined in the global scope. Re-initialize it explicitly with a real origin
// so tests can rely on it.
if (typeof localStorage === 'undefined') {
  const dom = new JSDOM('<!DOCTYPE html>', { url: 'http://localhost/' })
  const proto = Object.getOwnPropertyNames(
    Object.getPrototypeOf(dom.window.localStorage),
  )
  proto.forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(dom.window.localStorage, key)
    if (desc) {
      Object.defineProperty(globalThis, key, {
        value: dom.window.localStorage[key].bind(dom.window.localStorage),
        configurable: true,
      })
    }
  })
}
