# SPARK — the invention lab

An original, browser-first Arduino playground for a curious beginner. Start with an idea, try a behavior, read its code, and plan a physical build if you have the parts. No board, account, cloud service, or AI API is required for the preview.

Open `index.html` through a local HTTP server. In the Taster repository, run `npm start` and visit `/taster/examples/arduino-lab/`. The interface uses an original SVG illustration and a local font; it does not need WebGL.

## Three ways to use one circuit

| Starting point | Behavior | Imagine it as |
| --- | --- | --- |
| Lighthouse | LED on for the first half of a cycle, off for the second | A beacon for a paper harbour |
| Secret signal | Hold the button to light the LED; release to turn it off | A signal between blanket forts |
| Firefly | PWM rises to the knob’s limit, then falls to zero | A glowing cardboard creature |

Name an invention, change its cycle time from 600–3000 ms, and turn the virtual knob. The knob controls the maximum PWM in all three projects. The timer is disabled for Secret signal, whose behavior follows the button directly. The button can be held with mouse, touch, Space, or Enter.

The preview starts paused. Play, pause, reset, and move forward 250 ms at a time. Make a prediction, inspect each component, and record the three wiring-plan checks. Checkmarks record a plan; they do not test physical connections. A reduced-motion preference keeps the initial state still, and the step control allows inspection without playback.

“Get my Arduino code” downloads an `.ino` containing the selected project, invention name, and cycle time. The real potentiometer supplies brightness when running on hardware; the browser knob value is not hard-coded. The code view and download use the same source generator.

## Hardware baseline and pin map

This example targets **Arduino Uno R3 / ATmega328P, 5 V**. Other boards can have different voltage limits, ADC ranges, or PWM pins.

| Part | Connection |
| --- | --- |
| Amber LED + 330 Ω series resistor | D9 → resistor → LED anode (+); cathode (−) → GND |
| Momentary pushbutton | D2 → switch → GND; code enables `INPUT_PULLUP` |
| 10k Ω potentiometer | Outer legs to 5V and GND; centre wiper to A0 |
| Power | Uno R3 USB cable |

A breadboard and jumper wires are also needed. Disconnect USB before changing wires, keep the resistor in series with the LED, and build with an adult helper. Confirm the LED polarity and your button’s pinout. A four-leg button normally has internally joined contacts; use the contacts that connect only when pressed. The drawing shows the switch as two terminals and omits the breadboard. Reversing the potentiometer’s outer connections reverses the knob direction.

For hardware, open the downloaded `.ino` in Arduino IDE, select the Uno R3 and its port, and verify before uploading. The page does not connect to or upload to a board.

## What is actually modeled

`src/model.mjs` defines the pin map, configuration checks, input/output behavior, and sketch generation. The browser model uses integer truncation and the Uno’s 32-bit `millis()` range:

- A0 is an ideal 10-bit input from 0–1023. PWM is `floor(A0 * 255 / 1023)`.
- Released button → HIGH. Pressed button → LOW. Secret signal lights for LOW.
- Lighthouse switches at the exact half-cycle boundary.
- Firefly uses a symmetric triangular PWM envelope with its peak at half a cycle.
- The same cycle, pin, and arithmetic rules appear in the generated C++ sketch.

This is a **JavaScript behavior model**, not an electrical simulator or a C++ emulator. It does not solve voltage/current, validate breadboard wiring, model noise or switch bounce, or establish that a physical build works. The LED drawing shows qualitative average PWM brightness, not individual electrical pulses or a calibrated luminance.

## Verification

The pure model suite checks ADC/PWM endpoints and monotonicity, half-cycle boundaries, active-low button behavior, pulse symmetry, input validation, pin/configuration agreement, safe sketch naming, and `millis()` wrap. The browser fixture covers project changes, playback, stepping/reset, held keyboard input, settings, predictions, component inspection, wiring-plan checks, and download contents. Desktop (1440 px) and narrow reduced-motion (390 px) checks passed without console errors or horizontal overflow.

The generated sketch logic was also compared with the JavaScript model using host C++ and stubbed Arduino I/O. That verifies behavior arithmetic, not AVR compilation or physical hardware. No physical-board validation is claimed.

In the repository:

```sh
node --test tests/arduino-lab.test.mjs
node scripts/drive.mjs http://localhost:5173/taster/examples/arduino-lab/ --actions tests/browser/arduino-lab.actions.json
```

`window.__arduinoLab.ready` marks initialization. `stats()` exposes the configuration, inputs, output, and current generated sketch; `seek(ms)` pauses at a precise time. `.spark-stage` is the screenshot target.

## Sources and next ideas

Original artwork, lesson text, JavaScript, and sketch generator by Taster. The learning approach was inspired by [Learn Arduino](https://learn-arduino-red.vercel.app/); no site assets or code are copied or loaded.

Hardware references: [Uno R3](https://docs.arduino.cc/hardware/uno-rev3/), [official pinout](https://docs.arduino.cc/resources/pinouts/A000066-full-pinout.pdf), [input pull-up](https://docs.arduino.cc/built-in-examples/digital/InputPullupSerial/), [potentiometer input](https://docs.arduino.cc/built-in-examples/analog/AnalogInput/), and [PWM output](https://support.arduino.cc/hc/en-us/articles/9350537961500-Use-PWM-output-with-Arduino).

See the [Arduino invention guide](https://github.com/josoroma/taster/blob/main/references/arduino-projects.md) and [Arduino inventor skill](https://github.com/josoroma/taster/blob/main/skills/arduino-inventor/SKILL.md) for the reusable workflow. First remixes: a desk-focus beacon, a silent “come in” sign, or a model lighthouse. Change the idea and its behavior deliberately; confirm any new hardware and its pin/voltage requirements before building.
