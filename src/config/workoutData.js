export const workoutRegistry = [
  {
    modality: 'gym',
    title: 'Gym Workouts',
    tracks: [
      {
        id: 'push-pull-legs',
        title: 'Push / Pull / Legs',
        exercises: [
          {
            id: 'barbell_bench_press',
            name: 'Barbell Bench Press',
            pose_analyzer: true,
            target_reps: 10,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Lie flat with your feet firmly rooted to the ground.",
              "Lower the bar slowly, feeling the stretch across your chest.",
              "Press upward with controlled, grounded strength."
            ]
          },
          {
            id: 'barbell_rows',
            name: 'Barbell Rows',
            pose_analyzer: true,
            target_reps: 10,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Hinge at the hips, keeping your spine entirely neutral.",
              "Pull the weight toward your center, engaging your back.",
              "Release slowly, maintaining your structural alignment."
            ]
          },
          {
            id: 'squats',
            name: 'Deep Barbell Squat',
            pose_analyzer: true,
            target_reps: 8,
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              "Stand tall, finding your absolute center of balance.",
              "Descend deeply as if sitting, keeping your chest open.",
              "Rise smoothly, drawing energy from the floor."
            ]
          }
        ]
      },
      {
        id: 'upper-lower',
        title: 'Upper / Lower',
        exercises: [
          {
            id: 'overhead_press',
            name: 'Overhead Press',
            pose_analyzer: true,
            target_reps: 8,
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              "Brace your core and stand with quiet confidence.",
              "Press the weight overhead in a smooth, continuous line.",
              "Lower with complete control over the descent."
            ]
          },
          {
            id: 'pullups',
            name: 'Strict Pull-Ups',
            pose_analyzer: true,
            target_reps: 8,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Hang freely, letting tension leave your shoulders.",
              "Pull your chest toward the bar with intention.",
              "Descend slowly, honoring the eccentric phase."
            ]
          },
          {
            id: 'romanian_deadlifts',
            name: 'Romanian Deadlifts',
            pose_analyzer: true,
            target_reps: 10,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Hold the weight close, letting it guide your movement.",
              "Hinge backward until you feel a deep, satisfying stretch.",
              "Return to standing, feeling completely grounded."
            ]
          }
        ]
      },
      {
        id: 'full-body',
        title: 'Full Body',
        exercises: [
          {
            id: 'deadlifts',
            name: 'Conventional Deadlift',
            pose_analyzer: true,
            target_reps: 5,
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              "Approach the bar and find your solid foundation.",
              "Lift smoothly, keeping the bar close to your center.",
              "Return the weight with respect and absolute control."
            ]
          },
          {
            id: 'incline_dumbell_press',
            name: 'Incline Dumbbell Press',
            pose_analyzer: true,
            target_reps: 10,
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              "Set your incline and let your back rest fully.",
              "Press upward, feeling the expansion in your chest.",
              "Lower gently, mindful of the deep stretch."
            ]
          },
          {
            id: 'lunges',
            name: 'Walking Lunges',
            pose_analyzer: true,
            target_reps: 12,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Step forward into a quiet, focused stance.",
              "Drop your back knee smoothly toward the earth.",
              "Rise and transition seamlessly into the next step."
            ]
          }
        ]
      },
      {
        id: 'bro-split',
        title: 'Bro-Split',
        exercises: [
          {
            id: 'bicep_curls',
            name: 'Strict Bicep Curls',
            pose_analyzer: true,
            target_reps: 12,
            target_duration: null,
            estimated_xp: 10,
            instructions: [
              "Keep your elbows tucked and shoulders relaxed.",
              "Curl the weight smoothly, focusing on the muscle.",
              "Lower slowly, feeling the full extension."
            ]
          },
          {
            id: 'tricep_extensions',
            name: 'Overhead Tricep Extensions',
            pose_analyzer: true,
            target_reps: 12,
            target_duration: null,
            estimated_xp: 10,
            instructions: [
              "Extend your arms upward with graceful posture.",
              "Lower the weight behind your head with care.",
              "Press back up, embracing the deep contraction."
            ]
          },
          {
            id: 'lateral_raises',
            name: 'Lateral Raises',
            pose_analyzer: true,
            target_reps: 15,
            target_duration: null,
            estimated_xp: 10,
            instructions: [
              "Stand lightly, letting your arms hang naturally.",
              "Raise the weights outward like quiet wings.",
              "Lower them back down without losing control."
            ]
          }
        ]
      },
      {
        id: 'hybrid-split',
        title: 'Hybrid Split',
        exercises: [
          {
            id: 'kettlebell_swings',
            name: 'Kettlebell Swings',
            pose_analyzer: true,
            target_reps: 20,
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              "Hinge deeply, letting the bell swing back.",
              "Thrust your hips forward, guiding the momentum.",
              "Let the bell float briefly before returning."
            ]
          },
          {
            id: 'front_squats',
            name: 'Front Squats',
            pose_analyzer: true,
            target_reps: 8,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Rack the bar securely across your shoulders.",
              "Descend deeply while keeping your elbows high.",
              "Drive upward, feeling the strength in your core."
            ]
          },
          {
            id: 'farmers_walk',
            name: 'Heavy Farmers Walk',
            pose_analyzer: true,
            target_reps: null,
            target_duration: 60,
            estimated_xp: 25,
            instructions: [
              "Grip the weights firmly, pulling your shoulders back.",
              "Walk forward with deliberate, balanced steps.",
              "Set the weights down gently when finished."
            ]
          }
        ]
      }
    ]
  },
  {
    modality: 'calisthenics',
    title: 'Calisthenics',
    tracks: [
      {
        id: 'beginner-full-body',
        title: 'Beginner Full Body',
        exercises: [
          {
            id: 'pushups',
            name: 'Standard Push-Ups',
            pose_analyzer: true,
            target_reps: 10,
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              "Find a perfect plank, keeping your spine straight.",
              "Lower yourself slowly until your chest hovers.",
              "Push away from the floor, returning to center."
            ]
          },
          {
            id: 'bodyweight_squats',
            name: 'Bodyweight Squats',
            pose_analyzer: true,
            target_reps: 15,
            target_duration: null,
            estimated_xp: 10,
            instructions: [
              "Stand naturally, letting tension leave your neck.",
              "Sink deeply, feeling your weight shift smoothly.",
              "Rise up, connecting with your natural rhythm."
            ]
          },
          {
            id: 'plank',
            name: 'Forearm Plank',
            pose_analyzer: true,
            target_reps: null,
            target_duration: 60,
            estimated_xp: 15,
            instructions: [
              "Rest on your forearms, holding your body in a straight line.",
              "Breathe quietly, letting your core absorb the effort.",
              "Hold the stillness until your time is complete."
            ]
          }
        ]
      },
      {
        id: 'intermediate-strength',
        title: 'Intermediate Bodyweight Strength',
        exercises: [
          {
            id: 'dips',
            name: 'Parallel Bar Dips',
            pose_analyzer: true,
            target_reps: 10,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Support your weight, keeping your shoulders depressed.",
              "Lower yourself gracefully until your elbows bend deeply.",
              "Press back up, feeling the power in your triceps."
            ]
          },
          {
            id: 'pistol_squats',
            name: 'Assisted Pistol Squats',
            pose_analyzer: true,
            target_reps: 5,
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              "Extend one leg forward, keeping it perfectly straight.",
              "Lower into a deep squat on your supporting leg.",
              "Rise slowly, using your balance and quiet strength."
            ]
          },
          {
            id: 'l_sit',
            name: 'Tucked L-Sit Hold',
            pose_analyzer: true,
            target_reps: null,
            target_duration: 30,
            estimated_xp: 20,
            instructions: [
              "Place your hands firmly on the ground or bars.",
              "Lift your body, tucking your knees closely to your chest.",
              "Breathe softly as you hold this hovering balance."
            ]
          }
        ]
      },
      {
        id: 'advanced-calisthenics',
        title: 'Advanced Calisthenics',
        exercises: [
          {
            id: 'muscle_ups',
            name: 'Strict Muscle-Ups',
            pose_analyzer: true,
            target_reps: 5,
            target_duration: null,
            estimated_xp: 40,
            instructions: [
              "Begin with a strong, intentional pull from the bar.",
              "Transition smoothly over the bar in one fluid motion.",
              "Press up completely, locking out with absolute control."
            ]
          },
          {
            id: 'front_lever',
            name: 'Front Lever Hold',
            pose_analyzer: true,
            target_reps: null,
            target_duration: 15,
            estimated_xp: 35,
            instructions: [
              "Hang from the bar, engaging your entire back.",
              "Pull your body parallel to the ground like a rigid board.",
              "Hold the tension quietly, remaining perfectly still."
            ]
          },
          {
            id: 'handstand_pushups',
            name: 'Wall Handstand Push-Ups',
            pose_analyzer: true,
            target_reps: 8,
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              "Kick up into a handstand, finding your vertical line.",
              "Lower yourself slowly until your head lightly touches.",
              "Press the world away, returning to full extension."
            ]
          }
        ]
      },
      {
        id: 'skill-progression',
        title: 'Skill Progression',
        exercises: [
          {
            id: 'frog_stand',
            name: 'Frog Stand Balance',
            pose_analyzer: true,
            target_reps: null,
            target_duration: 45,
            estimated_xp: 15,
            instructions: [
              "Plant your hands wide and rest your knees on your elbows.",
              "Lean forward slowly until your feet float off the floor.",
              "Breathe deeply, balancing entirely on your hands."
            ]
          },
          {
            id: 'skin_the_cat',
            name: 'Skin The Cat',
            pose_analyzer: true,
            target_reps: 5,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Hang freely, then pull your legs up and through your arms.",
              "Lower yourself into a deep, opening shoulder stretch.",
              "Pull back through smoothly, returning to the start."
            ]
          },
          {
            id: 'wall_walks',
            name: 'Wall Walks',
            pose_analyzer: true,
            target_reps: 3,
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              "Start in a plank with your feet touching the wall.",
              "Walk your hands back, climbing your feet up the wall.",
              "Walk slowly back down, maintaining a tight, quiet core."
            ]
          }
        ]
      }
    ]
  },
  {
    modality: 'stretching-yoga',
    title: 'Stretching & Yoga',
    tracks: [
      {
        id: 'daily-mobility',
        title: 'Daily Movement & Mobility',
        exercises: [
          {
            id: 'cat_cow',
            name: 'Cat-Cow Flow',
            pose_analyzer: false,
            target_reps: null,
            target_duration: 60,
            estimated_xp: 10,
            instructions: [
              "Start on all fours, feeling the ground beneath you.",
              "Inhale as you arch your back and open your chest.",
              "Exhale as you round your spine, releasing all tension."
            ]
          },
          {
            id: 'downward_dog',
            name: 'Downward Facing Dog',
            pose_analyzer: false,
            target_reps: null,
            target_duration: 60,
            estimated_xp: 10,
            instructions: [
              "Press your hands firmly into the earth and lift your hips.",
              "Let your heels sink gently toward the floor.",
              "Breathe softly, feeling the deep stretch down your back."
            ]
          },
          {
            id: 'childs_pose',
            name: 'Child\'s Pose',
            pose_analyzer: false,
            target_reps: null,
            target_duration: 60,
            estimated_xp: 10,
            instructions: [
              "Kneel and gently sit back onto your heels.",
              "Reach your arms forward, resting your forehead on the floor.",
              "Let your entire body surrender to gravity."
            ]
          }
        ]
      },
      {
        id: 'pre-workout-warmup',
        title: 'Pre-Workout Dynamic Warm-up',
        exercises: [
          {
            id: 'world_greatest_stretch',
            name: 'World\'s Greatest Stretch',
            pose_analyzer: false,
            target_reps: 10,
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              "Step into a deep lunge, placing your hands inside your foot.",
              "Rotate your torso, reaching one arm high to the sky.",
              "Return smoothly, feeling the mobility in your hips."
            ]
          },
          {
            id: 'arm_circles',
            name: 'Large Arm Circles',
            pose_analyzer: false,
            target_reps: null,
            target_duration: 60,
            estimated_xp: 5,
            instructions: [
              "Stand tall, letting your shoulders relax completely.",
              "Sweep your arms in wide, graceful circles.",
              "Reverse the motion, keeping the movement fluid and free."
            ]
          },
          {
            id: 'leg_swings',
            name: 'Dynamic Leg Swings',
            pose_analyzer: false,
            target_reps: 15,
            target_duration: null,
            estimated_xp: 10,
            instructions: [
              "Hold onto a sturdy surface for gentle balance.",
              "Swing one leg forward and back like a quiet pendulum.",
              "Allow the motion to naturally open your hip joints."
            ]
          }
        ]
      },
      {
        id: 'post-workout-stretch',
        title: 'Post-Workout Static Stretching',
        exercises: [
          {
            id: 'pigeon_pose',
            name: 'Resting Pigeon Pose',
            pose_analyzer: false,
            target_reps: null,
            target_duration: 120,
            estimated_xp: 15,
            instructions: [
              "Fold one leg deeply across the mat in front of you.",
              "Extend the other leg straight back, sinking your hips.",
              "Breathe softly into the tension, allowing it to dissolve."
            ]
          },
          {
            id: 'seated_forward_fold',
            name: 'Seated Forward Fold',
            pose_analyzer: false,
            target_reps: null,
            target_duration: 90,
            estimated_xp: 10,
            instructions: [
              "Sit comfortably with your legs extended straight ahead.",
              "Hinge forward gently, reaching toward your feet.",
              "Let your head hang heavy, resting in the quiet stretch."
            ]
          },
          {
            id: 'supine_twist',
            name: 'Supine Spinal Twist',
            pose_analyzer: false,
            target_reps: null,
            target_duration: 120,
            estimated_xp: 10,
            instructions: [
              "Lie flat on your back, drawing one knee to your chest.",
              "Guide it across your body, extending the opposite arm.",
              "Close your eyes and breathe into the deep, twisting release."
            ]
          }
        ]
      }
    ]
  }
];
