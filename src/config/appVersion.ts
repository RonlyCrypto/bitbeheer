/**
 * App Version Configuration
 * 
 * Gebruik deze configuratie om te switchen tussen de complexe en eenvoudige versie
 * 
 * Opties:
 * - 'complex': Volledige versie met alle features
 * - 'simple': Vereenvoudigde versie met alleen kernfunctionaliteiten
 */

export type AppVersion = 'complex' | 'simple';

// Wijzig deze waarde om te switchen tussen versies
export const APP_VERSION: AppVersion = 'simple';

// Helper functie om te checken welke versie actief is
export const isComplexVersion = () => APP_VERSION === 'complex';
export const isSimpleVersion = () => APP_VERSION === 'simple';

