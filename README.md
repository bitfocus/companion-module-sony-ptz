# companion-module-sony-ptz

A module for controlling Sony PTZ Camera BRC and SRG series using HTTP-based commands with digest authentication

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Supported Devices

- BRC-AM7
- SRG-A40
- SRG-A12

## Actions

- System Power
- Pan/Tilt/Zoom
- PTZ Auto Framing
- Multi-Person Tracking
- Preset
- Send any HTTP-based command

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.
