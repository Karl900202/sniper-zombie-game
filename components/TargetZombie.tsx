import { memo } from "react";
import Image from "next/image";

interface TargetZombieProps {
  /** 시작 위치(픽셀 단위 거리) */
  locationX: number;
  gameState: string;
  height: number;
  width: number;
}

function TargetZombie({
  locationX,
  gameState,
  height,
  width,
}: TargetZombieProps) {
  const zombieState =
    gameState === "success" ? "/zombie-explosion.png" : "/target-zombie.png";
  const isSuccess = gameState === "success";
  return (
    <div
      className="absolute top-[52vh] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none w-[150px] h-[150px]"
      style={{
        // 화면 가로 중앙(50vw)을 기준으로 locationX만큼 오른쪽에 세로선 배치
        left: `calc(50vw + ${locationX}px)`,
      }}
    >
      <Image
        src={zombieState}
        alt="zombie-state"
        width={width}
        height={height}
        className={`w-full h-full object-contain `}
        priority
      />

      {/* <Image
        className="absolute top-[36px] left-[42px]"
        src={"/explosion.png"}
        alt="zombie-explosion"
        width={42}
        height={42}
        priority
      /> */}
    </div>
  );
}

export default memo(TargetZombie);
