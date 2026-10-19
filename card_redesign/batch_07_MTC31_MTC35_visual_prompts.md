# Batch 07 Visual Prompts: MTC31-MTC35

## Purpose

This batch prepares visuals for rollover control, propulsion assessment, lateral skid, active front-steering mitigation and driving-pattern propulsion sizing. MTC31, MTC33 and MTC34 must remain visually distinct to avoid duplicating rollover-control mechanisms.

Global constraints for all images:

- Square 1:1 academic knowledge-card visual.
- Photorealistic editorial style.
- One or two main visual elements only.
- No text, labels, numbers, logos, brand marks or watermarks inside the image.
- Clean upper third preserved for later card layout.
- No crash scenes, accident damage, dramatic warning symbols or racing imagery.
- Control and simulation evidence must not be shown as field deployment proof.

## MTC31: Rollover-Index Controller

Source key: `Ketemaw2022_RolloverIndexController`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show a delta-type three-wheeled vehicle on a controlled test rig, with rear differential braking visually implied through rear wheel brake components and a clean stability-control hardware setup. The image should communicate rollover-risk detection and mitigation through rear differential braking, while remaining clearly simulation/test-rig oriented. Use professional lab lighting, realistic mechanical components and a restrained technical palette. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, graphs, logos, warning symbols, watermarks or brand marks.
```

Accept only if:

- Rear wheel/brake components are visually central.
- The vehicle reads as delta-type three-wheeled.
- It looks like a controlled test or simulation-support setup.

Reject if:

- It shows active front steering as the main mechanism.
- It presents the controller as commercial field deployment.
- It includes charts, labels, numbers or crash imagery.

## MTC32: Rickshaw Propulsion Assessment

Source key: `BP_22`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show an electric rickshaw propulsion assembly on a clean technical bench, with compact motor, controller, battery module and drivetrain connection visible beside a three-wheeled chassis detail. The image should communicate comparison of propulsion options as design choices for urban operation. Use realistic electrical and mechanical components, neutral workshop lighting and a restrained engineering palette. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, brand marks, logos, dashboards, watermarks or product packaging.
```

Accept only if:

- Motor, controller and battery are visible.
- There is enough rickshaw or three-wheeler context.
- It reads as design comparison, not product advertising.

Reject if:

- It becomes a generic electronics bench with no vehicle context.
- It shows branded components or readable product labels.
- It implies one universal motor choice without operating assumptions.

## MTC33: Tripped Rollover and Lateral Skid

Source key: `RodriguezLicea2021_TrippedRolloversLateralSkid`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show a three-wheeled vehicle on a controlled safety-test surface designed for lateral-skid and rollover-risk evaluation, with test cones or low-friction surface cues as subtle secondary elements. The image should communicate linked skid and rollover dynamics requiring sensing and control, without showing an accident. Use professional test-track lighting, realistic vehicle scale and restrained safety-lab composition. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, skid marks as dramatic graphics, logos, crash damage, watermarks or brand marks.
```

Accept only if:

- The scene suggests lateral stability testing.
- It is distinct from rear differential braking in MTC31.
- It avoids crash or damage imagery.

Reject if:

- It shows a vehicle overturning or already crashed.
- It duplicates MTC31 by focusing on rear differential brakes.
- It includes labels, warning graphics or numbers.

## MTC34: Active Front-Steering Rollover Control

Source key: `Azim2015_RolloverMitigationActiveFrontSteering`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show a controlled stability-test setup focused on the front steering assembly of a three-wheeled vehicle, with front wheel angle, steering actuator or linkage and chassis support visible. The image should communicate active front-steering rollover mitigation as a mechanism distinct from rear differential braking. Use clean lab or test-track lighting, realistic mechanical parts and a restrained technical palette. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, graphs, logos, rear-braking emphasis, watermarks or brand marks.
```

Accept only if:

- The front steering assembly is the central mechanism.
- It is visually distinct from MTC31 rear differential braking.
- It communicates controlled mitigation, not crash response.

Reject if:

- It focuses on rear brakes or rear differential hardware.
- It duplicates MTC31 visually.
- It includes labels, numbers, charts or accident imagery.

## MTC35: Driving-Pattern Propulsion Design

Source key: `Waseem2020_DrivingPatternPropulsion3W`

Prompt:

```text
Create a square photorealistic editorial image for an academic knowledge card. Show an electric three-wheeler on a realistic urban driving route, with subtle visible propulsion components such as battery compartment or motor housing integrated into the vehicle. The image should communicate that component sizing depends on representative driving patterns, torque demand and operating use, without using charts or route labels. Use daylight, credible urban road context and professional documentary framing. Leave the upper third visually clean for later text overlay. Do not include text, labels, numbers, maps, dashboards, route signs, logos, watermarks or brand marks.
```

Accept only if:

- The electric three-wheeler and urban-use context are clear.
- Propulsion relevance is visible without diagrams.
- It avoids showing a literal driving-cycle chart.

Reject if:

- It contains maps, speed graphs or readable dashboards.
- It looks like a generic street photo with no propulsion relevance.
- It implies a universal sizing result independent of driving cycle.
