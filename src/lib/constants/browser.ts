export const WINDOW_EVENTS = {
  RESIZE: "resize",
} as const;

export const reloadPage = (): void => {
  window.location.reload();
};
