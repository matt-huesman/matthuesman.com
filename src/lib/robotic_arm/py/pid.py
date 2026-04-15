"""
pid.py
======
Per-joint PID controller for animated motion.
"""

from typing import Optional


class PIDController:
    """
    Drives a joint from its current angle toward a target angle each simulation
    tick, producing physically plausible motion (acceleration, overshoot, settling).

    Tuning guide:
      Kp — proportional : increase to speed up response; too high → oscillation.
      Ki — integral     : corrects steady-state error; too high → windup & instability.
      Kd — derivative   : damps oscillation; too high → sluggish response.
    """

    def __init__(self, Kp: float = 8.0, Ki: float = 0.05, Kd: float = 1.5):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd

        self._integral: float = 0.0
        self._prev_error: Optional[float] = None

    def reset(self) -> None:
        """Clear integrator and derivative state (call when switching targets)."""
        self._integral = 0.0
        self._prev_error = None

    def update(self, current: float, target: float, dt: float) -> float:
        """
        Compute one PID output tick.

        Parameters
        ----------
        current : current joint angle (radians)
        target  : desired joint angle (radians)
        dt      : time-step in seconds

        Returns
        -------
        Angular velocity command (radians/second) to apply to the joint.
        """
        error = target - current
        self._integral += error * dt
        # Integral windup clamp
        self._integral = max(-10.0, min(10.0, self._integral))
        derivative = (error - self._prev_error) / dt if self._prev_error is not None else 0.0
        self._prev_error = error
        return self.Kp * error + self.Ki * self._integral + self.Kd * derivative
