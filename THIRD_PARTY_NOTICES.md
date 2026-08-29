# Third-party notices

Palworld Nyu Tools is distributed under the GNU General Public License v3.0.

## palworld-save-toolkit

Selected browser save-reading modules are adapted from
[`zlmitchell/palworld-save-toolkit`](https://github.com/zlmitchell/palworld-save-toolkit),
licensed under GPL-3.0. The vendored files are kept in
`vendor/palworld-save-toolkit/` and retain their upstream notices.

## ooz-wasm

Modern Palworld `PlM` saves use Oodle Kraken compression. Browser-side
decompression is provided by [`SnosMe/ooz-wasm`](https://github.com/SnosMe/ooz-wasm),
version 2.0.0, licensed under GPL-3.0-or-later. Its license is included at
`vendor/ooz-wasm/LICENSE`.

## PalCalc data

The complete passive-skill catalogue and breeding references are derived from
[`tylercamp/palcalc`](https://github.com/tylercamp/palcalc), licensed under MIT.
French localization data originates from Palworld game data as distributed by
[`oMaN-Rod/palworld-save-pal`](https://github.com/oMaN-Rod/palworld-save-pal),
licensed under GPL-3.0-only. The local elemental egg icons are also sourced
from that project’s extracted Palworld asset set.

Palworld names, data and imagery belong to Pocketpair, Inc. This community
project is not affiliated with or endorsed by Pocketpair.

## Palworld Wiki interface icons

The embedded rank-2 and negative passive-skill indicators are the 24 × 24
Palworld interface icons distributed by
[`palworld.wiki.gg`](https://palworld.wiki.gg/wiki/Category:Passive_Skill_template_images)
under CC BY-SA 4.0. They complement the same local icon family already used by
the passive-skills page.

## Breeding planner references

Palbreed / Palpath was consulted as a public conceptual and behavioural
reference for practical breeding routes. Its current public repository,
[`EthanMarkham/palbreed`](https://github.com/EthanMarkham/palbreed), is
unlicensed (`UNLICENSED`): no Palbreed source code was copied, adapted or
integrated. The Nyu Tools implementation is independent.

The public documentation from
[`tylercamp/palcalc`](https://github.com/tylercamp/palcalc), licensed under MIT,
was consulted separately for breeding-data context. Neither project is a
runtime dependency and no source package is vendored.
