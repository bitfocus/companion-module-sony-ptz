## Sony PTZ Camera Module

A module for controlling Sony PTZ Camera BRC and SRG series using HTTP-based commands with digest authentication

### Supported Devices

- BRC-AM7
- SRG-A40
- SRG-A12
- ILME-FR7

### Actions

- System Power
  - On
  - Standby
- Auto Framing
  - On
  - Off
  - Pause On
  - Pause Off
  - Restart (Off and On)
- Auto Framing Shot Mode
  - Closer Close Up
  - Close Up
  - Waist
  - Full Body
- Framing Mode
  - Person
  - Ball Sports
- Lead Room Effect
  - Off
  - Low
  - Middle
  - High
- Real-time Overlay (Frame/Area Indicator)
  - On
  - Off
- Auto Framing Tracking Speed \*BRC-AM7 only
  - Axis (Pan/Tilt/Zoom), Value (1-5)
- Auto Framing Tracking Sensitivity \*BRC-AM7 only
  - Axis (Pan/Tilt/Zoom), Value (0-5)
- Fixed Angle Position \*SRG only
  - Off
  - On
  - Store Current Position
  - Recall Position
- Fixed Angle Fine Pan/Tilt \*SRG only
  - Relative Pan/Tilt nudge of the stored fixed angle (hex offsets)
- Fixed Angle Fine Zoom \*SRG only
  - Relative Zoom nudge of the stored fixed angle (hex offset)
- Scene File Recall \*BRC-AM7 only
  - Off (0)
  - Scene File Number (1-16)
- Auto Framing Start Position
  - Move (Recall)
  - Decide (Set)
- Preset Call
  - Look Back
  - PTZ Home (Center Position)
  - Preset Number (1-10)
- Preset Set
  - Preset Number (1-10)
- Number of Multi-Person Tracking Target
  - 1 (Off)
  - 2-8 (On)
- Multi-Person Tracking Wait Time
  - 0 (Wait Forever)
  - 1-60 (Seconds)
- Pan Tilt
  - Up
  - Down
  - Left
  - Right
  - Up-Left
  - Up-Right
  - Down-Left
  - Down-Right
- Zoom
  - Tele
  - Wide
- Stop Pan Tilt Zoom
  - Pan/Tilt
  - Wide/Tele
- Auto Focus
  - On/Off
  - Mode (Normal/Interval/Zoom Trigger)
  - Sensitivity (Normal/Low)
- Absolute Focus \*SRG only
- Absolute Zoom \*SRG only
- Absolute PTZF
- Absolute PanTilt
- Relative PanTilt \*SRG only
- Other Command
  - Any Command Can Be Sent

### Presets

- System Power
- Auto Framing
- Framing Mode
- Lead Room Effect
- Real-time Overlay
- Fixed Angle Position \*SRG only
- Scene File Recall \*BRC-AM7 only
- Multi-Person Tracking
- Pan/Tilt/Zoom
  - Down: Start
  - Up: Stop
- Preset Call
- Preset Set
- Rotary Button
  - Pan
  - Tilt
  - Zoom
  - Gain
  - Iris
  - ND Variable
  - Master Black
- Auto Focus

### Feedbacks

- System Power (On/Standby)
- Framing Mode (Person/Ball Sports)
- Lead Room Effect (Off/Low/Middle/High)
- Real-time Overlay (On/Off)
- Fixed Angle Position Enabled (On/Off) \*SRG only
- Auto Framing Tracking Status (Idle/Missing/Preparing/Searching/Tracking/Waiting/Fixed Angle)

### Variables

- `$(this:autoFraming)` - Auto Framing Status
- `$(this:trackingStatus)` - Auto Framing Tracking Status (Idle/Missing/Preparing/Searching/Tracking/Waiting/Fixed Angle)
- `$(this:framingMode)` - Framing Mode (Person/Ball Sports)
- `$(this:leadRoom)` - Lead Room Effect Level (Off/Low/Middle/High)
- `$(this:realtimeOverlay)` - Real-time Overlay (Frame/Area Indicator) State (On/Off)
- `$(this:fixedAngle)` - Fixed Angle Position Enabled (On/Off) \*SRG only
- `$(this:trackingSpeedPan)` - Auto Framing Tracking Speed - Pan \*BRC-AM7 only
- `$(this:trackingSpeedTilt)` - Auto Framing Tracking Speed - Tilt \*BRC-AM7 only
- `$(this:trackingSpeedZoom)` - Auto Framing Tracking Speed - Zoom \*BRC-AM7 only
- `$(this:trackingSensitivityPan)` - Auto Framing Tracking Sensitivity - Pan \*BRC-AM7 only
- `$(this:trackingSensitivityTilt)` - Auto Framing Tracking Sensitivity - Tilt \*BRC-AM7 only
- `$(this:trackingSensitivityZoom)` - Auto Framing Tracking Sensitivity - Zoom \*BRC-AM7 only
- `$(this:modelName)` - Model Name
- `$(this:multiTracking)` - Multi-Person Tracking Status
- `$(this:multiTrackingNum)` - Multi Tracking Target Number
- `$(this:name)` - Camera Name
- `$(this:power)` - System Power State
- `$(this:serial)` - Serial Number
- `$(this:softVersion)` - Software Version
- `$(this:streamMode)` - Stream Mode
- `$(this:zoomMode)` - Zoom Mode
- `$(this:panPos)` - Current Pan Position
- `$(this:tiltPos)` - Current Tilt Position
- `$(this:zoomPos)` - Current Zoom Position
- `$(this:focusPos)` - Current Focus Position
- `$(this:panRangeLeft)` - Possible Left Movement Range of Pan
- `$(this:panRangeRight)` - Possible Right Movement Range of Pan
- `$(this:tiltRangeLower)` - Possible Lower Movement Range of Tilt
- `$(this:tiltRangeUpper)` - Possible Upper Movement Range of Tilt
- `$(this:zoomRangeWide)` - Possible Wide Movement Range of Zoom
- `$(this:zoomRangeTele)` - Possible Tele Movement Range of Zoom
- `$(this:absoluteFocus)` - Absolute Focus Value
- `$(this:afSensitivity)` - Auto Focus Sensitivity
- `$(this:autoFocusMode)` - Auto Focus Mode (Normal/Interval/Zoom Trigger) \*SRG only
- `$(this:focusMode)` - Focus Mode (Auto/Manual)
- `$(this:exposureGain)` - Exposure Gain Value
- `$(this:exposureIris)` - Exposure Iris Value
- `$(this:exposureNDVariable)` - Exposure ND Variable Value \*BRC-AM7 only
- `$(this:masterBlack)` - Master Black Value \*BRC-AM7 only

https://github.com/bitfocus/companion-module-sony-ptz/issues
