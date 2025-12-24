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
      fontSize: "2.25rem",
      opacity: 0,
      scale: 0,
      transform: `translateY(${translateY + 20}px) scale(0)`,
    },
    to: {
      fontSize: "2.25rem",
      opacity: 1,
      scale: 1,
      transform: `translateY(${translateY}px) scale(1)`,
    },
    delay: index * 30,
    config: config.wobbly,
  });

  return (
    <animated.span
      style={{
        ...springProps,
        display: "inline-block",
        color: color,
        textShadow: "3px 3px 6px rgba(0,0,0,1), -1px -1px 2px rgba(0,0,0,1)",
        fontWeight: "900",
        marginRight: "2px",
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
      className="absolute pointer-events-none z-[100] font-bold"
      style={{
        left: `calc(50vw + ${bulletPosition}px)`,
        top: "30%",
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "flex-end",
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
