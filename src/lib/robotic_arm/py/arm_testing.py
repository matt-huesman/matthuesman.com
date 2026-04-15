"""
robotic_arm.py
==============
A testing environment for a 7-DOF human-like robotic arm.

Joints modelled after the human arm:
  J0  Shoulder — Flexion / Extension      (sagittal plane)   hinge
  J1  Shoulder — Abduction / Adduction    (frontal plane)    hinge
  J2  Shoulder — Internal/External Rot.   (axial)            hinge
      ↑ together these 3 form the ball-and-socket shoulder
  J3  Elbow   — Flexion / Extension                          hinge
  J4  Forearm — Pronation / Supination                       hinge (pivot)
  J5  Wrist   — Flexion / Extension                          hinge
  J6  Wrist   — Radial / Ulnar Deviation                     hinge

Build order (implement each TODO in sequence):
  1. forward_kinematics()   — FK via DH transform chain
  2. compute_jacobian()     — numerical Jacobian via finite differences
  3. ik_jacobian_transpose()— simplest iterative IK solver
  4. ik_damped_least_squares() — robust IK solver (upgrade from transpose)
  5. PIDController.update() — per-joint PID for animated motion

Run:
  python robotic_arm.py
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.widgets import Slider, Button
from dataclasses import dataclass, field
from typing import List, Tuple, Optional
from enum import Enum


# ─────────────────────────────────────────────────────────────────────────────
# DATA STRUCTURES
# ─────────────────────────────────────────────────────────────────────────────

class JointType(Enum):
    HINGE = "hinge"   # rotation around one axis (revolute)
    # axial rotation (also revolute, different axis convention)
    PIVOT = "pivot"


@dataclass
class Joint:
    """
    Describes one joint in the arm chain.

    DH Parameters (Modified Denavit-Hartenberg convention):
      a      — link length       : distance along x-axis from z_{i-1} to z_i
      alpha  — link twist        : angle around x-axis from z_{i-1} to z_i  (radians)
      d      — link offset       : distance along z-axis from x_{i-1} to x_i
      theta  — joint angle       : rotation around z-axis (this is what we control, radians)

    Joint limits are in DEGREES for human readability; internally converted to radians.
    """
    name:        str
    joint_type:  JointType

    # DH parameters (constant geometry of the link)
    a:     float        # metres — link length
    alpha: float        # radians — link twist
    d:     float        # metres — link offset

    # Joint angle state
    theta:      float   # current angle (radians)
    theta_min:  float   # lower limit   (radians)
    theta_max:  float   # upper limit   (radians)

    # Visual
    color: str = "#4FC3F7"

    @staticmethod
    def from_degrees(name, joint_type, a, alpha_deg, d,
                     theta_deg, min_deg, max_deg, color="#4FC3F7") -> "Joint":
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
        """
        Set all joint angles at once, clamping to joint limits.
        thetas : array of length num_joints, in radians.
        """
        for i, joint in enumerate(self.joints):
            joint.theta = float(
                np.clip(thetas[i], joint.theta_min, joint.theta_max))

    def set_angle(self, index: int, theta_rad: float) -> None:
        """Set a single joint angle (clamped to limits)."""
        j = self.joints[index]
        j.theta = float(np.clip(theta_rad, j.theta_min, j.theta_max))


# ─────────────────────────────────────────────────────────────────────────────
# ARM FACTORY
# ─────────────────────────────────────────────────────────────────────────────

def build_human_arm() -> RoboticArm:
    """
    Constructs a 7-DOF arm with DH parameters and joint limits
    representative of a human arm.

    Segment lengths (approximate, in metres):
      Upper arm : 0.30 m
      Forearm   : 0.25 m
      Hand      : 0.10 m

    Joint limits sourced from clinical range-of-motion literature.

    DH frame assignment follows the Modified DH convention with the
    shoulder root at the world origin, z-axes along each joint rotation axis.

    alpha values place each successive z-axis at 90° to the previous so that
    the three shoulder joints form an orthogonal ball-and-socket cluster,
    and the remaining joints alternate 90° twists to keep the chain planar
    by default (natural resting pose).
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
                            0.10,  0,   0.10,   0,  -25,   35,  "#7E57C2")

    return RoboticArm(joints=[j0, j1, j2, j3, j4, j5, j6])


# ─────────────────────────────────────────────────────────────────────────────
# ── BUILD STEP 1: FORWARD KINEMATICS ─────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────

