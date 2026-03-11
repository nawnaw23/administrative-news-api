export const ALLOWED_DISTRICTS: string[] = [];

export const ALLOWED_DISTRICT_SET = new Set<string>();

export const normalizeDistrictName = (value?: string | null): string => {
  return value?.trim() || "";
};
