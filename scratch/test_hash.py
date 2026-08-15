def seed_uuid(seed):
    # Generates a deterministic UUID v4-like from a string seed matching JS
    # Javascript code:
    # let hash = 0;
    # for (let i = 0; i < seed.length; i++) {
    #   const ch = seed.charCodeAt(i);
    #   hash = ((hash << 5) - hash) + ch;
    #   hash = hash & hash;
    # }
    h_val = 0
    for ch in seed:
        c = ord(ch)
        h_val = ((h_val << 5) - h_val) + c
        # Force to 32-bit signed integer: hash = hash & hash
        h_val = (h_val & 0xFFFFFFFF)
        if h_val >= 0x80000000:
            h_val -= 0x100000000

    def get_hex(n):
        # Math.abs(n).toString(16).padStart(8, '0').substring(0, 8)
        val = abs(int(n))
        h_str = hex(val)[2:]  # Remove '0x'
        h_str = h_str.zfill(8)
        return h_str[:8]

    h1 = get_hex(h_val)
    h2 = get_hex(h_val * 31 + 7)
    h3 = get_hex(h_val * 37 + 13)
    h4 = get_hex(h_val * 41 + 17)

    # return `${h1}-${h2.substring(0,4)}-4${h3.substring(1,4)}-a${h4.substring(1,4)}-${h2}${h3.substring(0,4)}`;
    return f"{h1}-{h2[0:4]}-4{h3[1:4]}-a{h4[1:4]}-{h2}{h3[0:4]}"

test_seeds = [
    "fp-match-1234",
    "standing-Copa Futuras Estrellas - Sub-12-Condors-fp",
    "standing-Copa Nacional Hockey en Línea - Sub-14-Condors-fp"
]

expected = [
    "0191ffd3-30ad-4a19-a061-30adfa863a19",
    "4952b852-8e10-498f-abe3-8e10451fa98f",
    "31e0bf27-60a3-4357-afcf-60a3725c7357"
]

for seed, exp in zip(test_seeds, expected):
    res = seed_uuid(seed)
    match = (res == exp)
    print(f"Seed: {seed}")
    print(f"  Result:   {res}")
    print(f"  Expected: {exp}")
    print(f"  Match:    {match}")
