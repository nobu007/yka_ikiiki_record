import Image from "next/image";
import { memo } from "react";
import { ACCESSIBILITY_MESSAGES } from "@/lib/constants/messages";

export const GridShape = memo(() => {
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
        <Image
          width={540}
          height={254}
          src="/images/shape/grid-01.svg"
          alt={ACCESSIBILITY_MESSAGES.GRID_SHAPE_ALT}
        />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
        <Image
          width={540}
          height={254}
          src="/images/shape/grid-01.svg"
          alt={ACCESSIBILITY_MESSAGES.GRID_SHAPE_ALT}
        />
      </div>
    </>
  );
});

GridShape.displayName = "GridShape";

export default GridShape;
