"""
joint.py
========
JointType enum and Joint dataclass.

DH Parameters follow the Modified Denavit-Hartenberg convention:
  a      — link length       : distance along x-axis from z_{i-1} to z_i
  alpha  — link twist        : angle around x-axis from z_{i-1} to z_i  (radians)
  d      — link offset       : distance along z-axis from x_{i-1} to x_i
  theta  — joint angle       : rotation around z-axis (controlled, radians)
"""

import numpy as np
from dataclasses import dataclass
from enum import Enum


class JointType(Enum):
    HINGE = "hinge"  # rotation around one axis (revolute)
    PIVOT = "pivot"  # axial rotation (also revolute, different axis convention)


@dataclass
class Joint:
    """
    Describes one joint in the arm chain.

    Joint limits are in DEGREES for human readability; internally converted to radians.
    """

    name: str
    joint_type: JointType

    # DH parameters (constant geometry of the link)
    a: float      # metres — link length
    alpha: float  # radians — link twist
    d: float      # metres — link offset

    # Joint angle state
    theta: float      # current angle (radians)
    theta_min: float  # lower limit   (radians)
    theta_max: float  # upper limit   (radians)

    color: str = "#4FC3F7"

    @staticmethod
    def from_degrees(
        name, joint_type, a, alpha_deg, d,
        theta_deg, min_deg, max_deg, color="#4FC3F7"
    ) -> "Joint":
        """Convenience constructor: angles supplied in degrees."""
        return Joint(
            name=name,
            joint_type=joint_type,
            a=a,
            alpha=np.radians(alpha_deg),
            d=d,
            theta=np.radians(theta_deg),
            theta_min=np.radians(min_deg),
            theta_max=np.radians(max_deg),
            color=color,
        )
