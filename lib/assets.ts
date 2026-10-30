// Image paths for the deployed site. The single-file preview swaps this module
// for one with inlined data URIs (see scripts/build-preview.mjs).
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const ASSETS = {
  realAsAi: range(6).map((i) => `/img/real_as_ai_${i}.png`),
  aiAsReal: range(6).map((i) => `/img/ai_as_real_${i}.png`),
  heroCar: "/img/real_as_ai_1.png",
  transforms: "/img/cifake-transforms.png",
  grid: "/img/grid.png",
  photo: "/img/indi.jpg",
  photoSquare: "/img/indi-square.jpg",
};
