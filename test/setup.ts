import { JSDOM } from 'jsdom'

// The test environment is jsdom, but jsdom 25 lazily exposes Storage and
// vitest does not copy the origin-aware `localStorage`/`sessionStorage` onto
// the global scope. Separately, Node >=22 ships a *disabled* built-in
// `localStorage` (it requires the --localstorage-file flag), which can leak in.
// To give every spec a reliable, origin-backed Storage, we unconditionally
// install a real jsdom-backed implementation here.
function installStorage(name: string, url = 'http://localhost/'): void {
  const dom = new JSDOM('<!DOCTYPE html>', { url })
  const target = dom.window[name] as Storage

  const wrapped = new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
    apply(target, _thisArg, args) {
      return Reflect.apply(target, target, args) as never
    },
  })

  Object.defineProperty(globalThis, name, {
    value: wrapped,
    writable: true,
    configurable: true,
  })
}

installStorage('localStorage')
installStorage('sessionStorage')
