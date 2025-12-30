import { memo } from "react";
import Image from "next/image";
interface DistanceProps {
  value: number;
}

function Distance({ value }: DistanceProps) {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-[calc(50%-80px)] z-10 pointer-events-none">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-black text-xl font-bold drop-shadow-lg whitespace-nowrap text-center pb-10">
          {value.toFixed(0)}m
        </h1>
        <Image
          src={"/bullet.png"}
          alt="bullet"
          width={60}
          height={100}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
}

export default memo(Distance);
