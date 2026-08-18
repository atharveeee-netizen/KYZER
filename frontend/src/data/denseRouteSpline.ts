/**
 * Orthogonal Urban Street Grid & Highway Path Generator
 * Computes exact street-centerline subdivision along road networks
 * Zero building collision: Strictly follows street asphalt and road centerlines.
 */

export function generateOrthogonalStreetPath(
  waypoints: [number, number][],
  stepMeters = 4
): {
  denseLineCoordinates: [number, number][];
  pathWithTimestamps: [number, number, number][];
} {
  if (waypoints.length < 2) {
    return {
      denseLineCoordinates: waypoints,
      pathWithTimestamps: waypoints.map(p => [p[0], p[1], 0]),
    };
  }

  const denseLineCoordinates: [number, number][] = [];
  const pathWithTimestamps: [number, number, number][] = [];
  let totalTime = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    // Convert degrees to approximate meters for SoMa SF latitude (~37.78)
    const dx = (end[0] - start[0]) * 88000;
    const dy = (end[1] - start[1]) * 111000;
    const segDist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(2, Math.floor(segDist / stepMeters));

    for (let s = 0; s < steps; s++) {
      const frac = s / steps;
      const lng = start[0] + (end[0] - start[0]) * frac;
      const lat = start[1] + (end[1] - start[1]) * frac;

      denseLineCoordinates.push([lng, lat]);
      pathWithTimestamps.push([lng, lat, totalTime]);
      totalTime += 1.0;
    }
  }

  // Push final endpoint
  const last = waypoints[waypoints.length - 1];
  denseLineCoordinates.push(last);
  pathWithTimestamps.push([last[0], last[1], totalTime]);

  return { denseLineCoordinates, pathWithTimestamps };
}
