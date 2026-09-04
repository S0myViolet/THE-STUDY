import type { Scene, SceneMutation } from "./types";

export function mutateScene(scene: Scene, _changes: number, _seed: number): { sceneB: Scene; mutations: SceneMutation[] } {
  return { sceneB: scene, mutations: [] };
}
