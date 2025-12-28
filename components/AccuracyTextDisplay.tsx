"use client";
import { useSpring, animated, config } from "@react-spring/web";

// 정확도 텍스트 개별 글자 컴포넌트 (react-spring 사용)
function AccuracyChar({
  char,
  index,
  totalChars,
  color,
}: {
  char: string;
  index: number;
  totalChars: number;
  color: string;
}) {
  const centerIndex = (totalChars - 1) / 2;
  const distanceFromCenter = Math.abs(index - centerIndex);
  const maxDistance = totalChars / 2;
  const heightRatio = 1 - (distanceFromCenter / maxDistance) ** 2;
  const translateY = -heightRatio * 15;

  const springProps = useSpring({
    from: {
      opacity: 0,
      scale: 0,
      transform: `translateY(${translateY + 20}px) scale(0)`,
    },
    to: {
      opacity: 1,
      scale: 1,
      transform: `translateY(${translateY}px) scale(1)`,
    },
    delay: index * 30,
    config: config.wobbly,
  });

  return (
    <animated.span
      className="text-4xl inline-block font-black mr-0.5 [text-shadow:3px_3px_6px_rgba(0,0,0,1),-1px_-1px_2px_rgba(0,0,0,1)]"
      style={{
        ...springProps,
        color: color,
      }}
    >
      {char === " " ? "\u00A0" : char}
    </animated.span>
  );
}

// 정확도 텍스트 컴포넌트 (react-spring 사용)
export default function AccuracyTextDisplay({
  text,
  bulletPosition,
}: {
  text: string;
  bulletPosition: number;
}) {
  const color =
    text === "EXCELLENT" ? "#FFD700" : text === "GOOD" ? "#4CAF50" : "#FF0000";

  return (
    <div
      className="absolute pointer-events-none z-[100] font-bold top-[30%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap inline-flex items-end"
      style={{
        left: `calc(50vw + ${bulletPosition}px)`,
      }}
    >
      {text.split("").map((char, index) => (
        <AccuracyChar
          key={index}
          char={char}
          index={index}
          totalChars={text.length}
          color={color}
        />
      ))}
    </div>
  );
}
