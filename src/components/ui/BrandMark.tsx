import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface BrandMarkProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * The 6STANZA geometric mark, cropped/isolated from the official logo
 * asset (public/6stanza-mark.png). This is the ONLY approved way to
 * render the brand symbol — do not recreate it in CSS/SVG. Per spec
 * §6, only the mark is used in the UI, not the full "6 STANZA / PVT
 * LTD" lockup.
 */
export function BrandMark({ size = 32, className, priority = false }: BrandMarkProps) {
  return (
    <Image
      src="/6stanza-mark.png"
      alt="6STANZA"
      width={340}
      height={500}
      priority={priority}
      className={cn("h-auto object-contain", className)}
      style={{ width: size, height: "auto" }}
    />
  );
}
