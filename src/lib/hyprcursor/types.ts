export type ResizeAlgorithm = 'bilinear' | 'nearest' | 'none';

export interface FrameObject {
  url: string;
  name: string;
}

export interface MetaFrame {
  size: number;
  file: FrameObject;
  delay: number;
}

export interface HyprCursor {
  resize_algorithm: ResizeAlgorithm;
  hotspot_x: number;
  hotspot_y: number;
  nominal_size: number;
  define_override: string[];
  define_size: MetaFrame[];
}
