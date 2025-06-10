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
          "name": "user",
          "docs": [
            "PDA storing listing metadata. Checked in program logic."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "const",
                "value": [
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "instructions",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
          "name": "user",
          "docs": [
            "PDA storing listing metadata. Checked in program logic."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "const",
                "value": [
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "instructions",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "priceBelowMinimumThreshold",
      "msg": "priceBelowMinimumThreshold"
    },
    {
      "code": 6001,
      "name": "secpInstructionMissing",
      "msg": "secpInstructionMissing"
    },
    {
      "code": 6002,
      "name": "secpInstructionInvalid",
      "msg": "secpInstructionInvalid"
    },
    {
      "code": 6003,
      "name": "invalidSignedMessage",
      "msg": "invalidSignedMessage"
    }
  ],
  "types": [
    {
      "name": "initUserInstructionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "aura",
            "type": "u64"
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
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "aura",
            "type": "u64"
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
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "currentSeason",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "currentSeasonSeed",
      "type": "bytes",
      "value": "[1]"
    },
    {
      "name": "messagePubkey",
      "type": {
        "array": [
          "u8",
          20
        ]
      },
      "value": "[36, 222, 218, 73, 135, 203, 207, 39, 105, 134, 176, 12, 10, 185, 181, 131, 109, 81, 251, 117]"
    },
    {
      "name": "placeholderPubkey",
      "type": "pubkey",
      "value": "1nc1nerator11111111111111111111111111111111"
    },
    {
      "name": "sysvarInstructionsPubkey",
      "type": "pubkey",
      "value": "Sysvar1nstructions1111111111111111111111111"
    },
    {
      "name": "userSeed",
      "type": "bytes",
      "value": "[117, 115, 101, 114]"
    }
  ]
};
