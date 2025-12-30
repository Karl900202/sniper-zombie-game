import { memo } from "react";
import Image from "next/image";
import { GameState } from "@/app/page";

interface CitizenProps {
  /** 시작 위치(픽셀 단위 거리) */
  locationX: number;
  gameState: GameState;
  height: number;
  width: number;
}

function Citizen({ locationX, gameState, height, width }: CitizenProps) {
  const citizenState =
    gameState === "failed" ? "/citizen-explosion.png" : "/citizen.png";

  return (
    <div
      className="absolute top-[52vh] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none w-[150px] h-[150px]"
      style={{
        // 화면 가로 중앙(50vw)을 기준으로 locationX만큼 오른쪽에 세로선 배치
        left: `calc(50vw + ${locationX}px + ${width / 4}px)`,
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
