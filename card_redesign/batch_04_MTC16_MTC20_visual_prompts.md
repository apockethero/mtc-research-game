# Batch 04 Visual Prompts: MTC16-MTC20

## Purpose

This batch prepares visuals for ergonomics, adaptive mobility, service quality, three-wheeler EV powertrain sizing and Ackerman steering. The prompts separate human-centered evidence from mechanical-design evidence and avoid adding unsupported mechanisms.

Global constraints for all images:

- Square 1:1 academic knowledge-card visual.
- Photorealistic editorial style.
- One or two main visual elements only.
- No text, labels, numbers, logos, brand marks or watermarks inside the image.
- Clean upper third preserved for later card layout.
- Respectful representation of users and accessibility.
- Realistic workshop, transport or test contexts.

## MTC16: E-Traysikel Ergonomics

Source key: `SanJuan2020_ErgonomicETraysikel`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show an ergonomic inspection scene of an electric tricycle cabin, with the seat, handlebar, passenger area and posture-related cabin geometry visible. The image should communicate human-factors evaluation of vehicle fit without using measurement overlays. Use a clean workshop or transport lab setting, realistic materials and professional neutral lighting. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, measuring graphics, logos, watermarks or brand marks.
```

Accept only if:

- Seat, control area and passenger space are visible.
- The scene reads as ergonomic inspection.
- It avoids written measurements or anthropometric labels.

Reject if:

- It shows only a generic vehicle exterior.
- It includes measurement text, dimension lines or infographics.
- It uses unrealistic cabin proportions.

## MTC17: Adaptive Tricycle Design

Source key: `Quazi2025_AdaptiveTricycleDesign`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show an adaptive tricycle prototype in a clean engineering workspace, with a stable frame, accessible steering interface and simple propulsion or braking mechanism visible. The scene should communicate user-specific mobility design as an engineering process, not as medical equipment. Use realistic metal parts, respectful visual framing and a restrained technical palette. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, hospital symbols, logos, watermarks or brand marks.
```

Accept only if:

- Stable frame and accessible control design are clear.
- The scene is respectful and technical.
- It looks like prototype/design evidence.

Reject if:

- It becomes a hospital scene or generic wheelchair image.
- It claims field-tested performance through visual exaggeration.
- It includes labels, logos or medical icons.

## MTC18: E-Trike Service Quality

Source key: `IntroCon11`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show an e-trike public transport service scene in a dense Southeast Asian urban setting, with one e-trike at a curbside stop and subtle cues of passenger comfort and accessibility. The scene should be calm and uncluttered, focused on service experience rather than traffic chaos. Use natural urban daylight, realistic street materials and documentary framing. Leave the upper third visually clean for later text overlay. Do not include text, labels, route signs, numbers, logos, advertising, watermarks or brand marks.
```

Accept only if:

- The e-trike service context is clear.
- Passenger comfort or accessibility is visible without stereotypes.
- The setting remains Metro Manila-like but not explicitly labeled.

Reject if:

- It includes readable signs, route labels or city names.
- It turns into a congested traffic scene.
- It suggests universal service-quality findings beyond the studied context.

## MTC19: Three-Wheeler EV Powertrain Sizing

Source key: `Tade2021_PowertrainSizingThreeWheelerEV`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show a three-wheeler EV powertrain sizing setup in a clean engineering workspace: motor, battery pack, controller, drivetrain connection and a partial three-wheeled chassis or rear axle visible. The image should communicate sizing and simulation inputs for motor and battery selection, not a finished commercial vehicle. Use realistic components, neutral lab lighting and restrained technical colors. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, equations, charts, dashboards, logos, watermarks or brand marks.
```

Accept only if:

- Motor, battery, controller and drivetrain relation are visible.
- It reads as sizing/simulation preparation for a three-wheeler EV.
- It remains distinct from MTC48 by focusing on physical powertrain layout rather than procedural sizing workflow.

Reject if:

- It shows a drift trike, racing scene or tire smoke.
- It contains equations, charts, readable screens or labels.
- It looks like a generic motorcycle engine with no three-wheeler EV context.

## MTC20: Electric Trike Ackerman Steering

Source key: `Patel2021_ElectricTrikeAckermanSteering`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show a close realistic view of an electric trike Ackerman steering system, with the front wheel geometry, tie rods, steering linkage and chassis support visible in a clean prototype lab. The image should communicate maneuverability, control and steering geometry for a small electric trike. Use realistic metal components, neutral workshop lighting and a restrained engineering palette. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, CAD annotations, arrows, logos, watermarks or brand marks.
```

Accept only if:

- Tie rods, steering linkage and front wheel geometry are visible.
- The image communicates Ackerman steering, not a generic handlebar.
- It does not add unsupported leaning-stabilizer mechanisms.

Reject if:

- It shows only a handlebar without steering geometry.
- It adds stabilizer claims or leaning mechanisms as the central feature.
- It includes CAD labels, diagrams or text.
