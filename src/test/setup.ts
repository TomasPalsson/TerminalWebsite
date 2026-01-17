/**
 * Vitest Setup File
 *
 * This file runs before each test file and sets up the test environment.
 * It configures:
 * - DOM environment via jsdom
 * - React Testing Library matchers
 * - Three.js/WebGL mocks
 * - Browser API mocks
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test to prevent memory leaks and test pollution
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ============================================================================
// WebGL / Canvas Mocks (Required for Three.js)
// ============================================================================

/**
 * Mock WebGL context for Three.js rendering
 * Three.js requires WebGL which is not available in jsdom
 */
class MockWebGLRenderingContext {
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  // Core WebGL methods that Three.js requires
  getExtension = vi.fn(() => null);
  getParameter = vi.fn((param: number) => {
    // Return sensible defaults for common parameters
    const params: Record<number, unknown> = {
      7936: 'WebGL Mock Vendor', // VENDOR
      7937: 'WebGL Mock Renderer', // RENDERER
      7938: 'WebGL 1.0 Mock', // VERSION
      35724: 'WebGL GLSL ES 1.0', // SHADING_LANGUAGE_VERSION
      34076: 16384, // MAX_TEXTURE_SIZE
      3379: 16384, // MAX_TEXTURE_SIZE (legacy)
      34930: 16, // MAX_TEXTURE_IMAGE_UNITS
      35661: 16, // MAX_VERTEX_TEXTURE_IMAGE_UNITS
      36347: 1024, // MAX_VERTEX_UNIFORM_VECTORS
      36348: 256, // MAX_VARYING_VECTORS
      36349: 224, // MAX_FRAGMENT_UNIFORM_VECTORS
    };
    return params[param] ?? 0;
  });
  getShaderPrecisionFormat = vi.fn(() => ({
    precision: 23,
    rangeMin: 127,
    rangeMax: 127,
  }));

  // Shader methods
  createShader = vi.fn(() => ({}));
  shaderSource = vi.fn();
  compileShader = vi.fn();
  getShaderParameter = vi.fn(() => true);
  getShaderInfoLog = vi.fn(() => '');
  deleteShader = vi.fn();

  // Program methods
  createProgram = vi.fn(() => ({}));
  attachShader = vi.fn();
  linkProgram = vi.fn();
  getProgramParameter = vi.fn(() => true);
  getProgramInfoLog = vi.fn(() => '');
  useProgram = vi.fn();
  deleteProgram = vi.fn();
  validateProgram = vi.fn();

  // Buffer methods
  createBuffer = vi.fn(() => ({}));
  bindBuffer = vi.fn();
  bufferData = vi.fn();
  deleteBuffer = vi.fn();

  // Texture methods
  createTexture = vi.fn(() => ({}));
  bindTexture = vi.fn();
  texImage2D = vi.fn();
  texParameteri = vi.fn();
  deleteTexture = vi.fn();
  activeTexture = vi.fn();
  generateMipmap = vi.fn();
  pixelStorei = vi.fn();

  // Framebuffer methods
  createFramebuffer = vi.fn(() => ({}));
  bindFramebuffer = vi.fn();
  framebufferTexture2D = vi.fn();
  checkFramebufferStatus = vi.fn(() => 36053); // FRAMEBUFFER_COMPLETE
  deleteFramebuffer = vi.fn();

  // Renderbuffer methods
  createRenderbuffer = vi.fn(() => ({}));
  bindRenderbuffer = vi.fn();
  renderbufferStorage = vi.fn();
  framebufferRenderbuffer = vi.fn();
  deleteRenderbuffer = vi.fn();

  // Uniform methods
  getUniformLocation = vi.fn(() => ({}));
  uniform1i = vi.fn();
  uniform1f = vi.fn();
  uniform2f = vi.fn();
  uniform3f = vi.fn();
  uniform4f = vi.fn();
  uniform1fv = vi.fn();
  uniform2fv = vi.fn();
  uniform3fv = vi.fn();
  uniform4fv = vi.fn();
  uniformMatrix3fv = vi.fn();
  uniformMatrix4fv = vi.fn();

  // Attribute methods
  getAttribLocation = vi.fn(() => 0);
  enableVertexAttribArray = vi.fn();
  disableVertexAttribArray = vi.fn();
  vertexAttribPointer = vi.fn();

