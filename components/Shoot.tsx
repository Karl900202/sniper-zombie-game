import { memo } from "react";
import Image from "next/image";
import { UI_CONSTANTS } from "@/app/page";

interface ShootingBulletProps {
  width: number;
  height: number;
  /** true일 때 시작 애니메이션 GIF 표시, 아니면 기본 PNG */
  isStartAnimation: boolean;
  /** 모바일 vh 문제 해결용 */
  viewportHeight: number;
}

function ShootingBullet({
  width,
  height,
  isStartAnimation,
  viewportHeight,
}: ShootingBulletProps) {
  const src = isStartAnimation
    ? "/sniper-shooting-motion.gif"
    : "/sniper-hold-motion.png";

  // 모바일 브라우저의 vh 문제 해결: 실제 픽셀 값으로 계산
  const topPosition =
    viewportHeight > 0
      ? (viewportHeight * UI_CONSTANTS.TOP_POSITION_VH) / 100
      : `${UI_CONSTANTS.TOP_POSITION_VH}vh`;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
      style={{
        top: typeof topPosition === "number" ? `${topPosition}px` : topPosition,
        left: `${UI_CONSTANTS.CENTER_VW}vw`,
      }}
    >
      <Image
        src={src}
        alt="apple"
        width={width + 50}
        height={height + 50}
        priority
      />
    </div>
  );
}

export default memo(ShootingBullet);
