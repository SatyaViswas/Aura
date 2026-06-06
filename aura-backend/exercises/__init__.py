"""
Exercises package - organized by body part category
All exercise coordinate trackers for the fitness application
"""

# Upper body exercises
from .upper_body import (
    BicepCurlCoordinates,
    PushupCoordinates,
    BenchPressCoordinates,
    RopePulldownCoordinates,
    BentTricepPullCoordinates,
    PullupCoordinates,
    ChestSupportedRowCoordinates,
    WideGripPulldownCoordinates,
)

# Chest exercises
from .chest.incline_dumbbell_press import InclineDumbbellPressCoordinates
from .chest.incline_barbell_bench_press import InclineBarbellBenchPressCoordinates
from .chest.flat_barbell_bench_press import FlatBarbellBenchPressCoordinates
from .chest.rope_pulldown_chest import RopePulldownChestCoordinates
from .chest.chest_flyes import ChestFlyesCoordinates
from .chest.chest_dips import ChestDipsCoordinates

# Back exercises
from .back.neutral_grip_pullup import NeutralGripPullupCoordinates
from .back.cable_lat_pulldown import CableLatPulldownCoordinates
from .back.neutral_grip_pulldown import NeutralGripPulldownCoordinates
from .back.horizontal_neutral_grip_row import HorizontalNeutralGripRowCoordinates
from .back.weighted_pullup import WeightedPullupCoordinates
from .back.barbell_bent_over_row import BarbellBentOverRowCoordinates
from .back.lat_pulldown import LatPulldownCoordinates
from .back.seated_cable_row import SeatedCableRowCoordinates
from .back.deadlift import DeadliftCoordinates

# Lower body exercises
from .lower_body import (
    SquatCoordinates,
    LegPressCoordinates,
)
from .lower_body.leg_press_wide_stance import LegPressWideStanceCoordinates
from .lower_body.leg_press_feet_high import LegPressFeetHighCoordinates
from .lower_body.back_squat import BackSquatCoordinates
from .lower_body.romanian_deadlift import RomanianDeadliftCoordinates
from .lower_body.hip_thrust import HipThrustCoordinates
from .lower_body.bulgarian_split_squat import BulgarianSplitSquatCoordinates
from .lower_body.light_squats import LightSquatsCoordinates
from .lower_body.box_jumps import BoxJumpsCoordinates

# Core exercises
from .core import (
    PlankCoordinates,
    CrunchCoordinates,
)

# Shoulder exercises
from .shoulders import (
    ChestSupportedShoulderPressCoordinates,
    OverheadShoulderPressCoordinates,
)
from .shoulders.cable_lateral_raises import CableLateralRaisesCoordinates
from .shoulders.cable_rope_press import CableRopePressCoordinates
from .shoulders.front_raises import FrontRaisesCoordinates
from .shoulders.dumbbell_lateral_raises import DumbbellLateralRaisesCoordinates
from .shoulders.rear_delt_fly import RearDeltFlyCoordinates
from .shoulders.shoulder_press import ShoulderPressCoordinates
from .shoulders.seated_overhead_press import SeatedOverheadPressCoordinates
from .shoulders.cable_rope_face_pull import CableRopeFacePullCoordinates

# Biceps exercises
from .biceps.ez_bar_preacher_curls import EZBarPreacherCurlsCoordinates
from .biceps.incline_dumbbell_curls import InclineDumbbellCurlsCoordinates
from .biceps.hammer_curls import HammerCurlsCoordinates
from .biceps.barbell_curls import BarbellCurlsCoordinates

# Triceps exercises
from .triceps.tricep_extension_pushups import TricepExtensionPushupsCoordinates
from .triceps.tricep_rope_pulldown import TricepRopePulldownCoordinates
from .triceps.tricep_rope_pushdown import TricepRopePushdownCoordinates

__all__ = [
    # Upper body
    'BicepCurlCoordinates',
    'PushupCoordinates',
    'BenchPressCoordinates',
    'RopePulldownCoordinates',
    'BentTricepPullCoordinates',
    'PullupCoordinates',
    'ChestSupportedRowCoordinates',
    'WideGripPulldownCoordinates',
    # Chest
    'InclineDumbbellPressCoordinates',
    'InclineBarbellBenchPressCoordinates',
    'FlatBarbellBenchPressCoordinates',
    'RopePulldownChestCoordinates',
    'ChestFlyesCoordinates',
    'ChestDipsCoordinates',
    # Back
    'NeutralGripPullupCoordinates',
    'CableLatPulldownCoordinates',
    'NeutralGripPulldownCoordinates',
    'HorizontalNeutralGripRowCoordinates',
    'WeightedPullupCoordinates',
    'BarbellBentOverRowCoordinates',
    'LatPulldownCoordinates',
    'SeatedCableRowCoordinates',
    'DeadliftCoordinates',
    # Lower body
    'SquatCoordinates',
    'LegPressCoordinates',
    'LegPressWideStanceCoordinates',
    'LegPressFeetHighCoordinates',
    'BackSquatCoordinates',
    'RomanianDeadliftCoordinates',
    'HipThrustCoordinates',
    'BulgarianSplitSquatCoordinates',
    'LightSquatsCoordinates',
    'BoxJumpsCoordinates',
    # Core
    'PlankCoordinates',
    'CrunchCoordinates',
    # Shoulders
    'ChestSupportedShoulderPressCoordinates',
    'OverheadShoulderPressCoordinates',
    'CableLateralRaisesCoordinates',
    'CableRopePressCoordinates',
    'FrontRaisesCoordinates',
    'DumbbellLateralRaisesCoordinates',
    'RearDeltFlyCoordinates',
    'ShoulderPressCoordinates',
    'SeatedOverheadPressCoordinates',
    'CableRopeFacePullCoordinates',
    # Biceps
    'EZBarPreacherCurlsCoordinates',
    'InclineDumbbellCurlsCoordinates',
    'HammerCurlsCoordinates',
    'BarbellCurlsCoordinates',
    # Triceps
    'TricepExtensionPushupsCoordinates',
    'TricepRopePulldownCoordinates',
    'TricepRopePushdownCoordinates',
]
