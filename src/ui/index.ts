// Barrel de componentes UI presentacionales.

export { HUD, type HUDProps } from "./hud/HUD";
export { ReputationBadge, type ReputationBadgeProps } from "./hud/ReputationBadge";
export { TraceBar, type TraceBarProps } from "./hud/TraceBar";
export { DarknetBoard, type DarknetBoardProps } from "./panels/DarknetBoard";
export { StatusPanel, type StatusPanelProps } from "./panels/StatusPanel";
export { ToolShop, type ToolShopProps } from "./shop/ToolShop";
export { CommandHint, type CommandHintProps } from "./guides/CommandHint";
export {
  CommandGuide,
  type CommandGuideProps,
  type CommandGuideItem,
  type CommandGuideCategory,
} from "./guides/CommandGuide";
export {
  StoryDialog,
  resolveAvatarKind,
  resolveCharacterDisplayName,
  type StoryDialogProps,
  type CharacterAvatarKind,
} from "./guides/StoryDialog";
export { GameLayout, type GameLayoutProps } from "./layout/GameLayout";
export { TitleScreen, type TitleScreenProps } from "./title/TitleScreen";
export {
  IntroSequence,
  DEFAULT_INTRO_VIGNETTES,
  type IntroSequenceProps,
  type IntroVignette,
  type IntroSlideInput,
} from "./intro/IntroSequence";
export {
  Desktop,
  type DesktopProps,
  type DesktopWindowId,
  type SidePanelTab,
} from "./desktop/Desktop";
export { GameNotifications, type GameNotificationsProps } from "./feedback/GameNotifications";
export { BootSequence, type BootSequenceProps } from "./feedback/BootSequence";
