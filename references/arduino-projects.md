# Arduino inventions for kids

Use this workflow when a child wants to imagine a gadget, creature, game, or helpful object with Arduino. Start from the child’s story and one visible behavior. The first result can be a drawing, a browser exploration, or a build plan; a hardware kit is not a prerequisite for imagining. The dedicated [Arduino Inventor skill](../skills/arduino-inventor/SKILL.md) provides a focused companion, while `$taster` can turn the idea into an interactive lesson using [SPARK](../examples/arduino-lab/README.md).

## Inspiration and scope

[Learn Arduino](https://learn-arduino-red.vercel.app/), by Dilum Sanjaya, presents eleven beginner lessons that progress from meeting a board and working with inputs and outputs to combining them in a project. Its interactive board and learn-by-trying approach inform this workflow. SPARK’s visuals, text, project choices, and implementation are original Taster work. This guide does not import that site, reproduce its full curriculum, or claim compatibility with its runtime. Sources checked October 2026.

Keep these three kinds of evidence separate:

| Experience | What it establishes |
| --- | --- |
| Browser behavior model | The implemented rules respond to the inputs shown. It can teach timing and logic without compiling or executing the displayed Arduino code. |
| Circuit simulator | Results within that simulator’s supported board, components, electrical models, and code runner. Name the tool and limitations if one is actually used. |
| Real board | Observations from the actual board, component variants, wiring, power source, and uploaded sketch. Report only checks that were performed. |

A glowing LED on screen does not validate current, connections, code compilation, or a physical build. Do not invent a successful upload, sensor measurement, or electrical simulation.

## Imagine → choose → predict → try → explain → remix

1. **Invite a small invention.** Infer an inviting starting point from the child’s interests. Offer at most three concrete ideas, such as a cardboard lighthouse, a secret-signal badge, or a sleepy firefly. Let the child choose, name it, and change the story. Begin useful brainstorming without requiring an age; adapt vocabulary to the conversation or a supplied age.
2. **Find one rule.** Describe the idea as input → rule → output: “When I hold the button, my creature’s light turns on.” Explain one unfamiliar term when it becomes useful. Avoid turning the first interaction into a quiz about terminology.
3. **Make a prediction.** Ask one observable question before running the model. Offer a way to try both outcomes, explain the result in plain language, and allow retries without penalties. A surprising result is a debugging clue.
4. **Try the smallest version.** Use explicit inputs and a visible output. Show play/pause, reset, and a step control for timing. Let the child change one variable at a time, and keep the diagram, readout, explanation, and code configuration consistent.
5. **Explain with evidence.** Connect the observed change to the rule. Identify what the model assumes. Prefer “The input reads LOW when pressed, so this condition turns on the light” to unexplained praise or a score.
6. **Give ownership back.** Suggest one extension, then let the child decide: a different rhythm, a new name, another message, or a new input. Preserve the working first version so the experiment can be reversed.

Use the child’s language, readable type, large controls, and short sentences. Provide keyboard alternatives to holding or dragging. Start paused, respect reduced motion, and make sound optional. An adult helper can assist with physical connections without taking over the child’s design choices.

## Know the board before specifying physical wiring

For unknown hardware, continue with a paper plan or clearly labeled behavior model. An **assumed Uno R3 example** is useful for teaching, but it is not a wiring plan for the child’s unidentified board. Before producing a plan for a real build, identify the board model/revision, parts or module labels, intended supply, and the behavior to implement. Ask only for missing information needed for that next step; use supplied inventory and photos when available.

Consult the exact board’s official pinout and component documentation. Do not carry the Uno R3’s 5 V logic, PWM pins, ADC range, or current limits onto another board by name alone. The [Uno R3 documentation](https://docs.arduino.cc/hardware/uno-rev3) and [official pinout](https://docs.arduino.cc/resources/pinouts/A000066-full-pinout.pdf) provide the baseline for this example. The pinout lists a 20 mA maximum per I/O pin; design within the applicable per-pin and total limits rather than using a maximum as a target.

For a first physical project, choose low-voltage USB-powered LEDs and buttons. Disconnect power while moving wires, check LED polarity and its series resistor, and have an adult help check the first connections. Keep mains electricity and exposed high-energy supplies out of children’s starter builds. A motor or servo requires a separate plan for its actual current needs, driver/protection where applicable, and common ground; do not power a motor directly from an I/O pin.

## SPARK’s explicit Uno R3 baseline

SPARK uses one circuit for three ideas: Lighthouse blinks for half of each cycle, Secret signal lights while a button is held, and Firefly rises and falls with a triangular brightness envelope. A potentiometer controls maximum brightness. The cycle-time control changes a constant in the generated sketch; it is not an extra physical knob.

| Part | Connection | Why it is here |
| --- | --- | --- |
| Arduino Uno R3 and USB data cable | Board powered by USB for the starter build | Runs the sketch; the browser does not connect to it. |
| Standard LED and 330 Ω series resistor | D9 → resistor → LED anode; LED cathode → GND | Light output with current limiting; verify the chosen LED’s polarity and ratings. |
| Momentary button | D2 → button → GND; D2 uses `INPUT_PULLUP` | Held button reads LOW; released button reads HIGH. |
| 10 kΩ potentiometer | Outer terminals to 5V and GND; wiper to A0 | Supplies the analog input that sets maximum brightness. |
| Breadboard and jumpers | Follow actual breadboard rails and component terminals | The illustrated circuit omits breadboard topology. |

D9 supports PWM on the Uno R3. Arduino’s [PWM guide](https://support.arduino.cc/hc/en-us/articles/9350537961500-Use-PWM-output-with-Arduino) explains the `analogWrite` range of 0–255 and converting a 0–1023 analog input. PWM varies the fraction of time a digital output is on; SPARK’s glow is a qualitative illustration of perceived brightness, not a computed analog output voltage or photometric measurement.

The [official pull-up example](https://github.com/arduino/docs-content/blob/main/content/tutorials/generic/digital-input-pullup/digital-input-pullup.md) supports the button’s active-low behavior. Use the [analog input example](https://docs.arduino.cc/built-in-examples/analog/AnalogInput/) for potentiometer connections and [Blink](https://docs.arduino.cc/built-in-examples/basics/Blink) for LED polarity and series-resistor basics. A four-leg tactile button usually has internally connected terminal pairs; identify the actual pair layout instead of treating the two-terminal drawing as a physical footprint.

```sh
node /absolute/path/to/taster/scripts/create-project.mjs /absolute/path/to/my-invention --template arduino-lab
```

The local example lets a child name an invention, choose a behavior, set cycle time and brightness, hold a button, inspect components, follow a wiring checklist, predict a result, step or play the model, and download a matching `.ino` sketch. Its [README](../examples/arduino-lab/README.md) records controls and limits. Changing the subject requires changing the circuit, behavior model, sketch, explanation, and prediction together.

## A small complete deliverable

Provide a project brief in the child’s words, one input → rule → output statement, required parts, an exact pin table for the confirmed or explicitly assumed board, and a readable `.ino` sketch when code is requested. Use named pin constants, comments that explain intent, and small `setup()`/`loop()` functions. Prefer `millis()` for timing when the program must remain responsive to inputs. Say which board and libraries the sketch targets; do not promise it compiled unless a compiler was run.

Include one prediction, one experiment, and a short debugging ladder. For example: if a light stays dark, first check the model’s brightness setting and selected behavior; for a physical build, unplug power and check the resistor, polarity, common ground, actual pin labels, and button terminal pairs. Then verify the selected board/port, upload result, and a minimal known-good sketch. Explain that code changes and rewiring are different experiments; change one thing at a time.

For a browser deliverable, test model endpoints, timing boundaries, button press/release, pause/step/reset, keyboard use, reduced motion, narrow layout, and downloads. Confirm the generated sketch and diagram agree about pins and behavior. For a simulator or board, report the separate checks actually completed, what was observed, and what remains to be tried. A compilation check validates syntax and linking for its target; it does not validate the wiring.
