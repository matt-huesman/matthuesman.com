"""
arm.py
======
RoboticArm dataclass and the canonical 7-DOF human-arm factory.

Joints modelled after the human arm:
  J0  Shoulder — Flexion / Extension      (sagittal plane)   hinge
  J1  Shoulder — Abduction / Adduction    (frontal plane)    hinge
  J2  Shoulder — Internal/External Rot.   (axial)            hinge
      ↑ together these 3 form the ball-and-socket shoulder
  J3  Elbow   — Flexion / Extension                          hinge
  J4  Forearm — Pronation / Supination                       hinge (pivot)
  J5  Wrist   — Flexion / Extension                          hinge
  J6  Wrist   — Radial / Ulnar Deviation                     hinge
"""

import numpy as np
from dataclasses import dataclass, field
from typing import List

from joint import Joint, JointType


@dataclass
class RoboticArm:
    """
    A 7-DOF serial manipulator modelled on the human arm.
    Segment lengths are loosely scaled to a 70 cm arm (upper + lower + hand).
    """

    joints: List[Joint] = field(default_factory=list)

    def num_joints(self) -> int:
        return len(self.joints)

    def get_angles(self) -> np.ndarray:
        """Return current joint angles as a numpy array (radians)."""
        return np.array([j.theta for j in self.joints])

    def set_angles(self, thetas: np.ndarray) -> None:
        """Set all joint angles at once, clamping to joint limits."""
        for i, joint in enumerate(self.joints):
            joint.theta = float(np.clip(thetas[i], joint.theta_min, joint.theta_max))

    def set_angle(self, index: int, theta_rad: float) -> None:
        """Set a single joint angle (clamped to limits)."""
        j = self.joints[index]
        j.theta = float(np.clip(theta_rad, j.theta_min, j.theta_max))


def build_human_arm() -> RoboticArm:
    """
    Constructs a 7-DOF arm with DH parameters and joint limits
    representative of a human arm.

    Segment lengths (approximate, in metres):
      Upper arm : 0.30 m
      Forearm   : 0.25 m
      Hand      : 0.10 m

    DH frame assignment follows the Modified DH convention with the
    shoulder root at the world origin, z-axes along each joint rotation axis.
    """
    #              name                    type              a       α°    d      θ°   min°   max°   colour
    j0 = Joint.from_degrees("Shoulder Flex/Ext",  JointType.HINGE,
                            0.00,  90,  0.00,   0,  -60,  180,  "#EF5350")
    j1 = Joint.from_degrees("Shoulder Abd/Add",   JointType.HINGE,
                            0.00, -90,  0.00,   0,  -45,  180,  "#FF7043")
    j2 = Joint.from_degrees("Shoulder Int/Ext R", JointType.HINGE,
                            0.00,  90,  0.30,   0,  -90,   90,  "#FFA726")
    j3 = Joint.from_degrees("Elbow Flex/Ext",     JointType.HINGE,
                            0.00, -90,  0.00,  90,    0,  145,  "#FFEE58")
    j4 = Joint.from_degrees("Forearm Pro/Sup",    JointType.PIVOT,
                            0.00,  90,  0.25,   0,  -80,   80,  "#66BB6A")
    j5 = Joint.from_degrees("Wrist Flex/Ext",     JointType.HINGE,
                            0.00, -90,  0.00,   0,  -70,   80,  "#26C6DA")
    j6 = Joint.from_degrees("Wrist Rad/Uln Dev",  JointType.HINGE,
                            0.10,   0,  0.10,   0,  -25,   35,  "#7E57C2")

    return RoboticArm(joints=[j0, j1, j2, j3, j4, j5, j6])
