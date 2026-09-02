/**
 * Device and resolution presets. Tessera renders every wallpaper to the exact
 * pixel dimensions of the target screen, so exports never need cropping.
 */

export type DeviceKind = "desktop" | "mobile" | "tablet";

export type Resolution = {
  id: string;
  label: string;
  width: number;
  height: number;
  note?: string;
};

export type DeviceGroup = {
  kind: DeviceKind;
  label: string;
  blurb: string;
  resolutions: Resolution[];
};

export const DEVICE_GROUPS: DeviceGroup[] = [
  {
    kind: "desktop",
    label: "Desktop",
    blurb: "Monitors, laptops and ultrawides",
    resolutions: [
      { id: "fhd", label: "1920 by 1080", width: 1920, height: 1080, note: "Full HD 16:9" },
      { id: "qhd", label: "2560 by 1440", width: 2560, height: 1440, note: "QHD 16:9" },
      { id: "uhd", label: "3840 by 2160", width: 3840, height: 2160, note: "4K UHD" },
      { id: "wqhd-uw", label: "3440 by 1440", width: 3440, height: 1440, note: "Ultrawide 21:9" },
      { id: "wuxga", label: "1920 by 1200", width: 1920, height: 1200, note: "16:10" },
      { id: "5k", label: "5120 by 2880", width: 5120, height: 2880, note: "5K Retina" },
    ],
  },
  {
    kind: "mobile",
    label: "Mobile",
    blurb: "Phones, tall and edge to edge",
    resolutions: [
      { id: "iphone-pro", label: "1290 by 2796", width: 1290, height: 2796, note: "iPhone Pro Max" },
      { id: "iphone", label: "1179 by 2556", width: 1179, height: 2556, note: "iPhone" },
      { id: "pixel", label: "1080 by 2400", width: 1080, height: 2400, note: "Android 20:9" },
      { id: "galaxy", label: "1440 by 3120", width: 1440, height: 3120, note: "Galaxy QHD+" },
      { id: "compact", label: "1080 by 1920", width: 1080, height: 1920, note: "Full HD 9:16" },
    ],
  },
  {
    kind: "tablet",
    label: "Tablet",
    blurb: "Slates in portrait",
    resolutions: [
      { id: "ipad-pro", label: "2048 by 2732", width: 2048, height: 2732, note: "iPad Pro 12.9" },
      { id: "ipad-air", label: "1640 by 2360", width: 1640, height: 2360, note: "iPad Air" },
      { id: "tab-s", label: "1752 by 2800", width: 1752, height: 2800, note: "Galaxy Tab S" },
    ],
  },
];

export const ALL_RESOLUTIONS: Resolution[] = DEVICE_GROUPS.flatMap((group) => group.resolutions);

export function findResolution(id: string): Resolution | undefined {
  return ALL_RESOLUTIONS.find((resolution) => resolution.id === id);
}

export function deviceKindForResolution(id: string): DeviceKind {
  const group = DEVICE_GROUPS.find((g) => g.resolutions.some((r) => r.id === id));
  return group?.kind ?? "desktop";
}

export function aspectRatio(width: number, height: number): number {
  return width / height;
}

export function orientation(width: number, height: number): "landscape" | "portrait" | "square" {
  if (Math.abs(width - height) < 1) return "square";
  return width > height ? "landscape" : "portrait";
}

export const MAX_EXPORT_DIMENSION = 8192;

export function clampDimension(value: number): number {
  return Math.max(64, Math.min(MAX_EXPORT_DIMENSION, Math.round(value)));
}
