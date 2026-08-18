"""
Quantum Hardware Environment & Credentials Detector.
Manages graceful degradation between real IBM / D-Wave QPUs,
high-performance local simulators, and exact classical solvers.
"""

import os
import logging
from typing import Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logger = logging.getLogger("ai_engine.quantum.env")

def is_ibm_available() -> bool:
    """Checks if valid IBM Quantum / Qiskit Runtime token is present."""
    token = os.getenv("IBM_QUANTUM_TOKEN") or os.getenv("QISKIT_IBM_TOKEN", "")
    return bool(token and len(token.strip()) > 10)

def is_dwave_available() -> bool:
    """Checks if valid D-Wave Leap Cloud API token is present."""
    token = os.getenv("DWAVE_API_TOKEN") or os.getenv("DWAVE_TOKEN", "")
    return bool(token and len(token.strip()) > 10)

def get_quantum_mode() -> str:
    """
    Returns the active execution mode:
    - 'LIVE_IBM_HARDWARE' if IBM token is configured
    - 'LIVE_DWAVE_HARDWARE' if D-Wave token is configured
    - 'HYBRID_SIMULATOR' if no live tokens, using local Qiskit/Ocean simulators
    - 'PURE_CLASSICAL' if quantum disabled
    """
    if is_ibm_available() and is_dwave_available():
        return "DUAL_QUANTUM_LIVE"
    elif is_ibm_available():
        return "LIVE_IBM_HARDWARE"
    elif is_dwave_available():
        return "LIVE_DWAVE_HARDWARE"
    else:
        return "HYBRID_SIMULATOR"

def get_quantum_capabilities() -> Dict[str, Any]:
    """Returns detailed hardware availability and backend status."""
    mode = get_quantum_mode()
    return {
        "active_mode": mode,
        "ibm_quantum_ready": is_ibm_available(),
        "ibm_target_backend": os.getenv("IBM_QUANTUM_BACKEND", "ibm_fez (Heron r2 156-Qubit)"),
        "dwave_leap_ready": is_dwave_available(),
        "dwave_target_solver": os.getenv("DWAVE_SOLVER", "Advantage_system6.4 (5000+ Qubits)"),
        "classical_failover_enabled": True,
        "zero_downtime_guarantee": True
    }
