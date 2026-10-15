# /// script
# requires-python = ">=3.10,<3.15"
# dependencies = ["smlibpy==0.3.1"]
# ///
"""Rebuild the CAD lesson from actual SMLib B-reps, not hand-built display meshes.

Usage: uv run scripts/build-cad-example.py [--output DIRECTORY]

uv provisions the pinned library in an isolated cache. No MCP server, account,
global Python installation, or CAD application configuration is involved.
"""

import argparse
import importlib.metadata
import json
import math
from pathlib import Path
import runpy
import shutil

from smlibpy import export_stl, import_step, import_stl

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "examples" / "workshop" / "assets" / "cad-plate" / "source.py"
PINNED_VERSION = "0.3.1"
TOLERANCE_MM = 0.025


def vector(value):
    return [float(x) for x in value]


def sampled_edge(edge):
    """Sample actual B-rep curves. Circle chord error is at most tolerance."""
    if edge.geom_type == "line":
        steps = 1
    elif edge.geom_type == "circle":
        radius = float(edge.radius)
        max_angle = 2 * math.acos(1 - min(TOLERANCE_MM / radius, 1))
        steps = max(2, math.ceil(edge.length / (radius * max_angle)))
    else:
        # The example intentionally has only analytic lines and circles. Refuse
        # to imply a tolerance guarantee for an unimplemented curve sampler.
        raise ValueError(f"Add a tolerance-aware sampler for {edge.geom_type}.")
    return [float(x) for i in range(steps + 1) for x in edge.point_at(i / steps)]


def serialise_stage(stage):
    key, title, code, part = stage
    assert part.is_valid(), f"Invalid B-rep after {key}"
    mesh = part.mesh(tolerance=TOLERANCE_MM)
    assert mesh.is_closed(), f"Open display mesh after {key}"
    assert mesh.volume > 0, f"Wrong mesh winding after {key}"
    bounds = part.bbox()
    info = part.info()
    # Edges() intentionally omits periodic seam edges; those are surface
    # parameterisation boundaries, not physical creases to draw.
    edges = list(part.edges())
    return {
        "id": key,
        "title": title,
        "code": code,
        "valid": True,
        "volume": float(part.volume),
        "area": float(part.area),
        "centerOfMass": vector(part.center()),
        "faces": info["faces"],
        "topologicalEdges": info["edges"],
        "bounds": {"min": vector(bounds.min), "max": vector(bounds.max)},
        "positions": mesh.vertices.ravel().tolist(),
        "indices": mesh.triangles.ravel().tolist(),
        "edges": [sampled_edge(edge) for edge in edges],
        "edgeTypes": [edge.geom_type for edge in edges],
        "meshVolume": float(mesh.volume),
        "meshClosed": True,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=SOURCE.parent)
    args = parser.parse_args()
    version = importlib.metadata.version("smlibpy")
    assert version == PINNED_VERSION, f"Use smlibpy=={PINNED_VERSION}, found {version}"
    source = runpy.run_path(str(SOURCE))
    parameters = source["PARAMETERS"]
    stages = list(source["build_stages"]())
    data = [serialise_stage(stage) for stage in stages]
    volumes = [stage["volume"] for stage in data]
    assert all(a > b > 0 for a, b in zip(volumes, volumes[1:])), "Cuts must remove material"

    p = parameters
    # Independent closed-form check: the selected dimensions keep all cuts
    # disjoint and inside the stock. Fails if edits invalidate that assumption.
    expected = p["length"] * p["width"] * p["thickness"]
    expected -= (4 - math.pi) * p["cornerRadius"] ** 2 * p["thickness"]
    expected -= 4 * math.pi * p["holeRadius"] ** 2 * p["thickness"]
    expected -= p["pocketLength"] * p["pocketWidth"] * p["pocketDepth"]
    assert math.isclose(volumes[-1], expected, rel_tol=1e-7), (volumes[-1], expected)

    out = args.output.resolve()
    out.mkdir(parents=True, exist_ok=True)
    final = stages[-1][-1]
    # Probe the exact B-rep, not the preview triangles, to distinguish a blind
    # pocket from a through hole and verify the requested cut depth.
    probe_z = p["thickness"] * 2
    pocket_hits = final.raycast((0, 0, probe_z), (0, 0, -1))
    assert len(pocket_hits) == 2, "The center pocket must leave a solid floor"
    pocket_floor = float(pocket_hits[0].point.z)
    assert math.isclose(pocket_floor, p["thickness"] / 2 - p["pocketDepth"], abs_tol=1e-7)
    for x in (-p["holePitchX"] / 2, p["holePitchX"] / 2):
        for y in (-p["holePitchY"] / 2, p["holePitchY"] / 2):
            assert not final.raycast((x, y, probe_z), (0, 0, -1)), "A through hole is blocked"
    final.export(out / "final.step")
    export_stl(final, out / "final.stl", tolerance=TOLERANCE_MM)
    restored = import_step(out / "final.step", heal=False)
    assert restored.is_valid(), "STEP round trip is not a valid solid"
    assert len(restored.faces()) == len(final.faces()), "STEP changed face count"
    assert math.isclose(restored.volume, final.volume, rel_tol=1e-7), "STEP changed volume"
    for actual, expected_bound in zip((*restored.bbox().min, *restored.bbox().max), (*final.bbox().min, *final.bbox().max)):
        assert math.isclose(actual, expected_bound, abs_tol=1e-7), "STEP changed bounds"
    stl = import_stl(out / "final.stl")
    assert stl.is_closed(), "Exported STL is not closed"
    assert math.isclose(stl.volume, final.volume, rel_tol=0.002), "STL exceeds volume tolerance"

    manifest = {
        "schemaVersion": 1,
        "units": "mm",
        "upAxis": "Z",
        "sourceLibrary": "smlibpy",
        "sourceVersion": version,
        "sourceUrl": "https://smlibpy.classcad.ch/",
        "sourceFile": "source.py",
        "meshTolerance": TOLERANCE_MM,
        "parameters": parameters,
        "stages": data,
        "validation": {
            "allStagesValid": True,
            "allMeshesClosed": True,
            "monotonicallyDecreasingVolume": True,
            "analyticFinalVolume": expected,
            "pocketFloorZ": pocket_floor,
            "throughHoleRayChecks": 4,
            "stepRoundTrip": {"valid": True, "volume": float(restored.volume), "faces": len(restored.faces())},
            "stlRoundTrip": {"closed": True, "volume": float(stl.volume), "triangleCount": len(stl)},
        },
    }
    (out / "manifest.json").write_text(json.dumps(manifest, separators=(",", ":"), allow_nan=False) + "\n")
    if out != SOURCE.parent:
        shutil.copy2(SOURCE, out / "source.py")
    distribution = importlib.metadata.distribution("smlibpy")
    license_files = {
        "licenses/LICENSE": "SMLIBPY-LICENSE",
        "licenses/NOTICE": "SMLIBPY-NOTICE",
        "licenses/third_party/usd-brep/LICENSE": "SMLIB-LICENSE",
    }
    for suffix, filename in license_files.items():
        match = next(f for f in distribution.files if str(f).endswith(suffix))
        shutil.copy2(distribution.locate_file(match), out / filename)
    for stage in data:
        print(f'{stage["id"]:8} {stage["volume"]:12.6f} mm³; {stage["faces"]:2} faces; valid; {len(stage["indices"]) // 3} triangles')
    print(f"STEP and STL round trips passed. Assets saved to {out}")


if __name__ == "__main__":
    main()
