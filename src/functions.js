export const screen = {
  notSmall: () => matchMedia("screen and (min-width: 30em)").matches,
  medium: () =>
    matchMedia("screen and (min-width: 30em) and (max-width: 60em)").matches,
  large: () => matchMedia("screen and (min-width: 60em)").matches,
  print: () => matchMedia("print").matches,
};

export const isMobile = () => {
  return !screen.large();
};
