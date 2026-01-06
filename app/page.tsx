"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Modal from "@/components/Modal";
import TargetZombie from "@/components/TargetZombie";
import Shoot from "@/components/Shoot";
import Distance from "@/components/Distance";
import Citizen from "@/components/Citizen";
import HoldHint from "@/components/HoldHint";
import AccuracyTextDisplay from "@/components/AccuracyTextDisplay";
// 게임 상수
//브랜치
const METRIC = {
  BG_WIDTH: 7000,
  GUN_WIDTH: 130,
  GUN_HEIGHT: 130,
} as const;

const ACCURACY_THRESHOLDS = {
  EXCELLENT: 30,
  GOOD: 70,
} as const;

const TARGET_WIDTH = 150;
const TARGET_HEIGHT = 150;

// UI 위치 상수
export const UI_CONSTANTS = {
  THROTTLE_MS: 33, // 30fps (1000ms / 30 ≈ 33ms)
  TOP_POSITION_VH: 52, // "top-[52vh]"
  CENTER_VW: 50, // "50vw"
} as const;

const GAME_CONFIG = {
  START_VALUE: 0,
  DECAY_PER_SEC: 1000, // 초당 증가량

  AUTO_FAIL_METERS: 5000,
  FINISH_LINE_MIN: 2000,
  FINISH_LINE_MAX: 4500,
  START_DELAY_MS: 900,
  MODAL_DELAY_MS: 1200,
};
export type GameResult = "success" | "failed";
export type GameState = "ready" | "starting" | "playing" | GameResult;

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
  const [accuracyText, setAccuracyText] = useState<string | null>(null);

  // Refs
  const bulletRef = useRef(GAME_CONFIG.START_VALUE);
  const backgroundRef = useRef<HTMLDivElement>(null); // 배경 div에 직접 접근
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

  // 클라이언트에서만 도착선 위치 랜덤 생성 (hydration mismatch 방지)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // setTimeout으로 hydration 이후에 실행되도록 보장
    setTimeout(() => {
      setTargetZombiePosition(generateRandomTargetZombiePosition());
    }, 0);
  }, []); // 마운트 시 한 번만 실행

  // 배경 transform 업데이트 헬퍼 함수
  const updateBackgroundTransform = (value: number) => {
    if (backgroundRef.current) {
      backgroundRef.current.style.transform = `translateX(${-value}px)`;
    }
  };

  // 초기 배경 위치 설정
  useEffect(() => {
    updateBackgroundTransform(GAME_CONFIG.START_VALUE);
  }, []);

  // 게임 루프 제어
  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  // 게임 종료 (성공/실패 공통 로직)
  const endGame = useCallback(
    (result: GameResult) => {
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

      // 33ms마다 state 업데이트 렌더링 throttle 30fps
      if (
        lastUpdateTimeRef.current === null ||
        currentTime - lastUpdateTimeRef.current >= UI_CONSTANTS.THROTTLE_MS
      ) {
        setBulletPosition(bulletRef.current);
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
        updateBackgroundTransform(GAME_CONFIG.AUTO_FAIL_METERS);
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

      // 매 프레임마다 배경 위치 업데이트 (DOM 직접 조작)
      updateBackgroundTransform(bulletRef.current);

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

  // 게임 초기화 (상태 리셋 + 게임 데이터 초기화)
  const resetAndInitializeGame = useCallback(() => {
    setShowModal(false);
    stopLoop();
    setTargetZombiePosition(generateRandomTargetZombiePosition());
    bulletRef.current = GAME_CONFIG.START_VALUE;
    setBulletPosition(GAME_CONFIG.START_VALUE);
    updateBackgroundTransform(GAME_CONFIG.START_VALUE);
    setAccuracyText(null);
    lastUpdateTimeRef.current = null;
  }, [stopLoop]);

  const handleGameStart = useCallback(() => {
    resetAndInitializeGame();
    setGameState("starting");
  }, [resetAndInitializeGame]);

  // 정확도 텍스트 결정
  const determineAccuracyText = useCallback(
    (distance: number, result: GameResult): string => {
      if (result === "failed" || distance > ACCURACY_THRESHOLDS.GOOD) {
        return "BAD";
      } else if (distance <= ACCURACY_THRESHOLDS.EXCELLENT) {
        return "EXCELLENT";
      } else {
        return "GOOD";
      }
    },
    []
  );

  // 화면 탭 시 게임 종료 및 결과 판정
  const handleScreenTap = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (gameState !== "playing") return;

      const currentBulletPosition = bulletRef.current;
      const distance = Math.abs(currentBulletPosition - targetZombiePosition);

      const result: GameResult =
        currentBulletPosition <= targetZombiePosition &&
        currentBulletPosition >= targetZombiePosition - TARGET_WIDTH / 2
          ? "success"
          : "failed";

      setAccuracyText(determineAccuracyText(distance, result));
      endGame(result);
    },
    [gameState, endGame, targetZombiePosition, determineAccuracyText]
  );

  const handleRetry = useCallback(() => {
    resetAndInitializeGame();
    setGameState("ready");
  }, [resetAndInitializeGame]);

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

  return (
    <>
      <div
        ref={backgroundRef} // ref 연결
        className=" w-full no-select overflow-hidden touch-none select-none will-change-transform"
        style={{
          width: `${METRIC.BG_WIDTH}px`,
          height: viewportHeight ? `${viewportHeight}px` : "100vh",
          // transform은 ref로 직접 조작
        }}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={handleScreenTap}
      >
        {/* 배경 레이어 1 */}
        <div
          className="absolute inset-0 pointer-events-none bg-[url('/background-white.png')] bg-repeat-x"
          style={{
            backgroundSize: "auto 100%",
            backgroundPosition: "left center",
          }}
        />

        {/* 타겟좀비 위치 (가로 진행 기준) */}
        <TargetZombie
          locationX={targetZombiePosition}
          gameState={gameState}
          height={TARGET_HEIGHT}
          width={TARGET_WIDTH}
          viewportHeight={viewportHeight}
        />

        {/* 정확도 텍스트 (좀비 머리 위에 표시) */}
        {accuracyText &&
          (gameState === "success" || gameState === "failed") && (
            <AccuracyTextDisplay
              text={accuracyText}
              bulletPosition={bulletPosition}
            />
          )}

        {/* 시민 위치 (가로 진행 기준) - 실패 시에만 표시 */}
        {gameState === "failed" && (
          <Citizen
            locationX={bulletPosition}
            gameState={gameState}
            height={TARGET_HEIGHT}
            width={TARGET_WIDTH}
            viewportHeight={viewportHeight}
          />
        )}

        <Shoot
          width={METRIC.GUN_WIDTH}
          height={METRIC.GUN_HEIGHT}
          isStartAnimation={gameState === "starting"}
          viewportHeight={viewportHeight}
        />
      </div>

      {/* 거리 표시 (게임 진행 중, 성공, 실패 시에만 표시) */}
      {(gameState === "playing" ||
        gameState === "success" ||
        gameState === "failed") && <Distance value={bulletPosition} />}

      {/* 터치 힌트 (게임 진행 중에만 표시) */}
      <HoldHint show={gameState === "playing"} />

      {/* 게임 시작 버튼 */}
      {gameState === "ready" && (
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
          <button
            onClick={handleGameStart}
            className="px-10 py-3 text-white rounded-xl font-normal text-lg border-[2px] border-white shadow-md transition-colors bg-black"
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