def dh_transform(a: float, alpha: float, d: float, theta: float) -> np.ndarray:
    """
    Compute a single 4×4 Modified DH homogeneous transform matrix for one joint.

    Modified DH convention:
      T = Rot_x(alpha) · Trans_x(a) · Rot_z(theta) · Trans_z(d)

    Returns a 4×4 numpy array.

    TODO: Implement the Modified DH matrix.
          The matrix encodes both rotation and translation.
          Hint — it has this structure:

              [  cos θ,          -sin θ,          0,        a       ]
              [  sin θ·cos α,     cos θ·cos α,   -sin α,   -d·sin α ]
              [  sin θ·sin α,     cos θ·sin α,    cos α,    d·cos α ]
              [  0,               0,               0,        1      ]
    """
    T = np.eye(4)
    # TODO: fill in T using a, alpha, d, theta

    ct = np.cos(theta)
    st = np.sin(theta)
    ca = np.cos(alpha)
    sa = np.sin(alpha)

    T[0, 0] = ct
    T[0, 1] = -st
    T[0, 3] = a

    T[1, 0] = st * ca
    T[1, 1] = ct * ca
    T[1, 2] = -sa
    T[1, 3] = -d * sa

    T[2, 0] = st * sa
    T[2, 1] = ct * sa
    T[2, 2] = ca
    T[2, 3] = d * ca

    return T


def forward_kinematics(arm: RoboticArm) -> Tuple[np.ndarray, List[np.ndarray]]:
    """
    Compute forward kinematics for the whole arm.

    Returns
    -------
    end_effector : np.ndarray, shape (3,)
        World-space position [x, y, z] of the end-effector (tip of the hand).

    joint_positions : List[np.ndarray]
        World-space [x, y, z] for the origin of every frame, including the
        base (index 0) and end-effector (index n).  Used for rendering.

    TODO: Implement the FK chain.
          1. Start with T_total = I (4×4 identity).
          2. For each joint i, compute T_i = dh_transform(joint.a, joint.alpha,
                                                           joint.d, joint.theta)
          3. Accumulate:  T_total = T_total @ T_i
          4. Extract the origin of the current frame:
                 T_total[:3, 3]  → joint_positions[i+1]
          5. The final origin is the end-effector position.
    """
    joint_positions = [np.zeros(3)]  # base frame at world origin
    end_effector = np.zeros(3)

    # TODO: implement the transform chain
    T_total = np.eye(4)
    for joint in arm.joints:
        T_i = dh_transform(joint.a, joint.alpha, joint.d, joint.theta)
        T_total = T_total @ T_i
        joint_positions.append(T_total[:3, 3])
    end_effector = T_total[:3, 3].copy()

    return end_effector, joint_positions


# ─────────────────────────────────────────────────────────────────────────────
# ── BUILD STEP 2: JACOBIAN ────────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────

def compute_jacobian(arm: RoboticArm, epsilon: float = 1e-5) -> np.ndarray:
    """
    Compute the 3×n positional Jacobian numerically via finite differences.

    Each column j of J answers: "if I nudge joint j by ε radians, how does
    the end-effector position change?"

        J[:, j] = (FK(θ with θ_j + ε) − FK(θ)) / ε

    Parameters
    ----------
    arm     : RoboticArm
    epsilon : small perturbation in radians (default 1e-5)

    Returns
    -------
    J : np.ndarray, shape (3, n)

    TODO: Implement numerical Jacobian.
          1. Run FK at the current angles → baseline end-effector position p0.
          2. For each joint j:
             a. Save θ_j.
             b. Set θ_j += epsilon  (use arm.set_angle — it enforces limits).
             c. Run FK → perturbed position p1.
             d. J[:, j] = (p1 − p0) / epsilon
             e. Restore θ_j.
          3. Return J.
    """
    n = arm.num_joints()
    J = np.zeros((3, n))

    # TODO: implement finite-difference Jacobian
    p0, _ = forward_kinematics(arm)
    for j in range(n):
        original_theta = arm.joints[j].theta
        arm.set_angle(j, original_theta + epsilon)
        p1, _ = forward_kinematics(arm)
        J[:, j] = (p1 - p0) / epsilon
        arm.set_angle(j, original_theta)

    return J


# ─────────────────────────────────────────────────────────────────────────────
# ── BUILD STEP 3: IK — JACOBIAN TRANSPOSE ─────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────

