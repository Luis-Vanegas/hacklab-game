import { lazy, Suspense, useState } from "react";
import "./styles/tokens.css";
import {
  CONTRACTS,
  TOOLS,
  useAcceptContract,
  useActiveContract,
  useCompletedContracts,
  useConnectedTo,
  useDifficulty,
  usePlayer,
  useRunCommand,
  useSubmitContract,
  useTraceLevel,
  useUnlockedTools,
} from "@/store";
import { Terminal } from "@/terminal/Terminal";
import {
  CommandHint,
  DarknetBoard,
  GameLayout,
  HUD,
  StatusPanel,
  StoryDialog,
  ToolShop,
} from "@/ui";

// Three.js pesa más que todo el resto del juego: se carga aparte para que
// la terminal esté usable antes de que llegue el fondo 3D.
const SceneManager = lazy(() =>
  import("@/scenes/SceneManager").then((m) => ({ default: m.SceneManager })),
);

// Contenedor principal: conecta los componentes presentacionales con el store.
// Es el único componente de UI que conoce los hooks; los demás reciben props.
export default function App() {
  const player = usePlayer();
  const traceLevel = useTraceLevel();
  const connectedTo = useConnectedTo();
  const difficulty = useDifficulty();
  const activeContract = useActiveContract();
  const completedContracts = useCompletedContracts();
  const unlockedTools = useUnlockedTools();
  const acceptContract = useAcceptContract();
  const submitContract = useSubmitContract();
  const runCommand = useRunCommand();

  const [shopOpen, setShopOpen] = useState(false);
  // Se recuerda qué intro ya se cerró para no volver a mostrarla
  const [dismissedIntro, setDismissedIntro] = useState<string | null>(null);

  const nextObjective = activeContract?.objectives.find((o) => !o.completed);
  const showIntro = activeContract && dismissedIntro !== activeContract.id;

  return (
    <GameLayout
      backgroundScene={
        <Suspense fallback={null}>
          <SceneManager />
        </Suspense>
      }
      hud={
        <HUD
          player={player}
          traceLevel={traceLevel}
          connectedTo={connectedTo}
          onOpenShop={() => setShopOpen(true)}
        />
      }
      leftPanel={
        <DarknetBoard
          contracts={CONTRACTS}
          activeContractId={activeContract?.id ?? null}
          completedContracts={completedContracts}
          playerReputation={player.reputation}
          onSelectContract={acceptContract}
        />
      }
      centerTerminal={<Terminal />}
      rightPanel={
        <StatusPanel
          activeContract={activeContract}
          connectedTo={connectedTo}
          onSubmitContract={submitContract}
        />
      }
      storyDialog={
        showIntro ? (
          <StoryDialog
            lines={activeContract.story.intro}
            onDismiss={() => setDismissedIntro(activeContract.id)}
          />
        ) : null
      }
      commandHint={<CommandHint hint={nextObjective?.hint ?? null} difficulty={difficulty} />}
      modalOverlay={
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
  );
}
