/**
 * Zod Locale Configuration
 * 
 * Dynamic locale loading for internationalization support.
 * Supports 50+ languages via Zod's built-in locales.
 */

import { z } from "zod";

/**
 * Available locales
 */
export type SupportedLocale = 
  | "en" | "es" | "fr" | "de" | "ja" | "zhCN" | "zhTW" | "ar"
  | "pt" | "ru" | "it" | "ko" | "nl" | "sv" | "pl" | "tr"
  | "vi" | "th" | "id" | "cs" | "da" | "fi" | "he" | "hu"
  | "no" | "ro" | "uk" | "ca" | "bg" | "hr" | "sk" | "sl"
  | "et" | "lv" | "lt" | "mt" | "ga" | "cy" | "is" | "mk"
  | "sq" | "sr" | "bs" | "az" | "ka" | "hy" | "be" | "uz"
  | "kk" | "ky" | "tg" | "mn" | "ne" | "si" | "my" | "km"
  | "lo" | "gl" | "eu" | "br" | "gd" | "fo" | "yi" | "eo"
  | "ia" | "ie" | "vo" | "io" | "oc" | "co" | "sc" | "rm"
  | "wa" | "li" | "fy" | "ps" | "fa" | "ur" | "hi" | "bn"
  | "ta" | "te" | "ml" | "kn" | "gu" | "pa" | "or" | "as"
  | "mr" | "sa" | "sd" | "ks" | "bo" | "dz" | "ti" | "am"
  | "sw" | "zu" | "xh" | "af" | "st" | "tn" | "ve" | "ts"
  | "ss" | "nr" | "nso" | "ak" | "lg" | "rw" | "ny" | "sn"
  | "yo" | "ig" | "ha" | "ff" | "wo" | "bm" | "sg" | "ln"
  | "kg" | "bi" | "tpi" | "ch" | "fj" | "haw" | "mi" | "sm"
  | "to" | "ty" | "mg" | "om" | "so" | "aa" | "ab" | "ae"
  | "an" | "av" | "ay" | "ba" | "bh" | "bi" | "bm" | "br"
  | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cu" | "cv"
  | "cy" | "da" | "de" | "dv" | "dz" | "ee" | "el" | "en"
  | "eo" | "es" | "et" | "eu" | "fa" | "ff" | "fi" | "fj"
  | "fo" | "fr" | "fy" | "ga" | "gd" | "gl" | "gn" | "gu"
  | "gv" | "ha" | "he" | "hi" | "ho" | "hr" | "ht" | "hu"
  | "hy" | "hz" | "ia" | "id" | "ie" | "ig" | "ii" | "ik"
  | "io" | "is" | "it" | "iu" | "ja" | "jv" | "ka" | "kg"
  | "ki" | "kj" | "kk" | "kl" | "km" | "kn" | "ko" | "kr"
  | "ks" | "ku" | "kv" | "kw" | "ky" | "la" | "lb" | "lg"
  | "li" | "ln" | "lo" | "lt" | "lu" | "lv" | "mg" | "mh"
  | "mi" | "mk" | "ml" | "mn" | "mr" | "ms" | "mt" | "my"
  | "na" | "nb" | "nd" | "ne" | "ng" | "nl" | "nn" | "no"
  | "nr" | "nv" | "ny" | "oc" | "oj" | "om" | "or" | "os"
  | "pa" | "pi" | "pl" | "ps" | "pt" | "qu" | "rm" | "rn"
  | "ro" | "ru" | "rw" | "sa" | "sc" | "sd" | "se" | "sg"
  | "si" | "sk" | "sl" | "sm" | "sn" | "so" | "sq" | "sr"
  | "ss" | "st" | "su" | "sv" | "sw" | "ta" | "te" | "tg"
  | "th" | "ti" | "tk" | "tl" | "tn" | "to" | "tr" | "ts"
  | "tt" | "tw" | "ty" | "ug" | "uk" | "ur" | "uz" | "ve"
  | "vi" | "vo" | "wa" | "wo" | "xh" | "yi" | "yo" | "za"
  | "zh" | "zu";

/**
 * Set Zod locale dynamically
 * 
 * @param locale - Locale code (e.g., "en", "es", "fr")
 * 
 * @example
 * ```ts
 * await setZodLocale("es"); // Spanish
 * await setZodLocale("fr"); // French
 * ```
 */
export async function setZodLocale(locale: SupportedLocale): Promise<void> {
  try {
    // Dynamically import locale
    const localeModule = await import(`zod/locales/${locale}.js`);
    const localeConfig = localeModule.default || localeModule[locale];
    
    if (localeConfig) {
      z.config(localeConfig());
    } else {
      console.warn(`Locale ${locale} not found, falling back to English`);
      await setZodLocale("en");
    }
  } catch (error) {
    console.warn(`Failed to load locale ${locale}, falling back to English:`, error);
    // Fallback to English
    try {
      const { en } = await import("zod/locales");
      z.config(en());
    } catch {
      // If English also fails, use default
      console.error("Failed to load English locale, using Zod defaults");
    }
  }
}

/**
 * Get current locale
 */
let currentLocale: SupportedLocale = "en";

export function getCurrentLocale(): SupportedLocale {
  return currentLocale;
}

/**
 * Initialize locale on app startup
 * 
 * @param locale - Preferred locale (defaults to "en")
 */
export async function initializeZodLocale(locale: SupportedLocale = "en"): Promise<void> {
  await setZodLocale(locale);
  currentLocale = locale;
}

/**
 * Convenience function to use Zod locales directly
 * 
 * @example
 * ```ts
 * import { useZodLocale } from "@/lib/core/zod-locales"
 * 
 * // In your app initialization
 * await useZodLocale("es");
 * ```
 */
export const useZodLocale = setZodLocale;