  // Drawing methods
  viewport = vi.fn();
  clear = vi.fn();
  clearColor = vi.fn();
  clearDepth = vi.fn();
  clearStencil = vi.fn();
  drawArrays = vi.fn();
  drawElements = vi.fn();

  // State methods
  enable = vi.fn();
  disable = vi.fn();
  blendFunc = vi.fn();
  blendFuncSeparate = vi.fn();
  depthFunc = vi.fn();
  depthMask = vi.fn();
  cullFace = vi.fn();
  frontFace = vi.fn();
  colorMask = vi.fn();
  scissor = vi.fn();

  // Read methods
  readPixels = vi.fn();

  // Error handling
  getError = vi.fn(() => 0);

  // Miscellaneous
  isContextLost = vi.fn(() => false);
  flush = vi.fn();
  finish = vi.fn();
}

// Mock canvas getContext to return WebGL context
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (
  contextId: string,
  options?: unknown
): RenderingContext | null {
  if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
    return new MockWebGLRenderingContext(this) as unknown as WebGLRenderingContext;
  }
  return originalGetContext.call(this, contextId, options);
};

// ============================================================================
// Browser API Mocks
// ============================================================================

/**
 * Mock window.matchMedia for responsive testing
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock ResizeObserver for component resize handling
 */
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

/**
 * Mock IntersectionObserver for lazy loading and visibility detection
 */
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords = vi.fn(() => []);
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

/**
 * Mock requestAnimationFrame for animation testing
 */
let rafId = 0;
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  rafId += 1;
  setTimeout(() => callback(performance.now()), 16);
  return rafId;
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

/**
 * Mock localStorage
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

/**
 * Mock crypto.randomUUID for unique key generation
 */
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => `test-uuid-${Math.random().toString(36).substring(2, 9)}`),
    getRandomValues: vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

/**
 * Mock scrollIntoView for terminal scrolling
 */
Element.prototype.scrollIntoView = vi.fn();

/**
 * Mock scrollTo for terminal clearing
 */
Element.prototype.scrollTo = vi.fn();

/**
 * Mock getComputedStyle for CSS variable access
 */
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = vi.fn((element: Element) => {
  const style = originalGetComputedStyle(element);
  return {
    ...style,
    getPropertyValue: vi.fn((prop: string) => {
      if (prop === '--terminal') return '#22c55e';
      return style.getPropertyValue(prop);
    }),
  };
}) as typeof window.getComputedStyle;

// ============================================================================
// Three.js / React Three Fiber Mocks
// ============================================================================

/**
 * Mock for @react-three/fiber Canvas component
 */
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: vi.fn(({ children }: { children: React.ReactNode }) => children),
    useFrame: vi.fn(),
    useThree: vi.fn(() => ({
      gl: new MockWebGLRenderingContext(document.createElement('canvas')),
      scene: {},
      camera: {},
      size: { width: 800, height: 600 },
    })),
  };
});

/**
 * Mock for @react-three/drei helpers
 */
vi.mock('@react-three/drei', () => ({
  OrbitControls: vi.fn(() => null),
  useGLTF: vi.fn(() => ({
    scene: {
      getObjectByName: vi.fn(() => ({
        material: null,
      })),
    },
    nodes: {},
    materials: {},
  })),
  Html: vi.fn(({ children }: { children: React.ReactNode }) => children),
  Text: vi.fn(() => null),
}));

/**
 * Mock for three module
 */
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    CanvasTexture: vi.fn().mockImplementation(() => ({
      needsUpdate: false,
      flipY: true,
      wrapS: 0,
      center: { set: vi.fn() },
    })),
    MeshBasicMaterial: vi.fn().mockImplementation(() => ({})),
  };
});

// ============================================================================
// React Router Mock
// ============================================================================

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '' })),
    useParams: vi.fn(() => ({})),
  };
});

// ============================================================================
// Device Detection Mock
// ============================================================================

vi.mock('react-device-detect', () => ({
  isMobile: false,
  isDesktop: true,
  isBrowser: true,
}));

// ============================================================================
// Console Suppression for Expected Errors
// ============================================================================

const originalError = console.error;
console.error = (...args: unknown[]) => {
  // Suppress React Testing Library act() warnings in certain scenarios
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: An update to') &&
    args[0].includes('was not wrapped in act')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// ============================================================================
// Type Declarations
// ============================================================================

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown>
      extends jest.Matchers<void, T>,
        matchers.TestingLibraryMatchers<T, void> {}
  }
}
