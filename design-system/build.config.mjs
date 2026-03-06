import StyleDictionary from 'style-dictionary';

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

// ── Build configuration ──
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
console.log('✓ Tokens built successfully');
