# Block 7 Redesign Plan: MTC31--MTC35

## Editorial Status

This block focuses on rollover control, propulsion-system assessment, lateral skid mitigation and driving-pattern-based propulsion design. MTC31 is verified through `Ketemaw2022_RolloverIndexController`, MTC32 is verified locally through `BP_22`, and MTC33--MTC35 now have stable verified or replacement source keys.

## Block Function in the Article

Block 7 is one of the strongest technical blocks in the deck because it connects electric three-wheeler design to safety control, propulsion selection and driving-cycle-based sizing. It will be important for showing that the card interface can handle mathematically and dynamically complex evidence.

## MTC31

### Current Source Metadata

- Title: Design of a Rollover Index-Based Sliding Mode Controller for Roll Stability of Three-Wheeled Vehicles Using Rear Differential Braking
- Authors: D. Ketemaw, S. Seid
- Year: 2022
- Venue: Frontiers in Mechanical Engineering
- Current category: Q2
- Verified source key: `Ketemaw2022_RolloverIndexController`
- Source status: Verified through Crossref

### Proposed Category

Structure, ergonomics and safety.

### Evidence Type

Dynamic model / control-system simulation.

### Core Idea

A rollover-index-based controller can use rear differential braking to reduce rollover risk in delta-type three-wheeled vehicles.

### Main Contribution

The card should explain how dynamic modelling and control can detect and mitigate rollover risk.

### Limitation / Caution

The card should distinguish simulation-based controller validation from real vehicle deployment.

### Visual Direction

Delta-type three-wheeled vehicle on a controlled test rig, with rear differential braking visually implied through wheel/brake components.

### Final Image Prompt

Use case: scientific-educational. Asset type: square visual element for an academic knowledge card. Create a realistic delta-type three-wheeled vehicle on a controlled stability test rig. Emphasize rear wheel braking components and safe rollover-control testing, without crash or damage. Professional engineering safety style, clean upper third for text overlay. No text, no logos, no labels, no numbers, no watermark.

## MTC32

### Current Source Metadata

- Title: Study and Assessment of Propulsion Systems of Three-Wheeled Electric Powered Rickshaw in India
- Authors: M. Waseem, M. Ahmad, A. Parveen
- Year: 2021
- Venue: International Journal of Emerging Trends in Engineering Research
- Current category: Q3
- Verified source key: BP_22
- Source status: Verified

### Proposed Category

Propulsion, battery and energy management.

### Evidence Type

Comparative propulsion-system assessment.

### Core Idea

Electric rickshaw propulsion design requires comparing motor technologies, battery capacity and performance requirements for urban operation.

### Main Contribution

The card should help users compare propulsion options as part of vehicle design rather than treating electric conversion as a single technology choice.

### Limitation / Caution

The card should report recommendations only within the operating assumptions used by the study.

### Visual Direction

Electric rickshaw propulsion assembly with motor, controller and battery on a clean technical bench.

### Final Image Prompt

Use case: scientific-educational. Asset type: square visual element for an academic knowledge card. Create a realistic electric rickshaw propulsion assembly on a clean technical bench. Show a compact motor, controller and battery pack as the main elements, with a small three-wheeler chassis detail in the background. Professional engineering lighting, clean upper third for text overlay. No text, no logos, no labels, no numbers, no watermark.

## MTC33

### Current Source Metadata

- Title: On the Tripped Rollovers and Lateral Skid in Three-Wheeled Vehicles and Their Mitigation
- Author: M. A. Rodriguez-Licea
- Year: 2021
- Venue: Vehicles
- Current category: Q2
- Verified source key: `RodriguezLicea2021_TrippedRolloversLateralSkid`
- Source status: Verified through Crossref

### Proposed Category

Structure, ergonomics and safety.

### Evidence Type

Dynamic stability control / numerical and HIL testing.

### Core Idea

Three-wheeled vehicles face rollover and lateral skid risks that can be mitigated through stability-control strategies.

