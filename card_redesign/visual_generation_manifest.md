# Visual Generation Manifest for the 49 MTC Cards

## Purpose

This manifest defines the production and inspection route for the 49 visual assets. The visuals must support the scientific card text; they are not decorative illustrations. Each image should represent the verified or replacement source role recorded in `final_card_text_49.md` and `card_source_crosswalk.md`.

## Production Rule

Generate visuals only after the prompt has been checked against:

- the final source key;
- the card's current short title;
- the evidence type;
- the limitation/caution;
- the non-duplication rule.

No visual should include text, logos, numbers, labels, dashboards with readable content, brand marks or watermarks.

## Style v2 Rule

Use a realistic collectible vehicle-card aesthetic rather than documentary workshop photography:

- one article equals one distinct visual archetype;
- use a clean solid matte background and soft studio shadow;
- make the vehicle, subsystem or test object the hero element;
- avoid repeated vehicle bodies for different articles unless the source explicitly studies the same physical platform;
- distinguish similar topics by archetype, not only by color. For example, a purpose-built solar prototype, a converted auto-rickshaw and a solar-powered cooling module must be visually different objects;
- preserve the upper third for later text overlay;
- keep realism and source alignment above decorative consistency.

## Required Output

Generated visual files:

- `generated_visuals/MTC01_visual_final.png`
- ...
- `generated_visuals/MTC49_visual_final.png`

Inspection records:

- `visual_quality_audit.md`
- one row per card;
- each row must record visual uniqueness, realism, source alignment, absence of text artifacts and decision.

## Batch Plan

Generate and inspect images in small batches. Do not generate all 49 without intermediate review.

| Batch | Cards | Main risk |
|---|---|---|
| 1 | MTC01--MTC05 | Replacement-source alignment for MTC02, MTC03 and MTC05. |
| 2 | MTC06--MTC10 | Technical component realism and avoidance of abstract simulation graphics. |
| 3 | MTC11--MTC15 | Accessibility and public-service scenes without stereotypes or clutter. |
| 4 | MTC16--MTC20 | Steering, ergonomics and powertrain visuals must match replacement sources. |
| 5 | MTC21--MTC25 | Avoid confusing paramotor, human-powered and electric tricycle evidence. |
| 6 | MTC26--MTC30 | Test rigs, traffic-flow and dynamic-analysis scenes must not imply field validation. |
| 7 | MTC31--MTC35 | Rollover-control visuals must distinguish MTC31, MTC33, MTC34 and MTC36. |
| 8 | MTC36--MTC40 | Avoid repeated stability-test and solar-prototype compositions. |
| 9 | MTC41--MTC45 | Accessibility, maintenance and light-EV motor-drive evidence must remain distinct. |
| 10 | MTC46--MTC49 | Legal, business, sizing and HEV energy-management concepts must not collapse into generic EV imagery. |

## Inspection Checklist

For every generated image, mark each item `yes`, `revise` or `reject`:

| Criterion | Meaning |
|---|---|
| Source alignment | The scene matches the verified source role and does not preserve an obsolete source claim. |
| Visual uniqueness | The card is visually distinct from other cards in the same thematic group. |
| Realism | Vehicle geometry, components and setting are plausible. |
| No embedded text | The image contains no readable or pseudo-readable text, labels, logos, numbers or watermark. |
| Clean overlay zone | Upper third has enough visual quiet for card text overlay. |
| Ethical/accessibility language | Accessibility-related scenes are respectful, non-medicalized and non-stereotyped. |
| Scope control | The image does not imply stronger evidence than the source supports. |

## Rejection Rules

Reject and regenerate if:

- the image contains text artifacts;
- a vehicle has impossible geometry;
- the scene duplicates another card's image concept too closely;
- a replacement-source card still depicts the obsolete source concept;
- accessibility cards depict users as spectacle rather than mobility design context;
- safety cards show crashes, damage or sensational danger;
- AI/energy cards become abstract glowing graphics instead of physical components.

## Next Step

Before image generation, create `visual_quality_audit.md` with the 49 inspection rows. Then generate Batch 1 only, inspect it, update the audit, and proceed batch by batch.
