# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-16

### Added

- **Auto Framing — Framing Mode** action (Person / Ball Sports), feedback and `framingMode` variable
- **Auto Framing — Lead Room** action (Off / Low / Middle / High), feedback and `leadRoom` variable
- **Auto Framing — Frame/Area Indicator** action (On / Off), feedback and `realtimeOverlay` variable
- **Auto Framing Shot Mode — Closer Close Up** option, feedback and `shotMode` variable
- **Auto Framing Tracking Speed** and **Tracking Sensitivity** actions with per-axis (Pan/Tilt/Zoom) selection — BRC-AM7 only — plus matching feedbacks and variables (`trackingSpeedPan`/`Tilt`/`Zoom`, `trackingSensitivityPan`/`Tilt`/`Zoom`)
- **Fixed Angle Position** action (Off / On / Store Current Position / Recall Position) — SRG-A40/A12 only — feedback and `fixedAngle` variable
- **Fixed Angle Fine Adjust** for fine adjustment of the stored fixed angle — SRG-A40/A12 only
- **Scene File Recall** action (Off / 1–16) — BRC-AM7 only — feedback and variables for the current scene file number (`currentSceneFile`) and each slot's name (`sceneFileName1`–`sceneFileName16`)
- **Auto Framing On/Off** feedback and `autoFraming` variable
- **Auto Framing Tracking Status** feedback and `trackingStatus` variable
- **Multi-Person Tracking** feedback and `multiTracking` / `multiTrackingNum` variables
- **Focus Mode**, **Auto Focus Mode**, and **Auto Focus Sensitivity** feedbacks for the existing focus actions
- **White Balance Mode** action (Auto / Indoor / Outdoor / One Push WB / ATW / Manual), feedback and `whiteBalanceMode` variable
- **White Balance Blue (Cb) Gain** and **White Balance Red (Cr) Gain** actions with `whiteBalanceCbGain` / `whiteBalanceCrGain` variables
- **Image Stabilizer** action (On / Off), feedback and `stabilizer` variable
- **Tally Control** action (On / Off), feedback and `tallyControl` variable, plus a **Red Tally Status** feedback and `rTallyStatus` variable
- Matching **presets** for the new actions, organized into categories, with feedback highlighting on the relevant buttons.
- Presets are now **filtered to the connected camera model** once it is known; model-specific presets are hidden for other models. When the camera is offline or its model is unrecognized, all presets are shown.
- Support for attaching feedbacks to presets via an optional trailing element on the preset specs.

### Changed

- **PTZ Presets — Recall** and **Store** gain a "Custom Number / Variable" option in the preset dropdown, allowing the preset number to be driven by a value or variable — including presets beyond the listed range
- **PTZ Move** and **PTZ Zoom** speed fields now accept variables, so pan/tilt and zoom speeds can be driven dynamically
- Configuration password is now stored as a secret

### Fixed

- Actions, feedbacks, variables, and presets are now registered immediately, so they can be configured while the camera is offline or unreachable.
- An unreachable camera no longer prevents editing the connection configuration.
- Feedbacks now refresh immediately after action runs, rather than waiting for the next poll.

## [1.2.0] - 2025-12-07

### Added

- Auto Focus actions (mode and sensitivity) and related variables.
- Support for actions with free-form text input values.

## [1.1.0] - 2025-11-09

### Added

- Rotary actions and presets.

## [1.0.1] - 2025-09-09

### Fixed

- Maintenance and bug fixes.

## [1.0.0] - 2025-07-07

### Added

- Initial release: PTZ control, presets, and status variables for Sony BRC and SRG series cameras over HTTP with digest authentication.

[1.3.0]: https://github.com/bitfocus/companion-module-sony-ptz/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/bitfocus/companion-module-sony-ptz/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/bitfocus/companion-module-sony-ptz/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/bitfocus/companion-module-sony-ptz/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/bitfocus/companion-module-sony-ptz/releases/tag/v1.0.0
