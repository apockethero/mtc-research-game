# Batch 02 Visual Prompts: MTC06-MTC10

## Purpose

This batch prepares the second five card visuals for controlled image generation. Each prompt is source-aligned and includes rejection criteria to prevent visually attractive but scientifically misleading images.

Global constraints for all images:

- Square 1:1 academic knowledge-card visual.
- Photorealistic editorial style.
- One or two main visual elements only.
- No text, labels, numbers, logos, brand marks or watermarks inside the image.
- Clean upper third preserved for later card layout.
- Realistic materials, scale and engineering context.
- No decorative icons or infographic overlays.

## MTC06: Static Frame Loading

Source key: `Syahid2024_StaticLoadingTricycleFrame`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show an electric tricycle frame under static-load evaluation in a clean engineering lab, with the bare frame supported on fixtures and simple calibrated weights or load pads placed at realistic structural points. The image should communicate early structural evaluation before road testing. Use neutral laboratory lighting, realistic metal frame materials and a restrained technical palette. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, logos, arrows, force diagrams, watermarks or brand marks.
```

Accept only if:

- The frame and static-load setup are visible.
- The image communicates structural evaluation, not crash testing.
- The visual remains realistic and uncluttered.

Reject if:

- It shows a road accident, broken vehicle or dramatic failure.
- It uses colored stress maps, labels or simulation text.
- It hides the tricycle frame behind people or equipment.

## MTC07: Solar-Supported Motor Cooling

Source key: `Babu2023_HybridCoolingSolarTricycle`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show a hybrid electric tricycle prototype with a small roof-mounted photovoltaic panel and a visible compact cooling system near the electric motor compartment, such as tubing, fan housing or heat-exchanger components. The scene should communicate thermal management supported by solar energy in a practical electric tricycle. Use clean workshop lighting, realistic components and restrained technical colors. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, logos, efficiency graphics, watermarks or brand marks.
```

Accept only if:

- The solar panel and cooling-related component are both visible.
- It remains a practical electric tricycle, not a solar race vehicle.
- It avoids unsupported efficiency claims.

Reject if:

- It shows only a solar panel with no cooling concept.
- It contains digital performance charts or written labels.
- It creates an unrealistic oversized cooling system.

## MTC08: Flywheel Energy Recovery

Source key: `Atienza2020_FlywheelKERSMotorizedTricycles`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show a mechanical flywheel energy recovery unit connected to a motorized tricycle drivetrain in a clean workshop close-up. The flywheel, belt or coupling, axle region and part of the tricycle chassis should be visible. The image should communicate component-level energy recovery, not a finished commercial system. Use realistic metal textures, workshop lighting and a restrained engineering palette. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, logos, arrows, energy icons, watermarks or brand marks.
```

Accept only if:

- The flywheel and drivetrain connection are visually clear.
- The image stays at prototype/component level.
- The mechanical integration looks plausible.

Reject if:

- It becomes an abstract energy graphic.
- It shows a generic car flywheel without tricycle context.
- It includes annotations or labels.

## MTC09: E-Trike Power Assistance

Source key: `DeSaRosa2021_ETrikePowerAssistance`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show one older adult riding an assisted electric tricycle on a safe outdoor path, with the posture, pedals and stable three-wheel configuration visible. The scene should communicate human-centered pedal assistance and reduced effort without medical stereotypes. Use natural daylight, calm surroundings and realistic mobility design. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, logos, medical warning symbols, watermarks or brand marks.
```

Accept only if:

- The rider, pedals and assisted e-trike are clearly visible.
- The portrayal is respectful and non-stigmatizing.
- The image stays tied to assisted mobility rather than general leisure cycling.

Reject if:

- It shows a bicycle, scooter or wheelchair instead of an e-trike.
- It exaggerates disability or uses hospital imagery.
- It contains text or brand marks.

## MTC10: Front Single-Sided Swingarm

Source key: `Spanoudakis2020_FrontSingleSidedSwingarm`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show the front single-sided swingarm assembly of an electric three-wheel motorcycle or tricycle prototype in a realistic CAD-to-workshop setting, with the front wheel, arm structure and braking load path visually suggested through physical parts only. The focus should be strength, weight and front-end mechanical design. Use clean workshop lighting, realistic metal components and a neutral technical background. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, logos, arrows, CAD annotations, watermarks or brand marks.
```

Accept only if:

- The front single-sided swingarm is the central visual element.
- The image includes enough vehicle context to avoid generic motorcycle ambiguity.
- It stays realistic and mechanically credible.

Reject if:

- It shows a conventional two-sided fork only.
- It uses CAD labels, stress colors or written annotations.
- It depicts an unrelated bicycle suspension.