### Main Contribution

The card should present lateral skid and rollover as linked dynamic safety problems requiring sensing and control.

### Limitation / Caution

The card should distinguish hardware-in-the-loop or numerical validation from field testing.

### Visual Direction

Three-wheeled vehicle on a controlled safety test surface with a stability-control test setup, no crash imagery.

### Final Image Prompt

Use case: scientific-educational. Asset type: square visual element for an academic knowledge card. Create a realistic three-wheeled vehicle on a controlled safety test surface for lateral skid and rollover mitigation research. Show the vehicle in a stable test maneuver with visible braking/sensor context, no crash, no damage, professional engineering style, clean upper third for text overlay. No text, no logos, no labels, no numbers, no watermark.

## MTC34

### Current Source Metadata

- Title: Rollover Mitigation Controller Development for Three-Wheeled Vehicle Using Active Front Steering
- Authors: R. A. Azim, F. M. Malik, W. u. H. Syed
- Year: 2015
- Venue: Mathematical Problems in Engineering
- Current category: Q2
- Verified source key: `Azim2015_RolloverMitigationActiveFrontSteering`
- Source status: Verified replacement source

### Proposed Category

Structure, ergonomics and safety.

### Evidence Type

Dynamic modelling / sliding-mode and fuzzy control.

### Core Idea

Active front steering can be used as a rollover-mitigation control strategy for three-wheeled vehicles.

### Main Contribution

The card should show how steering-based control logic can support safer three-wheeled vehicle operation.

### Limitation / Caution

This replacement avoids duplicating MTC31. The final card should distinguish active-front-steering mitigation from rear-differential-braking sliding-mode control.

### Visual Direction

Controlled lab scene with delta tricycle model, rear-wheel braking elements and stability-control hardware.

### Final Image Prompt

Use case: scientific-educational. Asset type: square visual element for an academic knowledge card. Create a realistic lab scene with a delta-type tricycle model on a stability-control test rig. Show rear-wheel braking elements and compact control hardware without screens containing text. Professional technical style, clean upper third for text overlay. No text, no logos, no labels, no numbers, no watermark.

## MTC35

### Current Source Metadata

- Title: Driving Pattern-based Optimization and Design of Electric Propulsion System for Three-Wheeler Battery Vehicle
- Authors: M. Waseem, A. F. Sherwani, M. Suhaib
- Year: 2020
- Venue: International Journal of Performability Engineering
- Current category: Q3
- Verified source key: `Waseem2020_DrivingPatternPropulsion3W`
- Source status: Verified through Crossref

### Proposed Category

Propulsion, battery and energy management.

### Evidence Type

Driving-cycle-based propulsion design / simulation.

### Core Idea

Electric propulsion systems for three-wheelers should be sized using representative driving patterns rather than generic vehicle assumptions.

### Main Contribution

The card should explain how driving cycles connect real use, torque demand, power requirement and component selection.

### Limitation / Caution

The card should identify the driving cycle and modelling assumptions once the source is verified.

### Visual Direction

Electric three-wheeler on a realistic urban route with subtle propulsion components visible, not a literal chart.

### Final Image Prompt

Use case: scientific-educational. Asset type: square visual element for an academic knowledge card. Create a realistic electric three-wheeler on an urban test route, with subtle cutaway visibility of motor and battery components. Emphasize driving-pattern-based propulsion design without showing charts or text. Professional technical editorial style, clean upper third for text overlay. No text, no logos, no labels, no numbers, no watermark.

## Block 7 Quality Control

Before final image generation or card composition:

- keep MTC32 as source-verified but still text/visual pending;
- keep MTC33 and MTC35 under their stable verified keys;
- keep MTC34 under its verified replacement key and distinguish it clearly from MTC31;
- avoid claiming real-world safety improvement from simulation-only studies;
- keep safety visuals controlled, technical and non-sensational.
