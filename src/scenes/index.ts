// Barrel de escenas Three.js.

export {
  NetworkGraph,
  buildGraphTopology,
  type NetworkGraphProps,
  type GraphTopology,
} from "./NetworkGraph";
export { MatrixRain, createRainBuffer, type MatrixRainProps, type RainBuffer } from "./MatrixRain";
export {
  SceneManager,
  selectSceneKind,
  type SceneManagerProps,
  type ActiveSceneKind,
} from "./SceneManager";
export {
  OfficeScene,
  interpolateRoute,
  COWORKER_ROUTES,
  ZOOM_DURATION_SECONDS,
  type OfficeSceneProps,
  type WalkWaypoint,
  type WalkerPose,
} from "./OfficeScene";
