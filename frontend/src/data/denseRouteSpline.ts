/**
 * High-Density Curved Highway Spline Generator for Pune District Corridors
 * Generates 800+ smooth curved GPS coordinates connecting all 10 clinics
 * along National Highway 60, Pune-Nagar Road, and Ghod River Valleys.
 */

// Catmull-Rom Spline Interpolator for ultra-smooth highway curves
function catmullRom(p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number], t: number): [number, number] {
  const t2 = t * t;
  const t3 = t2 * t;

  const f0 = -0.5 * t3 + t2 - 0.5 * t;
  const f1 = 1.5 * t3 - 2.5 * t2 + 1.0;
  const f2 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
  const f3 = 0.5 * t3 - 0.5 * t2;

  const x = p0[0] * f0 + p1[0] * f1 + p2[0] * f2 + p3[0] * f3;
  const y = p0[1] * f0 + p1[1] * f1 + p2[1] * f2 + p3[1] * f3;

  return [x, y];
}

export function generateDenseHighwaySpline(waypoints: [number, number][], samplesPerSegment = 60): {
  pathWithTimestamps: [number, number, number][];
  denseLineCoordinates: [number, number][];
} {
  if (waypoints.length < 2) {
    return { pathWithTimestamps: [], denseLineCoordinates: [] };
  }

  const loop = [...waypoints, waypoints[0]]; // Closed loop
  const denseLineCoordinates: [number, number][] = [];
  const pathWithTimestamps: [number, number, number][] = [];
  
  let totalTime = 0;
  const timeStep = 3.5; // Smooth 60fps time progression

  for (let i = 0; i < loop.length - 1; i++) {
    const p0 = loop[Math.max(0, i - 1)];
    const p1 = loop[i];
    const p2 = loop[i + 1];
    const p3 = loop[Math.min(loop.length - 1, i + 2)];

    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const pt = catmullRom(p0, p1, p2, p3, t);
      denseLineCoordinates.push(pt);
      pathWithTimestamps.push([pt[0], pt[1], totalTime]);
      totalTime += timeStep;
    }
  }

  return { pathWithTimestamps, denseLineCoordinates };
}
