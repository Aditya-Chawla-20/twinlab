import {
  decodeMaskToRaster,
  type SegmentationMaskRecord,
} from "@meta-sam/parser";

// Geometric foreground centroid, not center of mass. Coordinates use pixel centers.
export function maskCentroid(
  record: SegmentationMaskRecord,
): { x: number; y: number } | null {
  const { mask, bounds } = record;
  if (mask.width * mask.height > 4_000_000)
    throw new Error("Mask exceeds the four-million-pixel landmark limit.");
  const raster = decodeMaskToRaster(mask);
  let count = 0,
    sx = 0,
    sy = 0;
  for (let i = 0; i < raster.length; i++)
    if (raster[i]) {
      count++;
      sx += (i % mask.width) + 0.5;
      sy += Math.floor(i / mask.width) + 0.5;
    }
  if (!count) return null;
  return {
    x: bounds.left + ((sx / count) * (bounds.right - bounds.left)) / mask.width,
    y: bounds.top + ((sy / count) * (bounds.bottom - bounds.top)) / mask.height,
  };
}
