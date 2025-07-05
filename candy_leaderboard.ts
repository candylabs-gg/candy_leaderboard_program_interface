/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/candy_leaderboard.json`.
 */
export type CandyLeaderboard = {
  "address": "GgD5PpVu5Gmns4ByFTudbjjxGxtEt8zLWmgsqdJCq222",
  "metadata": {
    "name": "candyLeaderboard",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deleteUser",
      "discriminator": [
        186,
        85,
        17,
        249,
        219,
        231,
        98,
        251
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "initUser",
      "discriminator": [
        14,
        51,
        68,
        159,
        237,
        78,
        158,
        102
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "cosigner",
          "signer": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "referrer"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "instructionArgs",
          "type": {
            "defined": {
              "name": "initUserInstructionArgs"
            }
          }
        }
      ]
    },
    {
      "name": "updateUser",
      "discriminator": [
        9,
        2,
        160,
        169,
        118,
        12,
        207,
        84
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "cosigner",
          "signer": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "instructionArgs",
          "type": {
            "defined": {
              "name": "updateUserInstructionArgs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  "events": [
    {
      "name": "userDelete",
      "discriminator": [
        168,
        29,
        18,
        253,
        29,
        112,
        44,
        89
      ]
    },
    {
      "name": "userInit",
      "discriminator": [
        72,
        49,
        218,
        52,
        95,
        199,
        145,
        48
      ]
    },
    {
      "name": "userUpdate",
      "discriminator": [
        186,
        172,
        62,
        170,
        233,
        110,
        205,
        156
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidReferrer",
      "msg": "invalidReferrer"
    }
  ],
  "types": [
    {
      "name": "initUserInstructionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "level",
            "type": "u8"
          },
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "aura",
            "type": "u64"
          },
          {
            "name": "achievements",
            "type": {
              "array": [
                "u128",
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "updateUserInstructionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "level",
            "type": "u8"
          },
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "aura",
            "type": "u64"
          },
          {
            "name": "achievements",
            "type": {
              "array": [
                "u128",
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "season",
            "type": "u8"
          },
          {
            "name": "level",
            "type": "u8"
          },
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "aura",
            "type": "u64"
          },
          {
            "name": "auraSpent",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "achievements",
            "type": {
              "array": [
                "u128",
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "userDelete",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "season",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "userInit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "season",
            "type": "u8"
          },
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "aura",
            "type": "u64"
          },
          {
            "name": "auraSpent",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "achievements",
            "type": {
              "array": [
                "u128",
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "userUpdate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "season",
            "type": "u8"
          },
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "aura",
            "type": "u64"
          },
          {
            "name": "auraSpent",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "achievements",
            "type": {
              "array": [
                "u128",
                2
              ]
            }
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "currentSeason",
      "type": "u8",
      "value": "0"
    },
    {
      "name": "currentSeasonSeed",
      "type": "bytes",
      "value": "[0]"
    },
    {
      "name": "placeholderPubkey",
      "type": "pubkey",
      "value": "1nc1nerator11111111111111111111111111111111"
    },
    {
      "name": "programId",
      "type": "pubkey",
      "value": "GgD5PpVu5Gmns4ByFTudbjjxGxtEt8zLWmgsqdJCq222"
    },
    {
      "name": "userSeed",
      "type": "bytes",
      "value": "[117, 115, 101, 114]"
    }
  ]
};
