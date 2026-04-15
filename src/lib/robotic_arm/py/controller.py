"""
controller.py
=============
ArmController — the simulation/control loop that bridges Python kinematics
to the TypeScript renderer.

Usage from JS (via Pyodide):
    ctrl = ArmController()
    ctrl.set_ik_target(0.3, 0.0, 0.3)   # world-space target (metres, Z-up)
    result_json = ctrl.step(1/60)        # advance one frame, returns JSON string
"""

import json
import numpy as np

from arm import RoboticArm, build_human_arm
from fk import forward_kinematics
from ik import ik_damped_least_squares
from pid import PIDController


# Rest pose: elbow at 90° so the arm hangs in a natural T-pose
_REST_POSE = np.radians([0, 0, 0, 90, 0, 0, 0])


class ArmController:
    """
    Owns the arm state and drives it toward a target each frame.

    The control loop:
      1. If an IK target is set, solve IK from the rest pose on a scratch copy
         of the arm to obtain stable target joint angles.
      2. Drive the live arm toward those target angles via per-joint PID.
      3. Run FK on the live arm.
      4. Return a JSON string with everything the TS renderer needs.
    """

    def __init__(self) -> None:
        self.arm: RoboticArm = build_human_arm()
        self.arm.set_angles(_REST_POSE.copy())

        self.pids = [PIDController(Kp=8.0, Ki=0.05, Kd=1.5) for _ in range(7)]
        self.target_angles: np.ndarray = _REST_POSE.copy()

        self._ik_target: np.ndarray | None = None
        self._ik_target_last: np.ndarray | None = None  # last position IK was solved for

    # ── Target setters ──────────────────────────────────────────────────────────

    def set_ik_target(self, x: float, y: float, z: float) -> None:
        """
        Set the end-effector IK target in world space (metres, Z-up convention).
        IK will be solved from the rest pose each frame for consistency.
        """
        self._ik_target = np.array([x, y, z], dtype=float)

    def clear_ik_target(self) -> None:
        """Stop IK; arm drives back to rest pose."""
        self._ik_target = None
        self._ik_target_last = None
        self.target_angles = _REST_POSE.copy()
        for pid in self.pids:
            pid.reset()

    def set_target_angles(self, angles: list) -> None:
        """Directly command target joint angles (radians). Disables IK."""
        self._ik_target = None
        self.target_angles = np.array(angles, dtype=float)

    # ── Simulation step ─────────────────────────────────────────────────────────

    def step(self, dt: float = 1 / 60) -> str:
        """
        Advance the simulation by dt seconds.

        Returns a JSON string:
        {
          "joint_positions": [[x,y,z], ...],   // 8 positions: base + 7 joints (metres, Z-up)
          "end_effector":    [x, y, z],         // world-space tip position
          "angles":          [θ0, …, θ6],       // current joint angles (radians)
          "colors":          ["#hex", …],       // per-joint colour for the renderer
          "claw_open":       0.0                // 0–1 openness (future use)
        }
        """
        # 1. Solve IK only when the target has moved (>2 mm).
        #    Solve from the CURRENT arm state, not rest pose — this keeps the
        #    solution continuous as the cursor moves (nearby targets → nearby
        #    joint angles).  Save/restore avoids a deepcopy.
        if self._ik_target is not None:
            moved = (
                self._ik_target_last is None
                or np.linalg.norm(self._ik_target - self._ik_target_last) > 0.002
            )
            if moved:
                saved = self.arm.get_angles().copy()
                solved, _err = ik_damped_least_squares(
                    self.arm, self._ik_target, damping=0.05, tolerance=1e-3, max_iter=100
                )
                self.target_angles = solved
                self._ik_target_last = self._ik_target.copy()
                self.arm.set_angles(saved)  # restore; PID drives toward target_angles

        # 2. PID — drive live arm toward target angles
        current = self.arm.get_angles()
        new_angles = current.copy()
        for i, pid in enumerate(self.pids):
            cmd = pid.update(current[i], self.target_angles[i], dt)
            new_angles[i] = current[i] + cmd * dt
        self.arm.set_angles(new_angles)

        # 3. FK for rendering
        end_effector, joint_positions = forward_kinematics(self.arm)

        return json.dumps({
            "joint_positions": [p.tolist() for p in joint_positions],
            "end_effector": end_effector.tolist(),
            "angles": self.arm.get_angles().tolist(),
            "colors": [j.color for j in self.arm.joints],
            "claw_open": 0.0,
        })
