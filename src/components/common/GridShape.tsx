import Image from "next/image";
import { memo } from "react";
import { ACCESSIBILITY_MESSAGES } from "@/lib/constants/messages";

const GridImage = memo(() => (
  <Image
    width={540}
    height={254}
    src="/images/shape/grid-01.svg"
    alt={ACCESSIBILITY_MESSAGES.GRID_SHAPE_ALT}
  />
));

GridImage.displayName = "GridImage";

export const GridShape = memo(() => {
  const imageWrapperClasses = "absolute -z-1 w-full max-w-[250px] xl:max-w-[450px]";

  return (
    <>
      <div className={`${imageWrapperClasses} right-0 top-0`}>
        <GridImage />
      </div>
      <div className={`${imageWrapperClasses} bottom-0 left-0 rotate-180`}>
        <GridImage />
      </div>
    </>
  );
});

GridShape.displayName = "GridShape";

export default GridShape;
