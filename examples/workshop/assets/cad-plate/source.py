# /// script
# requires-python = ">=3.10,<3.15"
# dependencies = ["smlibpy==0.3.1"]
# ///
"""A mounting plate in millimeters; Z is up and the stock is origin-centered.

Run independently: uv run examples/workshop/assets/cad-plate/source.py
Regenerate the browser lesson: uv run scripts/build-cad-example.py

Based on the mounting plate example at https://smlibpy.classcad.ch/.
SMLibPy is copyright 2026 AWV Informatik AG, MIT licensed; see SMLIBPY-LICENSE.
"""

from pathlib import Path

from smlibpy import Box, Cylinder, GridLocations, Rectangle, Z, export_stl

PARAMETERS = {
    "length": 80,
    "width": 60,
    "thickness": 10,
    "cornerRadius": 8,
    "holeRadius": 4,
    "holePitchX": 60,
    "holePitchY": 40,
    "pocketLength": 30,
    "pocketWidth": 20,
    "pocketDepth": 4,
}


def build_stages():
    """Return separate B-reps for each completed operation; never morph topology."""
    p = PARAMETERS
    plate = Box(p["length"], p["width"], p["thickness"])
    yield "stock", "Solid stock", f'plate = Box({p["length"]}, {p["width"]}, {p["thickness"]})', plate

    plate = plate.fillet(plate.edges().parallel_to(Z), p["cornerRadius"])
    yield "fillet", "Round four corners", f'plate = plate.fillet(plate.edges().parallel_to(Z), {p["cornerRadius"]})', plate

    plate -= GridLocations(p["holePitchX"], p["holePitchY"], 2, 2) * Cylinder(p["holeRadius"], p["thickness"])
    yield "holes", "Cut four through holes", f'plate -= GridLocations({p["holePitchX"]}, {p["holePitchY"]}, 2, 2) * Cylinder({p["holeRadius"]}, {p["thickness"]})', plate

    plate -= Rectangle(p["pocketLength"], p["pocketWidth"]).on(plate.faces().top()).extrude(-p["pocketDepth"])
    yield "pocket", "Cut a shallow pocket", f'plate -= Rectangle({p["pocketLength"]}, {p["pocketWidth"]}).on(plate.faces().top()).extrude(-{p["pocketDepth"]})', plate


if __name__ == "__main__":
    final = list(build_stages())[-1][-1]
    assert final.is_valid(), "The final B-rep is invalid."
    path = Path(__file__).resolve().parent
    final.export(path / "final.step")
    export_stl(final, path / "final.stl", tolerance=0.025)
    print(f"Saved {path / 'final.step'} and final.stl; {final.volume:.6f} mm³")
