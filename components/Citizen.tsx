import { memo } from "react";
import Image from "next/image";
import { GameState, UI_CONSTANTS } from "@/app/page";

interface CitizenProps {
  /** 시작 위치(픽셀 단위 거리) */
  locationX: number;
  gameState: GameState;
  height: number;
  width: number;
  /** 뷰포트 높이 (px) - 모바일 vh 문제 해결용 */
  viewportHeight: number;
}

function Citizen({
  locationX,
  gameState,
  height,
  width,
  viewportHeight,
}: CitizenProps) {
  const citizenState =
    gameState === "failed" ? "/citizen-explosion.png" : "/citizen.png";

  // 모바일 브라우저의 vh 문제 해결: 실제 픽셀 값으로 계산
  const topPosition =
    viewportHeight > 0
      ? (viewportHeight * UI_CONSTANTS.TOP_POSITION_VH) / 100
      : `${UI_CONSTANTS.TOP_POSITION_VH}vh`;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none w-[150px] h-[150px]"
      style={{
        top: typeof topPosition === "number" ? `${topPosition}px` : topPosition,
        // 화면 가로 중앙을 기준으로 locationX만큼 오른쪽에 세로선 배치
        left: `calc(${UI_CONSTANTS.CENTER_VW}vw + ${locationX}px + ${
          width / 4
        }px)`,
      }}
    >
      <Image
        src={citizenState}
        alt="citizenState"
        width={width}
        height={height}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}

export default memo(Citizen);
