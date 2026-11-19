import { lazy, Suspense, useState } from "react";
import "./styles/tokens.css";
import {
  COMMAND_GUIDE,
  CONTRACTS,
  INTRO,
  TOOLS,
  WORK_WELCOME,
  useAcceptContract,
  useActiveContract,
  useCompletedContracts,
  useConnectedTo,
  useDifficulty,
  useIntroSeen,
  useMarkIntroSeen,
  useNewGame,
  usePlayer,
  useRunCommand,
  useSubmitContract,
  useTraceLevel,
  useUnlockedTools,
} from "@/store";
import { injectTerminalDraft, Terminal } from "@/terminal/Terminal";
import {
  BootSequence,
  CommandGuide,
  CommandHint,
  countUnreadContracts,
  Desktop,
  GameNotifications,
  Inbox,
  IntroSequence,
  StatusPanel,
  StoryDialog,
  TitleScreen,
  ToolShop,
} from "@/ui";
import { SceneLoadingScreen } from "@/ui/feedback/SceneLoadingScreen";

// Three.js pesa más que todo el resto del juego: las escenas se cargan aparte
// para que el título y la terminal aparezcan sin esperarlo.
const SceneManager = lazy(() =>
  import("@/scenes/SceneManager").then((m) => ({ default: m.SceneManager })),
);
const OfficeScene = lazy(() =>
  import("@/scenes/OfficeScene").then((m) => ({ default: m.OfficeScene })),
);

// Recorrido del jugador (S2): título → intro → oficina → arranque del OS → escritorio.
// Es estado de pantalla, no de partida: al recargar se vuelve al título.
type Screen = "title" | "intro" | "office" | "boot" | "desktop";

// Contenedor principal: el único componente que conoce los hooks del store.
// Los demás reciben props.
export default function App() {
  const player = usePlayer();
  const traceLevel = useTraceLevel();
  const connectedTo = useConnectedTo();
  const difficulty = useDifficulty();
  const activeContract = useActiveContract();
  const completedContracts = useCompletedContracts();
  const unlockedTools = useUnlockedTools();
  const introSeen = useIntroSeen();
  const markIntroSeen = useMarkIntroSeen();
  const newGame = useNewGame();
  const acceptContract = useAcceptContract();
  const submitContract = useSubmitContract();
  const runCommand = useRunCommand();

  const [screen, setScreen] = useState<Screen>("title");
  const [shopOpen, setShopOpen] = useState(false);
  const [readIds, setReadIds] = useState<readonly string[]>([]);
  // Diálogos ya cerrados en esta sesión: la bienvenida y la intro de cada contrato
  const [dismissed, setDismissed] = useState<readonly string[]>([]);
  const dismiss = (id: string) => setDismissed((prev) => [...prev, id]);

  // De noche se trabaja para CIPHER (ADR-005)
  const night = activeContract?.channel === "darknet";

  if (screen === "title") {
    return (
      <TitleScreen
        hasSavedGame={introSeen}
        onNewGame={(name) => {
          const error = newGame(name);
          if (!error) setScreen("intro");
          return error;
        }}
        onContinue={() => setScreen("office")}
      />
    );
  }

  if (screen === "intro") {
    const finishIntro = () => {
      markIntroSeen();
      setScreen("office");
    };
    return <IntroSequence vignettes={INTRO} onComplete={finishIntro} onSkip={finishIntro} />;
  }

  if (screen === "office") {
    return (
      <Suspense fallback={<SceneLoadingScreen />}>
        <OfficeScene night={night} onEnterComputer={() => setScreen("boot")} />
      </Suspense>
    );
  }

  if (screen === "boot") {
    return <BootSequence onComplete={() => setScreen("desktop")} />;
  }

  const nextObjective = activeContract?.objectives.find((o) => !o.completed);
  const isNewPlayer = !activeContract && completedContracts.length === 0;

  let storyOverlay = null;
  if (activeContract && !dismissed.includes(activeContract.id)) {
    storyOverlay = (
      <StoryDialog
        lines={activeContract.story.intro}
        onDismiss={() => dismiss(activeContract.id)}
      />
    );
  } else if (isNewPlayer && !dismissed.includes("welcome")) {
    storyOverlay = <StoryDialog lines={WORK_WELCOME} onDismiss={() => dismiss("welcome")} />;
  }

  return (
    <>
      <Desktop
        player={player}
        traceLevel={traceLevel}
        connectedTo={connectedTo}
        gameClock={night ? "23:40 // TURNO NOCHE" : "08:00 // TURNO ACTIVO"}
        activeContract={activeContract}
        contracts={CONTRACTS}
        unreadInboxCount={countUnreadContracts(
          CONTRACTS,
          readIds,
          completedContracts,
          activeContract?.id,
        )}
        terminalWindow={<Terminal />}
        inboxWindow={
          <Inbox
            contracts={CONTRACTS}
            activeContractId={activeContract?.id ?? null}
            completedContracts={completedContracts}
            playerReputation={player.reputation}
            readIds={readIds}
            onMarkRead={(id) => setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
            onSelectContract={acceptContract}
          />
        }
        statusWindow={
          <StatusPanel
            activeContract={activeContract}
            connectedTo={connectedTo}
            onSubmitContract={submitContract}
          />
        }
        commandGuideWindow={
          <CommandGuide
            commands={COMMAND_GUIDE}
            playerReputation={player.reputation}
            onTryCommand={injectTerminalDraft}
          />
        }
        backgroundScene={
          <Suspense fallback={null}>
            <SceneManager />
          </Suspense>
        }
        storyOverlay={storyOverlay}
        commandHintOverlay={
          <CommandHint
            hint={nextObjective?.hints?.[0] ?? nextObjective?.hint ?? null}
            difficulty={difficulty}
          />
        }
        onOpenShop={() => setShopOpen(true)}
        shopModal={
          shopOpen ? (
            <ToolShop
              open
              tools={TOOLS}
              unlockedTools={unlockedTools}
              playerCredits={player.credits}
              playerLevel={player.level}
              // La compra pasa por el mismo comando que en la terminal: una sola regla de negocio
              onBuyTool={(id) => runCommand(`buy ${id}`)}
              onClose={() => setShopOpen(false)}
            />
          ) : null
        }
      />
      <GameNotifications />
    </>
  );
}
