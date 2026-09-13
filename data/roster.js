export const ROSTER = [
    {
        id: 'trump', name: 'Donald Trump', shortName: 'TRUMP', archetype: 'Heavyweight Showman',
        description: 'A theatrical power fighter built around blunt pressure, heavy hooks and swagger-heavy throws.',
        styles: ['Streetfighting', 'Wrestling'], stats: { upperBody: 88, lowerBody: 61, speed: 54, toughness: 82, health: 86, charisma: 98 },
        palette: { skin: 0xd0a07e, hair: 0xd6ad68, primary: 0x11151e, secondary: 0xe7e7e5, accent: 0xa9151d }, scale: [1.08, 1.02, 1.05], mass: 1.18, aggression: .72, wardrobe: 'dark tailored suit, white shirt, red tie',
        modelNotes: 'Broad torso, swept blond hair silhouette, tailored suit proportions and theatrical hand poses.',
        finishers: [
            { id: 'boardroom-bomb', name: 'Boardroom Bomb', power: 44, duration: 2.65, flavour: 'A showman feint into a crushing lift-and-slam sequence.' },
            { id: 'final-word', name: 'Final Word', power: 47, duration: 2.5, flavour: 'Two heavy hooks, a turn, then a dramatic finishing lariat.' }
        ]
    },
    {
        id: 'netanyahu', name: 'Benjamin Netanyahu', shortName: 'NETANYAHU', archetype: 'Controlled Technician',
        description: 'Compact, deliberate pressure with sharp entries, disciplined counters and efficient combinations.',
        styles: ['Martial Arts', 'Streetfighting'], stats: { upperBody: 72, lowerBody: 69, speed: 76, toughness: 77, health: 76, charisma: 75 },
        palette: { skin: 0xc99472, hair: 0xb9b9b7, primary: 0x161a22, secondary: 0xe7e5df, accent: 0x3c5b80 }, scale: [.97, 1, .98], mass: .96, aggression: .68, wardrobe: 'dark suit, pale shirt, restrained blue accent',
        modelNotes: 'Compact stance, silver hair silhouette and clipped technical movement.',
        finishers: [
            { id: 'pressure-point', name: 'Pressure Point', power: 43, duration: 2.35, flavour: 'A precise counter chain ending in a hard rotational takedown.' },
            { id: 'closed-line', name: 'Closed Line', power: 45, duration: 2.55, flavour: 'Short body shots into a controlled trip and downward strike.' }
        ]
    },
    {
        id: 'kirk', name: 'Charlie Kirk', shortName: 'KIRK', archetype: 'High-Tempo Striker',
        description: 'Fast, animated and relentless, using quick kicks, angle changes and sudden burst pressure.',
        styles: ['Kickboxing', 'Martial Arts'], stats: { upperBody: 65, lowerBody: 84, speed: 89, toughness: 64, health: 70, charisma: 84 },
        palette: { skin: 0xd0a282, hair: 0x33271f, primary: 0x1d222a, secondary: 0xe9e6df, accent: 0x9c1820 }, scale: [1.02, 1.04, .96], mass: .92, aggression: .86, wardrobe: 'modern dark casual jacket and neutral base layers',
        modelNotes: 'Tall youthful silhouette, dark hair and restless shoulder movement.',
        finishers: [
            { id: 'rapid-rebuttal', name: 'Rapid Rebuttal', power: 42, duration: 2.2, flavour: 'A fast kick-punch-kick sequence that never gives back space.' },
            { id: 'hard-pivot', name: 'Hard Pivot', power: 44, duration: 2.4, flavour: 'A sudden sidestep into a spinning heel and driving knee.' }
        ]
    },
    {
        id: 'floyd', name: 'George Floyd', shortName: 'FLOYD', archetype: 'Grounded Powerhouse',
        description: 'A physically imposing pressure fighter focused on toughness, clinch control and grounded power.',
        styles: ['Wrestling', 'Streetfighting'], stats: { upperBody: 90, lowerBody: 70, speed: 59, toughness: 88, health: 91, charisma: 72 },
        palette: { skin: 0x4d2f24, hair: 0x171411, primary: 0x16171a, secondary: 0x4d535b, accent: 0x8e6c4a }, scale: [1.12, 1.08, 1.08], mass: 1.28, aggression: .7, wardrobe: 'dark athletic streetwear',
        modelNotes: 'Large frame, grounded stance and broad shoulders; portrayal avoids any reference to real-world death.',
        finishers: [
            { id: 'ground-force', name: 'Ground Force', power: 46, duration: 2.55, flavour: 'A hard clinch turn into a powerful clean mat slam.' },
            { id: 'pressure-line', name: 'Pressure Line', power: 45, duration: 2.6, flavour: 'Body pressure, short hooks and a forceful shoulder throw.' }
        ]
    },
    {
        id: 'wojak', name: 'Wojak', shortName: 'WOJAK', archetype: 'Unstable Counter-Fighter',
        description: 'Anxious footwork hides unpredictable bursts, awkward counters and sudden emotional aggression.',
        styles: ['Streetfighting', 'Martial Arts'], stats: { upperBody: 61, lowerBody: 67, speed: 78, toughness: 58, health: 66, charisma: 83 },
        palette: { skin: 0xe3ded5, hair: 0xd7d2c9, primary: 0x6a6d72, secondary: 0xd6d6d3, accent: 0x26272a }, scale: [.95, 1, .92], mass: .86, aggression: .91, wardrobe: 'plain grey top and dark trousers',
        modelNotes: 'Pale rounded line-face identity with minimal features and intentionally awkward posture.',
        finishers: [
            { id: 'spiral', name: 'The Spiral', power: 42, duration: 2.6, flavour: 'A nervous fake-out snaps into a frantic but clean strike chain.' },
            { id: 'its-over', name: 'It Is So Over', power: 44, duration: 2.7, flavour: 'A wobbling retreat reverses into a sudden tackle and strike finish.' }
        ]
    },
    {
        id: 'gigachad', name: 'Gigachad', shortName: 'GIGACHAD', archetype: 'Apex Power Hybrid',
        description: 'Calm domination with elite throws, crushing kicks and effortless pressure.',
        styles: ['Wrestling', 'Kickboxing', 'Streetfighting'], stats: { upperBody: 99, lowerBody: 94, speed: 78, toughness: 96, health: 97, charisma: 99 },
        palette: { skin: 0x8e6956, hair: 0x171514, primary: 0x111214, secondary: 0x2d2e31, accent: 0xc6c1b8 }, scale: [1.18, 1.13, 1.13], mass: 1.34, aggression: .62, wardrobe: 'minimal dark athletic gear',
        modelNotes: 'Extreme V-taper, square jaw silhouette, heavy neck and measured movement.',
        finishers: [
            { id: 'aura-check', name: 'Aura Check', power: 51, duration: 2.45, flavour: 'A single calm counter opens a ruthless lift and power slam.' },
            { id: 'absolute-unit', name: 'Absolute Unit', power: 53, duration: 2.8, flavour: 'A crushing body kick into a high-amplitude throw and pose.' }
        ]
    },
    {
        id: 'agarthan', name: 'Agarthan Gatekeeper', shortName: 'GATEKEEPER', archetype: 'Subterranean Duelist',
        description: 'Elegant, uncanny movement with long-range kicks and strange, graceful angle changes.',
        styles: ['Martial Arts', 'Kickboxing'], stats: { upperBody: 70, lowerBody: 91, speed: 95, toughness: 72, health: 74, charisma: 96 },
        palette: { skin: 0xcbd3d5, hair: 0xe7edf1, primary: 0x15171b, secondary: 0x817666, accent: 0x89e4df }, scale: [.96, 1.14, .9], mass: .84, aggression: .64, wardrobe: 'black-gold ceremonial combat layers, no extremist symbology',
        modelNotes: 'Tall pale-silver body, long white hair shapes, luminous eyes and elegant proportions.',
        finishers: [
            { id: 'hollow-axis', name: 'Hollow Axis', power: 46, duration: 2.75, flavour: 'An uncanny sidestep sequence into a rising kick and falling palm.' },
            { id: 'underworld-gate', name: 'Underworld Gate', power: 48, duration: 2.95, flavour: 'A graceful sweep, aerial rotation and precise final heel strike.' }
        ]
    },
    {
        id: 'greek', name: 'The Greek', shortName: 'THE GREEK', archetype: 'Living Monument',
        description: 'A classical marble fighter animated into crushing grapples, monumental posture and stone-heavy blows.',
        styles: ['Wrestling', 'Streetfighting'], stats: { upperBody: 97, lowerBody: 74, speed: 48, toughness: 100, health: 99, charisma: 92 },
        palette: { skin: 0xd7d2c8, hair: 0xc9c4ba, primary: 0xd1ccc2, secondary: 0xa8a39b, accent: 0xe9e4d8 }, scale: [1.14, 1.13, 1.1], mass: 1.45, aggression: .56, wardrobe: 'living classical marble with draped stone cloth and surface cracks',
        modelNotes: 'Marble material, sculpted curls, chipped edges and dust bursts on heavy impacts.',
        finishers: [
            { id: 'marble-collapse', name: 'Marble Collapse', power: 53, duration: 2.85, flavour: 'A monumental bear hug transitions into a crushing overhead slam.' },
            { id: 'colossus', name: 'Colossus', power: 55, duration: 3.0, flavour: 'A slow parry leads to two stone-heavy blows and an earth-shaking throw.' }
        ]
    }
];
export const getFighterDef = (id) => ROSTER.find(f => f.id === id) ?? ROSTER[0];
