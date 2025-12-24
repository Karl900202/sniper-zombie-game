"use client";
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Modal from "@/components/Modal";
import TargetZombie from "@/components/TargetZombie";
import Shoot from "@/components/Shoot";
import Distance from "@/components/Distance";
import Citizen from "@/components/Citizen";
// 게임 상수
const METRIC = {
  BG_WIDTH: 7000,
  GUN_WIDTH: 130,
  GUN_HEIGHT: 130,
} as const;

const TARGET_WIDTH = 150;
const TARGET_HEIGHT = 150;

const GAME_CONFIG = {
  START_VALUE: 0,
  DECAY_PER_SEC: 1000, // 초당 증가량

  AUTO_FAIL_METERS: 5000,
  FINISH_LINE_MIN: 2000,
  FINISH_LINE_MAX: 4500,
  START_DELAY_MS: 800,
  MODAL_DELAY_MS: 500,
};

// 배경 이미지 스타일
const BACKGROUND_STYLE = {
  backgroundImage: "url('/background.png')",
  backgroundSize: "auto 100%",
  backgroundRepeat: "repeat-x",
  backgroundPosition: "left center",
} as const;

type GameState = "ready" | "starting" | "playing" | "success" | "failed";

// 랜덤 위치 생성 함수
const generateRandomTargetZombiePosition = (): number => {
  return (
    Math.floor(
      Math.random() *
        (GAME_CONFIG.FINISH_LINE_MAX - GAME_CONFIG.FINISH_LINE_MIN + 1)
    ) + GAME_CONFIG.FINISH_LINE_MIN
  );
};

