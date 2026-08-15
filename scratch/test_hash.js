function seedUUID(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  const hex = (n) => {
    const h = Math.abs(n).toString(16).padStart(8, '0');
    return h.substring(0, 8);
  };
  const h1 = hex(hash);
  const h2 = hex(hash * 31 + 7);
  const h3 = hex(hash * 37 + 13);
  const h4 = hex(hash * 41 + 17);
  return `${h1}-${h2.substring(0,4)}-4${h3.substring(1,4)}-a${h4.substring(1,4)}-${h2}${h3.substring(0,4)}`;
}

const testSeeds = [
  "fp-match-1234",
  "standing-Copa Futuras Estrellas - Sub-12-Condors-fp",
  "standing-Copa Nacional Hockey en Línea - Sub-14-Condors-fp"
];

for (const seed of testSeeds) {
  console.log(`Seed: "${seed}" => UUID: "${seedUUID(seed)}"`);
}
