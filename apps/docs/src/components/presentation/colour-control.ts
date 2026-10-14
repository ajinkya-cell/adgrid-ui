// Shared by the props panels: the colour chips offered beside any colour prop, and whether that
// prop can take opacity. Many components read colours as 6-digit hex, so opacity is only offered
// where the prop's own default is already translucent (8-digit hex).
export const PROP_COLOUR_PRESETS = [
  "#FFFFFF", "#E7E5DF", "#A3A3A3", "#525252", "#171717",
  "#4F7CFF", "#A855F7", "#E11D48", "#F2C04A", "#3FA796",
];

export const propTakesAlpha = (defaultValue: unknown) =>
  typeof defaultValue === "string" && /^#[0-9a-f]{8}$/i.test(defaultValue);
