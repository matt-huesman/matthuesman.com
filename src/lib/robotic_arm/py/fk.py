"""
fk.py
=====
Forward kinematics via the Modified Denavit-Hartenberg transform chain.
"""

import numpy as np
from typing import List, Tuple

from arm import RoboticArm


def dh_transform(a: float, alpha: float, d: float, theta: float) -> np.ndarray:
    """
    Compute a single 4×4 Modified DH homogeneous transform matrix.

    Convention:
      T = Rot_x(alpha) · Trans_x(a) · Rot_z(theta) · Trans_z(d)

        [  cos θ,          -sin θ,          0,        a       ]
        [  sin θ·cos α,     cos θ·cos α,   -sin α,   -d·sin α ]
        [  sin θ·sin α,     cos θ·sin α,    cos α,    d·cos α ]
        [  0,               0,               0,        1      ]
    """
    ct = np.cos(theta)
    st = np.sin(theta)
    ca = np.cos(alpha)
    sa = np.sin(alpha)

    return np.array([
        [ct,      -st,       0,    a      ],
        [st * ca,  ct * ca, -sa,  -d * sa],
        [st * sa,  ct * sa,  ca,   d * ca],
        [0,        0,        0,    1      ],
    ])


def forward_kinematics(arm: RoboticArm) -> Tuple[np.ndarray, List[np.ndarray]]:
    """
    Compute forward kinematics for the whole arm.

    Returns
    -------
    end_effector : np.ndarray, shape (3,)
        World-space position [x, y, z] of the end-effector.

    joint_positions : List[np.ndarray]
        World-space [x, y, z] for every frame origin, including the
        base (index 0) through the end-effector (index n).
    """
    joint_positions = [np.zeros(3)]  # base frame at world origin
    T_total = np.eye(4)

    for joint in arm.joints:
        T_i = dh_transform(joint.a, joint.alpha, joint.d, joint.theta)
        T_total = T_total @ T_i
        joint_positions.append(T_total[:3, 3].copy())

    end_effector = T_total[:3, 3].copy()
    return end_effector, joint_positions