def ik_jacobian_transpose(
    arm:        RoboticArm,
    target:     np.ndarray,
    alpha:      float = 0.5,
    tolerance:  float = 1e-3,
    max_iter:   int = 200,
) -> Tuple[np.ndarray, float]:
    """
    Iterative IK using the Jacobian Transpose method.

    Update rule:
        Δθ = α · Jᵀ · Δp
        θ  = clamp(θ + Δθ, joint_limits)

    This is the simplest approach — stable but slow to converge.
    Good as a first implementation to verify your FK and Jacobian are correct.

    Parameters
    ----------
    arm       : RoboticArm  (modified in-place)
    target    : (3,) target end-effector position in world space
    alpha     : step size / learning rate
    tolerance : stop when |error| < tolerance (metres)
    max_iter  : maximum iterations before giving up

    Returns
    -------
    final_angles : np.ndarray  — joint angles at termination (radians)
    final_error  : float       — Euclidean distance to target at termination

    TODO: Implement the transpose loop.
          1. Loop up to max_iter.
          2. Compute current end-effector via forward_kinematics().
          3. error = target − current_pos.
          4. If np.linalg.norm(error) < tolerance: break.
          5. Compute J = compute_jacobian(arm).
          6. Δθ = alpha * J.T @ error
          7. arm.set_angles(arm.get_angles() + Δθ)
          8. Return (arm.get_angles(), np.linalg.norm(error)).
    """
    final_error = float("inf")

    # TODO: implement transpose IK loop
    for _ in range(max_iter):
        current_pos, _ = forward_kinematics(arm)
        error = target - current_pos
        final_error = np.linalg.norm(error)
        if final_error < tolerance:
            break
        J = compute_jacobian(arm)
        delta_theta = alpha * J.T @ error
        arm.set_angles(arm.get_angles() + delta_theta)

    return arm.get_angles(), final_error


# ─────────────────────────────────────────────────────────────────────────────
# ── BUILD STEP 4: IK — DAMPED LEAST SQUARES ──────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────

def ik_damped_least_squares(
    arm:        RoboticArm,
    target:     np.ndarray,
    damping:    float = 0.05,
    tolerance:  float = 1e-3,
    max_iter:   int = 200,
) -> Tuple[np.ndarray, float]:
    """
    Iterative IK using Damped Least Squares (Levenberg-Marquardt).

    Pseudoinverse with damping:
        J⁺ = Jᵀ · (J·Jᵀ + λ²·I)⁻¹
        Δθ = J⁺ · Δp

    The damping factor λ prevents the step from blowing up near singularities
    (configurations where the arm is fully extended or folded back on itself).

    Parameters
    ----------
    arm      : RoboticArm  (modified in-place)
    target   : (3,) target end-effector position
    damping  : λ — increase if the solver is unstable; decrease for faster convergence
    tolerance: convergence threshold (metres)
    max_iter : maximum iterations

    Returns
    -------
    final_angles : np.ndarray
    final_error  : float

    TODO: Implement DLS IK loop.
          The update step replaces alpha*Jᵀ*error with:
              lam2 = damping ** 2
              Δθ   = J.T @ np.linalg.solve(J @ J.T + lam2 * np.eye(3), error)
          Everything else (loop structure, clamping, termination) is the same
          as ik_jacobian_transpose().
    """
    final_error = float("inf")

    # TODO: implement DLS IK loop
    for _ in range(max_iter):
        current_pos, _ = forward_kinematics(arm)
        error = target - current_pos
        final_error = np.linalg.norm(error)
        if final_error < tolerance:
            break
        J = compute_jacobian(arm)
        lam2 = damping ** 2
        delta_theta = J.T @ np.linalg.solve(J @ J.T + lam2 * np.eye(3), error)
        arm.set_angles(arm.get_angles() + delta_theta)

    return arm.get_angles(), final_error


# ─────────────────────────────────────────────────────────────────────────────
# ── BUILD STEP 5: PID CONTROLLER ─────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────

