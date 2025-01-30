import { useRef } from "react";
import { Button } from "primereact/button";
import { Galleria, GalleriaResponsiveOptions } from "primereact/galleria";
import { SliderItem } from "../../../redux/slices/types/mossApp/Slider";

export default function SliderGallery({ images }: { images: SliderItem[] }) {
  const galleria = useRef(null);

  const responsiveOptions: GalleriaResponsiveOptions[] = [
    {
      breakpoint: "1500px",
      numVisible: 5,
    },
    {
      breakpoint: "1024px",
      numVisible: 3,
    },
    {
      breakpoint: "768px",
      numVisible: 2,
    },
    {
      breakpoint: "560px",
      numVisible: 1,
    },
  ];

  const itemTemplate = (item: SliderItem) => {
    return (
      <img
        src={item.image as string}
        alt={item.title}
        style={{ width: "100%", display: "block" }}
      />
    );
  };

  const thumbnailTemplate = (item: SliderItem) => {
    return (
      <img
        src={item.image as string}
        alt={item.title}
        style={{ display: "block" }}
      />
    );
  };

  return (
    <div className="card flex justify-content-center">
      <Galleria
        ref={galleria}
        value={images}
        responsiveOptions={responsiveOptions}
        numVisible={9}
        style={{ maxWidth: "50%" }}
        circular
        fullScreen
        showItemNavigators
        item={itemTemplate}
        thumbnail={thumbnailTemplate}
      />

      <Button
        size="small"
        label="Full screen view"
        icon="pi pi-external-link"
        // @ts-expect-error
        onClick={() => galleria?.current?.show()}
      />
    </div>
  );
}
