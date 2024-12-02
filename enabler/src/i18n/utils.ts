export const normalizeLanguageCode = (lang: string): string => {
  return lang.split('-')[0];
};
