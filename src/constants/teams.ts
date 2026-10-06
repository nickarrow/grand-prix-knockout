// F1 team colours for every constructorId in the bundled data (2020-2026).
//
// The 16 ids come from data/2020.json through data/2026.json; see the f1-rules
// skill for the per-season list and the renames behind the id changes
// (racing_point -> aston_martin, renault -> alpine, alphatauri -> rb,
// alfa -> sauber, sauber -> audi). Each colour is a recognisable era livery
// colour, chosen as a mid-tone accent so the thin team bar in DriverRow and the
// card border in PhaseSection stay visible on both the light-mode (near-white)
// and dark-mode (near-black) row backgrounds. Pure white and pure black are
// avoided for that reason: a greyscale livery (Haas, Cadillac) uses a metallic
// grey, and a yellow/black livery (Renault) uses the saturated yellow.
//
// Sources, all read 2026-10-06:
//   - teamcolorcodes.com and sportcolorcodes.com per-team pages (Alfa Romeo,
//     AlphaTauri, Renault, Racing Point).
//   - F1 constructor colour collection, 2019-2026, github.com/Mahshadn/
//     f1-constructors-colour-codes (used for Alfa burgundy #981E32, AlphaTauri
//     navy #1E5BC6, Audi red #F50537/titanium #C8CED4).
//   - Cadillac's black-to-white gradient livery, revealed Feb 2026
//     (formula1.com, motorsport.com), rendered here as a neutral metallic grey.
// Content was rephrased for compliance with licensing restrictions.

export interface TeamColors {
  primary: string;
  secondary: string;
}

export const TEAM_COLORS: Record<string, TeamColors> = {
  red_bull: {
    primary: '#3671C6',
    secondary: '#1B3A6D',
  },
  mclaren: {
    primary: '#FF8000',
    secondary: '#47352E',
  },
  ferrari: {
    primary: '#E8002D',
    secondary: '#FFEB00',
  },
  mercedes: {
    primary: '#27F4D2',
    secondary: '#00A19C',
  },
  aston_martin: {
    primary: '#229971',
    secondary: '#04352D',
  },
  alpine: {
    primary: '#FF87BC',
    secondary: '#0093CC',
  },
  williams: {
    primary: '#64C4FF',
    secondary: '#00295D',
  },
  rb: {
    primary: '#6692FF',
    secondary: '#1B3A6D',
  },
  sauber: {
    primary: '#52E252',
    secondary: '#1E1E1E',
  },
  haas: {
    primary: '#B6BABD',
    secondary: '#E10600',
  },
  // Racing Point 2020: the BWT pink that defined the team (deep pink primary,
  // darker pink accent). Source: sportcolorcodes.com Racing Point page.
  racing_point: {
    primary: '#F363B9',
    secondary: '#EC0374',
  },
  // AlphaTauri 2020-2023: navy blue and white. Source: Mahshadn F1 colours (2023).
  alphatauri: {
    primary: '#1E5BC6',
    secondary: '#FFFFFF',
  },
  // Renault 2020: the yellow-and-black works livery. The saturated yellow stays
  // visible as a thin bar on a light row. Source: Renault Group brand yellow
  // #EFDF00 (brand.renault.com via pickcoloronline.com), nudged brighter.
  renault: {
    primary: '#FFD800',
    secondary: '#000000',
  },
  // Alfa Romeo: the burgundy/white identity (2022-2023 base, carried from the
  // 2020-2021 red-and-white). Source: Mahshadn F1 colours (2023) burgundy #981E32.
  alfa: {
    primary: '#981E32',
    secondary: '#FFFFFF',
  },
  // Audi 2026: titanium with a red accent. The red reads on both themes where
  // the titanium would wash out on a light row. Source: Mahshadn F1 colours (2026).
  audi: {
    primary: '#F50537',
    secondary: '#C8CED4',
  },
  // Cadillac 2026: a black-to-white gradient livery, rendered here as a neutral
  // metallic grey so neither end of the gradient disappears on either theme.
  // Source: Cadillac 2026 livery reveal (formula1.com, motorsport.com).
  cadillac: {
    primary: '#8E8E90',
    secondary: '#1E1E1E',
  },
} as const;

// Get team color with fallback
export function getTeamColor(constructorId: string): TeamColors {
  return TEAM_COLORS[constructorId] ?? { primary: '#666666', secondary: '#333333' };
}