class PIDController:
    """
    Per-joint PID controller.

    Drives a joint from its current angle toward a target angle each simulation
    tick, producing physically plausible motion (acceleration, overshoot, settling).

    Tuning guide:
      Kp — proportional: increase to speed up response; too high → oscillation.
      Ki — integral    : corrects steady-state error; too high → windup & instability.
      Kd — derivative  : damps oscillation; too high → sluggish response.

    A good starting point for a stiff arm: Kp=10, Ki=0.1, Kd=1.0
    For a compliant / strain-simulating arm: Kp=4, Ki=0.05, Kd=2.0
    """

    def __init__(self, Kp: float = 10.0, Ki: float = 0.1, Kd: float = 1.0):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd

        self._integral:  float = 0.0
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
        output : torque / velocity command to apply to the joint

        TODO: Implement PID update.
              1. error      = target − current
              2. _integral += error * dt
              3. derivative = (error − _prev_error) / dt  if _prev_error is not None else 0
              4. _prev_error = error
              5. return Kp*error + Ki*_integral + Kd*derivative

              Optional enhancements (implement after the basics work):
                • Integral windup clamp: clip _integral to ±windup_limit
                • Derivative filter: low-pass filter the derivative term to
                  reduce noise amplification
        """
        # TODO: implement PID update
        error = target - current
        self._integral += error * dt
        derivative = (error - self._prev_error) / \
            dt if self._prev_error is not None else 0.0
        self._prev_error = error
        return self.Kp * error + self.Ki * self._integral + self.Kd * derivative


# ─────────────────────────────────────────────────────────────────────────────
# VISUALISER
# ─────────────────────────────────────────────────────────────────────────────

SLIDER_COLOR = "#1E1E2E"
BACKGROUND = "#0D0D1A"
PANEL_COLOR = "#13131F"
ACCENT = "#4FC3F7"
TEXT_COLOR = "#E0E0E0"


def _apply_dark_style(fig: plt.Figure, ax: plt.Axes) -> None:
    fig.patch.set_facecolor(BACKGROUND)
    ax.set_facecolor(BACKGROUND)
    ax.tick_params(colors=TEXT_COLOR, labelsize=7)
    for spine in ax.spines.values():
        spine.set_color("#2A2A3E")
    ax.xaxis.label.set_color(TEXT_COLOR)
    ax.yaxis.label.set_color(TEXT_COLOR)
    ax.zaxis.label.set_color(TEXT_COLOR)
    ax.title.set_color(ACCENT)


def render_arm(arm: RoboticArm) -> None:
    """
    Launch an interactive matplotlib window with:
      • 3D arm rendering (updates live as sliders move)
      • One slider per joint (degrees)
      • Joint type and limit labels
      • A 'Reset' button
    """

    fig = plt.figure(figsize=(16, 9), facecolor=BACKGROUND)
    fig.canvas.manager.set_window_title("Robotic Arm — IK Test Environment")

    # ── 3D Axes ───────────────────────────────────────────────────────────────
    ax3d = fig.add_axes([0.00, 0.05, 0.60, 0.90], projection="3d")
    # side-on: screen X = world X, screen Y = world Z
    ax3d.view_init(elev=0, azim=-90)
    ax3d.disable_mouse_rotation()       # prevent dragging from breaking the mapping
    _apply_dark_style(fig, ax3d)
    ax3d.set_title("Robotic Arm  (7-DOF Human-Like)",
                   pad=10, fontsize=11, fontweight="bold")

    # ── Slider panel ──────────────────────────────────────────────────────────
    n = arm.num_joints()
    slider_axes = []
    sliders = []
    slider_height = 0.07
    slider_gap = 0.02
    panel_top = 0.95
    panel_left = 0.63
    panel_width = 0.35

    for i, joint in enumerate(arm.joints):
        y_bottom = panel_top - (i + 1) * (slider_height + slider_gap)

        # label above slider
        label_ax = fig.add_axes([panel_left, y_bottom + slider_height * 0.55,
                                 panel_width, 0.018])
        label_ax.axis("off")
        label_ax.set_facecolor(BACKGROUND)
        lo_deg = np.degrees(joint.theta_min)
        hi_deg = np.degrees(joint.theta_max)
        label_ax.text(
            0, 0.5,
            f"J{i}  {joint.name}  ({joint.joint_type.value})   "
            f"[{lo_deg:.0f}° → {hi_deg:.0f}°]",
            va="center", ha="left",
            color=joint.color, fontsize=7.5, fontweight="bold",
            fontfamily="monospace",
        )

        # slider
        s_ax = fig.add_axes([panel_left, y_bottom, panel_width, slider_height * 0.45],
                            facecolor=SLIDER_COLOR)
        slider = Slider(
            ax=s_ax,
            label="",
            valmin=lo_deg,
            valmax=hi_deg,
            valinit=np.degrees(joint.theta),
            color=joint.color,
        )
        slider.label.set_color(TEXT_COLOR)
        slider.valtext.set_color(joint.color)
        slider.valtext.set_fontsize(8)
        slider_axes.append(s_ax)
        sliders.append(slider)

    # ── Reset button ──────────────────────────────────────────────────────────
    reset_ax = fig.add_axes([panel_left + panel_width * 0.35,
                             0.02, panel_width * 0.30, 0.04])
    reset_btn = Button(reset_ax, "Reset", color="#1A1A2E",
                       hovercolor="#2A2A4E")
    reset_btn.label.set_color(ACCENT)
    reset_btn.label.set_fontsize(9)

    # Toggle cursor tracking
    def toggle_cursor_tracking(event):
        if event.inaxes == ax3d:
            if ax3d.get_cursor_data() is None:
                ax3d.set_cursor_data(event.xdata, event.ydata)
            else:
                ax3d.set_cursor_data(None)

    # ── Status text ───────────────────────────────────────────────────────────
    status_ax = fig.add_axes([panel_left, 0.01, panel_width, 0.04])
    status_ax.axis("off")
    status_ax.set_facecolor(BACKGROUND)
    status_text = status_ax.text(
        0, 0.5, "End-effector: FK not yet implemented",
        va="center", ha="left",
        color=TEXT_COLOR, fontsize=8, fontfamily="monospace",
    )

    # ─────────────────────────────────────────────────────────────────────────
    # DRAW FUNCTION
    # ─────────────────────────────────────────────────────────────────────────
    REST_POSE = np.radians([0, 0, 0, 90, 0, 0, 0])

    def draw_arm(cursor_pos=None):
        arm.set_angles(REST_POSE)   # ← add this line before the IK call
        target_pos = np.array(
            cursor_pos if cursor_pos is not None else [0.3, 0.0, 0.3])
        ik_damped_least_squares(arm, target=target_pos)

        end_pos, joint_positions = forward_kinematics(arm)

        ax3d.cla()
        _apply_dark_style(fig, ax3d)
        ax3d.set_title("Robotic Arm  (7-DOF Human-Like)", pad=10,
                       fontsize=11, fontweight="bold")

        # end_pos, joint_positions = forward_kinematics(arm)

        # ── Draw links ───────────────────────────────────────────────────────
        if len(joint_positions) > 1:
            for i in range(len(joint_positions) - 1):
                p0 = joint_positions[i]
                p1 = joint_positions[i + 1]
                color = arm.joints[min(i, n - 1)].color
                # link tube
                ax3d.plot(
                    [p0[0], p1[0]], [p0[1], p1[1]], [p0[2], p1[2]],
                    color=color, linewidth=4, alpha=0.85, solid_capstyle="round",
                )
                # shadow (projection onto z=0 plane)
                ax3d.plot(
                    [p0[0], p1[0]], [p0[1], p1[1]], [0, 0],
                    color="#222233", linewidth=2, alpha=0.4,
                )

        # ── Draw joints ───────────────────────────────────────────────────────
        for i, pos in enumerate(joint_positions):
            is_end = (i == len(joint_positions) - 1)
            color = arm.joints[min(i, n - 1)].color if i < n else ACCENT
            size = 120 if is_end else 60
            marker = "*" if is_end else "o"
            ax3d.scatter(*pos, c=color, s=size, marker=marker,
                         zorder=5, edgecolors="white", linewidths=0.5)

        # ── Draw world-origin axes ─────────────────────────────────────────
        origin_len = 0.06
        ax3d.quiver(0, 0, 0, origin_len, 0, 0, color="#EF5350",
                    linewidth=1.5, arrow_length_ratio=0.3)
        ax3d.quiver(0, 0, 0, 0, origin_len, 0, color="#66BB6A",
                    linewidth=1.5, arrow_length_ratio=0.3)
        ax3d.quiver(0, 0, 0, 0, 0, origin_len, color="#4FC3F7",
                    linewidth=1.5, arrow_length_ratio=0.3)
        ax3d.text(origin_len * 1.2, 0, 0, "X", color="#EF5350", fontsize=7)
        ax3d.text(0, origin_len * 1.2, 0, "Y", color="#66BB6A", fontsize=7)
        ax3d.text(0, 0, origin_len * 1.2, "Z", color="#4FC3F7", fontsize=7)

        # ── Axis limits / labels ──────────────────────────────────────────────
        reach = 0.75          # max arm reach in metres
        ax3d.set_xlim(-reach, reach)
        ax3d.set_ylim(-reach, reach)
        ax3d.set_zlim(-0.1,   reach)
        ax3d.set_xlabel("X (m)", labelpad=4, fontsize=8)
        ax3d.set_ylabel("Y (m)", labelpad=4, fontsize=8)
        ax3d.set_zlabel("Z (m)", labelpad=4, fontsize=8)

        # At the top of draw_arm, store cursor_pos as a default arg
        target_pos = np.array(
            cursor_pos if cursor_pos is not None else [0.3, 0.0, 0.3])
        ...
        # After drawing joints, add the target marker:
        ax3d.scatter(*target_pos, c="#FF4081", s=80, marker="x",
                     zorder=6, linewidths=2, label="Target")

        # ── Grid plane ────────────────────────────────────────────────────────
        grid_vals = np.linspace(-reach, reach, 6)
        for v in grid_vals:
            ax3d.plot([v, v], [-reach, reach], [0, 0],
                      color="#1A1A2E", linewidth=0.5, alpha=0.5)
            ax3d.plot([-reach, reach], [v, v], [0, 0],
                      color="#1A1A2E", linewidth=0.5, alpha=0.5)

        # ── Legend ────────────────────────────────────────────────────────────
        legend_handles = [
            mpatches.Patch(color=j.color, label=f"J{i}  {j.name}")
            for i, j in enumerate(arm.joints)
        ]
        ax3d.legend(
            handles=legend_handles, loc="upper left",
            fontsize=6.5, facecolor="#0D0D1A",
            labelcolor=TEXT_COLOR, edgecolor="#2A2A3E",
            framealpha=0.9,
        )

        # ── Status update ─────────────────────────────────────────────────────
        ep = end_pos
        status_text.set_text(
            f"End-effector  x={ep[0]:+.3f}  y={ep[1]:+.3f}  z={ep[2]:+.3f} m")

        fig.canvas.draw_idle()

    # ─────────────────────────────────────────────────────────────────────────
    # CALLBACKS
    # ─────────────────────────────────────────────────────────────────────────

    def on_slider_change(_):
        for i, slider in enumerate(sliders):
            arm.set_angle(i, np.radians(slider.val))
        draw_arm()

    MAX_REACH = 0.58   # just under total arm length (0.30 + 0.25 + 0.10)
    MIN_REACH = 0.15   # prevents collapse when cursor is too close to origin

    def on_cursor_move(event):
        if event.inaxes != ax3d:
            return

        bbox = ax3d.get_window_extent()
        t = (event.x - bbox.x0) / bbox.width
        u = (event.y - bbox.y0) / bbox.height

        x0, x1 = ax3d.get_xlim()
        z0, z1 = ax3d.get_zlim()
        world_x = x0 + t * (x1 - x0)
        world_z = z0 + u * (z1 - z0)

        target = np.array([world_x, 0.0, world_z])

        # Clamp to reachable shell — no NaN, no collapse
        dist = np.linalg.norm(target)
        if dist > MAX_REACH:
            target = target / dist * MAX_REACH
        elif dist < MIN_REACH and dist > 0:
            target = target / dist * MIN_REACH

        draw_arm(cursor_pos=tuple(target))

    def on_reset(_):
        default_degrees = [0, 0, 0, 90, 0, 0, 0]
        for i, (slider, deg) in enumerate(zip(sliders, default_degrees)):
            slider.set_val(deg)           # triggers on_slider_change

    for s in sliders:
        s.on_changed(on_slider_change)
    reset_btn.on_clicked(on_reset)

    fig.canvas.mpl_connect('motion_notify_event', on_cursor_move)

    # Initial render
    draw_arm()
    plt.show()


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Building 7-DOF human-like robotic arm …")
    arm = build_human_arm()

    print(f"  Joints  : {arm.num_joints()}")
    for i, j in enumerate(arm.joints):
        lo = np.degrees(j.theta_min)
        hi = np.degrees(j.theta_max)
        print(f"  J{i}  {j.name:<30s}  type={j.joint_type.value:<6s}  "
              f"limits=[{lo:+.0f}°, {hi:+.0f}°]  "
              f"init={np.degrees(j.theta):+.0f}°")

    print("\nLaunching visualiser …  (implement dh_transform + forward_kinematics to see the arm)")
    render_arm(arm)
