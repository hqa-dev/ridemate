import StyleDictionary from 'style-dictionary';
import { readFileSync } from 'fs';

// ── Custom format: CSS custom properties ──
StyleDictionary.registerFormat({
  name: 'css/limo-variables',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(token => {
      const name = token.path.join('-');
      const val = token.$value ?? token.value;
      const output = typeof val === 'object'
        ? JSON.stringify(val)
        : val;
      return `  --${name}: ${output};`;
    });
    return `/* لیمۆ Design Tokens — Auto-generated, do not edit */\n:root {\n${lines.join('\n')}\n}\n`;
  },
});

// ── Custom format: TypeScript token objects ──
StyleDictionary.registerFormat({
  name: 'ts/limo-tokens',
  format: ({ dictionary }) => {
    const tokens = {};
    dictionary.allTokens.forEach(token => {
      let obj = tokens;
      for (let i = 0; i < token.path.length - 1; i++) {
        const key = token.path[i];
        if (!obj[key]) obj[key] = {};
        obj = obj[key];
      }
      obj[token.path[token.path.length - 1]] = token.$value ?? token.value;
    });
    return `// لیمۆ Design Tokens — Auto-generated, do not edit\nexport const tokens = ${JSON.stringify(tokens, null, 2)} as const;\nexport type Tokens = typeof tokens;\n`;
  },
});

// ── Build default tokens ──
const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  usesDtcg: true,
  platforms: {
    web: {
      transformGroup: 'css',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/limo-variables',
        },
      ],
    },
    mobile: {
      transformGroup: 'js',
      buildPath: 'dist/mobile/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'ts/limo-tokens',
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
console.log('✓ Default tokens built');

// ── Build theme override CSS files ──
// Reads each theme stub, extracts the semantic overrides,
// and flattens them into CSS custom properties under a data-theme selector.

function flattenOverrides(obj, prefix = '') {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$') || key.startsWith('_')) continue;
    const path = prefix ? `${prefix}-${key}` : key;
    if (typeof val === 'object' && val !== null && !('$value' in val)) {
      Object.assign(result, flattenOverrides(val, path));
    } else if (typeof val === 'object' && '$value' in val) {
      result[path] = val.$value;
    }
  }
  return result;
}

// Map theme semantic paths to the CSS variable names from the default build.
// The theme stubs use semantic.brand.primary etc, which map to actual token paths.
const semanticToVar = {
  'brand-primary': 'color-brand-primary',
  'brand-fill': 'color-brand-fill',
  'brand-glow': 'color-brand-glow',
  'nav-activePill': 'color-nav-activePill',
  'nav-glow': 'color-nav-glow',
  'viewport-shadow': 'shadow-viewport',
  'viewport-radius': 'radius-6xl',
};

const themes = [
  { name: 'newroz', file: 'themes/newroz.stub.json' },
  { name: 'christmas', file: 'themes/christmas.stub.json' },
];

for (const theme of themes) {
  const raw = JSON.parse(readFileSync(theme.file, 'utf8'));
  const overrides = flattenOverrides(raw.semantic || {});
  const lines = Object.entries(overrides).map(([semPath, value]) => {
    const cssVar = semanticToVar[semPath] || semPath;
    return `  --${cssVar}: ${value};`;
  });
  const css = `/* لیمۆ Theme Override: ${theme.name} — Auto-generated, do not edit */\n:root[data-theme="${theme.name}"] {\n${lines.join('\n')}\n}\n`;
  const { writeFileSync } = await import('fs');
  writeFileSync(`dist/web/theme-${theme.name}.css`, css);
  console.log(`✓ theme-${theme.name}.css built`);
}

console.log('✓ All builds complete');
