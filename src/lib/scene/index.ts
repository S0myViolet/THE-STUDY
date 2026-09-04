/**
 * Public scene-engine API. Implemented in ./engine, ./templates, ./render, ./questions, ./mutate.
 *
 *   const scene = buildScene("desk", 1234);
 *   <SceneSvg scene={scene} />
 *   const qs = generateQuestions(scene, rng, 6);
 *   const { sceneB, mutations } = mutateScene(scene, 3, seed);
 */
export * from "./types";
export { createRng } from "./rng";
export { buildScene, listTemplates, sceneFacts, describeObject, COLOR_HEX, COLOR_LABEL } from "./engine";
export { generateQuestions } from "./questions";
export { mutateScene } from "./mutate";
export { SceneSvg } from "./render";
