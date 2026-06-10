# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **PTZ Move** and **PTZ Zoom** speed fields now accept variables, so pan/tilt and zoom speeds can be driven dynamically (values are parsed and clamped to 0-24 and 0-32766 respectively).
- **Auto Framing — Framing Mode** action (Person / Ball Sports) — BRC-AM7 & SRG-A40/A12.
- **Auto Framing — Lead Room** action (Off / Low / Middle / High).
- **Auto Framing — Real-time Overlay (Frame/Area Indicator)** action (On / Off).
- **Auto Framing Shot Mode — Closer Close Up** option (tighter than the existing Close Up).
- **Auto Framing Tracking Speed** and **Tracking Sensitivity** actions with per-axis (Pan/Tilt/Zoom) selection — BRC-AM7 only.
- **Fixed Angle Position** action (Off / On / Store Current Position / Recall Position) — SRG-A40/A12 only.
- **Fixed Angle Fine Pan/Tilt** and **Fixed Angle Fine Zoom** actions for nudging the stored fixed angle — SRG-A40/A12 only.
- **Scene File Recall** action (Off / 1–16) — BRC-AM7 only.
- Boolean **feedbacks** for Auto Framing On/Off, Shot Mode, Framing Mode, Lead Room, Real-time Overlay, Fixed Angle Position, and Auto Framing Tracking Status.
- **Variables** for tracking status, framing mode, shot mode (friendly name), lead room level, real-time overlay state, fixed angle enabled, and per-axis tracking speed/sensitivity.
- Matching **presets** for the new actions, with feedback highlighting on the relevant buttons.
- Support for attaching feedbacks to presets via an optional trailing element on the preset specs.

### Fixed

- Actions, feedbacks, variables, and presets are now registered immediately, so they can be configured while the camera is offline or unreachable (e.g. building a show at home before connecting the PTZs on site). Previously these were not exported until a connection attempt completed.
- Multi-value actions (Absolute Focus / Zoom / PTZF / Pan-Tilt, Relative Pan-Tilt, Fixed Angle Fine Pan/Tilt & Zoom) now resolve variables in their value fields instead of sending the raw `$(...)` text.
- "Update Target IP via Variable" now reconnects to the new host immediately, rather than only persisting the change.

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

[Unreleased]: https://github.com/bitfocus/companion-module-sony-ptz/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/bitfocus/companion-module-sony-ptz/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/bitfocus/companion-module-sony-ptz/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/bitfocus/companion-module-sony-ptz/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/bitfocus/companion-module-sony-ptz/releases/tag/v1.0.0