export default function SniperZombieGame() {
  // 게임 상태
  const [gameState, setGameState] = useState<GameState>("ready");
  const [bulletPosition, setBulletPosition] = useState(GAME_CONFIG.START_VALUE);
  const [showModal, setShowModal] = useState(false);
  const [targetZombiePosition, setTargetZombiePosition] = useState(
    GAME_CONFIG.FINISH_LINE_MIN
  );
  const [viewportHeight, setViewportHeight] = useState(0);

  // Refs
  const bulletRef = useRef(GAME_CONFIG.START_VALUE);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null); // 마지막 state 업데이트 시간
  const loopRef = useRef<(currentTime: number) => void>(() => {});

  // 뷰포트 크기 측정
  useEffect(() => {
    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  // 타겟 좀비 위치 초기화 (hydration mismatch 방지)
  const initTargetZombiePosition = useCallback(() => {
    if (
      targetZombiePosition === GAME_CONFIG.FINISH_LINE_MIN &&
      typeof window !== "undefined"
    ) {
      setTimeout(() => {
        setTargetZombiePosition(generateRandomTargetZombiePosition());
      }, 0);
    }
  }, [targetZombiePosition]);

  // 클라이언트에서만 도착선 위치 랜덤 생성 (hydration mismatch 방지)
  useEffect(() => {
    initTargetZombiePosition();
  }, [initTargetZombiePosition]);

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // 게임 루프 제어
  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // 게임 종료 (성공/실패 공통 로직)
  const endGame = useCallback(
    (result: "success" | "failed") => {
      stopLoop();
      setGameState(result);
      setTimeout(() => setShowModal(true), GAME_CONFIG.MODAL_DELAY_MS);
    },
    [stopLoop]
  );

  // 시간 계산
  const calculateDeltaTime = useCallback((currentTime: number): number => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = currentTime;
      return 0;
    }
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;
    return deltaTime;
  }, []);

  // 이동 계산
  const updateBulletPosition = useCallback(
    (deltaTime: number, currentTime: number): number => {
      const decay = GAME_CONFIG.DECAY_PER_SEC * deltaTime;
      const next = bulletRef.current + decay;
      bulletRef.current = next;

      // 100ms마다만 state 업데이트 렌더링 throttle
      if (
        lastUpdateTimeRef.current === null ||
        currentTime - lastUpdateTimeRef.current >= 100
      ) {
        setBulletPosition(next);
        lastUpdateTimeRef.current = currentTime;
      }

      return next;
    },
    []
  );

  // 실패 판정
  const checkGameOver = useCallback(
    (position: number): boolean => {
      if (position >= GAME_CONFIG.AUTO_FAIL_METERS) {
        bulletRef.current = GAME_CONFIG.AUTO_FAIL_METERS;
        setBulletPosition(GAME_CONFIG.AUTO_FAIL_METERS);
        endGame("failed");
        return true;
      }
      return false;
    },
    [endGame]
  );

  // RAF 재귀 호출
  const scheduleNextFrame = useCallback(() => {
    rafRef.current = requestAnimationFrame(loopRef.current);
  }, []);

  // 게임 루프 (책임 분리)
  const loop = useCallback(
    (currentTime: number) => {
      const deltaTime = calculateDeltaTime(currentTime);
      if (deltaTime === 0) {
        scheduleNextFrame();
        return;
      }

      const newPosition = updateBulletPosition(deltaTime, currentTime);

      if (checkGameOver(newPosition)) {
        return;
      }

      scheduleNextFrame();
    },
    [calculateDeltaTime, updateBulletPosition, checkGameOver, scheduleNextFrame]
  );

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // 게임 상태 초기화
  const resetGameState = useCallback(() => {
    setShowModal(false);
    stopLoop();
  }, [stopLoop]);

  const initializeGame = useCallback(() => {
    setTargetZombiePosition(generateRandomTargetZombiePosition());
    bulletRef.current = GAME_CONFIG.START_VALUE;
    setBulletPosition(GAME_CONFIG.START_VALUE);
    lastUpdateTimeRef.current = null; // 다음 프레임에서 초기화
  }, []);

  const handleGameStart = useCallback(() => {
    resetGameState();
    initializeGame();
    setGameState("starting");
  }, [resetGameState, initializeGame]);

  // 화면 탭 시 게임 종료 및 결과 판정
  const handleScreenTap = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (gameState !== "playing") return;

      const result: "success" | "failed" =
        bulletPosition <= targetZombiePosition &&
        bulletPosition >= targetZombiePosition - TARGET_WIDTH / 2
          ? "success"
          : "failed";
      endGame(result);
    },
    [gameState, endGame, targetZombiePosition, bulletPosition]
  );

  const handleRetry = useCallback(() => {
    resetGameState();
    initializeGame();
    setGameState("ready");
  }, [resetGameState, initializeGame]);

  // 게임 시작 시 루프 시작
  useEffect(() => {
    if (gameState !== "starting") return;

    const timer = setTimeout(() => {
      setGameState("playing");
      lastTimeRef.current = null;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(loopRef.current);
      }
    }, GAME_CONFIG.START_DELAY_MS);

    return () => clearTimeout(timer);
  }, [gameState]);

  // 백그라운드 X 오프셋 계산
  const backgroundTranslateX = useMemo(() => -bulletPosition, [bulletPosition]);

  return (
    <>
      <div
        className=" w-full no-select overflow-hidden touch-none select-none will-change-transform"
        style={{
          width: `${METRIC.BG_WIDTH}px`,
          height: viewportHeight ? `${viewportHeight}px` : "100vh",
          transform: `translateX(${backgroundTranslateX}px)`,
        }}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={handleScreenTap}
      >
        {/* 배경 레이어 1 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={BACKGROUND_STYLE}
        />

        {/* 배경 레이어 2 (오버레이) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 z-[1]"
          style={BACKGROUND_STYLE}
        />

        {/* 타겟좀비 위치 (가로 진행 기준) */}
        <TargetZombie
          locationX={targetZombiePosition}
          gameState={gameState}
          height={TARGET_HEIGHT}
          width={TARGET_WIDTH}
        />
        {/* 총알 위치 (배경 기준 위치 고정) */}
        {/* 시민 위치 (가로 진행 기준) - 실패 시에만 표시 */}
        {gameState === "failed" && (
          <Citizen
            locationX={bulletPosition}
            gameState={gameState}
            height={TARGET_HEIGHT}
            width={TARGET_WIDTH}
          />
        )}

        <Shoot
          width={METRIC.GUN_WIDTH}
          height={METRIC.GUN_HEIGHT}
          // gameState가 "starting"일 때만 시작 GIF 표시
          isStartAnimation={gameState === "starting"}
        />
      </div>

      {/* 거리 표시 (게임 진행 중, 성공, 실패 시에만 표시) */}
      {(gameState === "playing" ||
        gameState === "success" ||
        gameState === "failed") && <Distance value={bulletPosition} />}

      {/* 게임 시작 버튼 */}
      {gameState === "ready" && (
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
          <button
            onClick={handleGameStart}
            className="px-10 py-3 text-white rounded-full font-normal text-lg border-[3px] border-white shadow-md transition-colors bg-[#4F00FF]"
          >
            게임 시작
          </button>
        </div>
      )}
      <Modal
        title={gameState === "success" ? "성공했습니다" : "실패했습니다!"}
        description={
          gameState === "success"
            ? `저격성공: ${bulletPosition.toFixed(0)}m`
            : "저격에 실패했습니다."
        }
        onClick={handleRetry}
        show={showModal}
        buttonText="재시도"
      />
    </>
  );
}
