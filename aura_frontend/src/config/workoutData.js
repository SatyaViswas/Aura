/**
 * @file workoutData.js
 * @description Single source of truth data registry for the Aura fitness platform.
 *   Declares every workout modality, track, sub-section, and individual exercise node
 *   with full schema compliance. Consumed by workout selector, session engine, XP
 *   award system, and WebSocket pose-analyzer routing.
 *
 *   Schema per exercise node:
 *     id              – Unique backend analytical token (kebab-case)
 *     name            – Elegant human-readable label
 *     pose_analyzer   – Boolean; true for gym & calisthenics (CV tracking), false for stretching/yoga
 *     target_reps     – String | number | null  (null when time-based)
 *     target_duration – String | number | null  (null when rep-based)
 *     estimated_xp    – Integer XP award on completion (15–30)
 *     instructions    – Exactly 3 concise, form-focused sentences
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1 · GYM WORKOUTS
// ─────────────────────────────────────────────────────────────────────────────

const gymTracks = [

  // ── 1.1  Push / Pull / Legs ─────────────────────────────────────────────
  {
    id: 'ppl',
    title: 'Push / Pull / Legs',
    subSections: [

      // Push Day
      {
        id: 'push',
        title: 'Push Day',
        exercises: [
          {
            id: 'push-ups',
            name: 'Push-Ups',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Place your hands slightly wider than shoulder-width, forming a rigid plank from head to heel.',
              'Lower your chest toward the floor in a slow, controlled descent, keeping your elbows at roughly 45 degrees.',
              'Press firmly back to the start, exhaling through the effort and squeezing your chest at the top.'
            ]
          },
          {
            id: 'incline-dumbbell-press',
            name: 'Incline Dumbbell Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Set the bench to a 30–45 degree angle, position the dumbbells at shoulder height with a neutral grip.',
              'Press both dumbbells upward along a gentle arc until fully extended, feeling the upper-chest activation.',
              'Lower with complete control, maintaining shoulder blades pinched tightly against the pad.'
            ]
          },
          {
            id: 'incline-barbell-bench-press',
            name: 'Incline Barbell Bench Press',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Set the bar in a rack at a 30–45 degree incline and unrack with a smooth, controlled motion.',
              'Lower the bar to the top of your chest, feeling a full stretch across the upper pectorals.',
              'Drive the bar upward with deliberate power, locking out your arms without losing spinal arch.'
            ]
          },
          {
            id: 'flat-barbell-bench-press',
            name: 'Flat Barbell Bench Press',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Lie flat with your feet rooted to the floor, grip the bar just outside shoulder-width.',
              'Unrack and lower the bar to mid-chest in a slow, deliberate four-count descent.',
              'Press upward with unified force, exhaling sharply as the bar leaves your chest.'
            ]
          },
          {
            id: 'rope-pulldown-chest',
            name: 'Rope Cable Chest Pulldown',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Attach a rope to the high cable pulley and grasp each end with a neutral grip.',
              'With a slight forward lean, pull the rope down and inward, crossing hands slightly at the bottom.',
              'Squeeze the pectorals hard at the bottom position, then return slowly to the top.'
            ]
          },
          {
            id: 'tricep-extension-push-ups',
            name: 'Tricep Extension Push-Ups',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Begin in a narrow push-up stance with hands placed directly under your shoulders.',
              'Keep your elbows close to your sides as you lower your chest toward the floor.',
              'Extend your arms fully on the way up, feeling the long head of the tricep fire through the movement.'
            ]
          },
          {
            id: 'bent-tricep-pull',
            name: 'Bent-Over Tricep Kickback',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Hinge at the hips to roughly 45 degrees, keeping your back flat and core braced.',
              'With your upper arm parallel to the floor, extend the dumbbell back until your arm is fully straight.',
              'Pause at the top for a beat, then lower slowly through the full range of motion.'
            ]
          },
          {
            id: 'tricep-rope-pulldown',
            name: 'Tricep Rope Pulldown',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand facing the high cable with a rope attachment, gripping each end firmly.',
              'Keep your elbows pinned to your sides and push the rope down, splaying the ends outward at the bottom.',
              'Control the ascent fully before beginning the next repetition.'
            ]
          },
          {
            id: 'crunches',
            name: 'Crunches',
            pose_analyzer: true,
            target_reps: '15-20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Lie on your back with knees bent and feet flat, placing fingertips lightly behind your ears.',
              'Curl your shoulders off the floor using your abdominals, not your neck or hip flexors.',
              'Lower back down slowly, maintaining tension throughout the entire set.'
            ]
          },
          {
            id: 'plank',
            name: 'Forearm Plank',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Rest on your forearms and toes, aligning your body in one perfectly straight line.',
              'Brace your core powerfully as if bracing for an impact, keeping your hips level.',
              'Breathe steadily and hold the position with complete stillness until time is up.'
            ]
          }
        ]
      },

      // Pull Day
      {
        id: 'pull',
        title: 'Pull Day',
        exercises: [
          {
            id: 'wide-grip-pull-ups',
            name: 'Wide-Grip Pull-Ups',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Grip the bar wider than shoulder-width with an overhand grip and hang with full arm extension.',
              'Pull your chest toward the bar by driving your elbows down and back, squeezing your lats hard.',
              'Lower yourself with complete control through the eccentric, resisting the pull of gravity.'
            ]
          },
          {
            id: 'neutral-grip-pull-ups',
            name: 'Neutral-Grip Pull-Ups',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Grip the parallel handles with palms facing each other and hang freely with shoulders relaxed.',
              'Drive your elbows toward your hips to pull your chin cleanly above the handles.',
              'Descend slowly and deliberately, feeling the stretch in your lats at the bottom.'
            ]
          },
          {
            id: 'chest-supported-rows',
            name: 'Chest-Supported Dumbbell Rows',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Lie prone on an incline bench set to 30–45 degrees, letting the dumbbells hang below the bench.',
              'Row both dumbbells simultaneously toward your hips, squeezing your shoulder blades together firmly.',
              'Lower back to the start in a slow, controlled motion to maximize lat engagement.'
            ]
          },
          {
            id: 'cable-lat-pulldown',
            name: 'Cable Lat Pulldown',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit at the lat pulldown station, thighs secured under the pads, grip slightly wider than shoulders.',
              'Pull the bar to your upper chest, initiating with your elbows and keeping your torso nearly upright.',
              'Allow the bar to rise in a controlled manner until your arms are fully extended.'
            ]
          },
          {
            id: 'neutral-grip-pulldown',
            name: 'Neutral-Grip Cable Pulldown',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Attach a neutral-grip bar to the high cable and sit with your thighs secured.',
              'Pull the bar toward your upper chest while leaning back slightly for a full lat stretch.',
              'Return to full arm extension slowly, feeling the lats lengthen under tension.'
            ]
          },
          {
            id: 'horizontal-neutral-grip-row',
            name: 'Horizontal Neutral-Grip Cable Row',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit upright at the seated cable row station with a neutral V-bar, feet braced on the platform.',
              'Pull the handle to your lower abdomen, keeping your torso stable and elbows tracking rearward.',
              'Extend your arms fully, allowing a slight shoulder protraction at the front for full range.'
            ]
          },
          {
            id: 'reverse-crunches',
            name: 'Reverse Crunches',
            pose_analyzer: true,
            target_reps: '15-20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Lie on your back with hands flat at your sides, knees bent and feet lifted slightly off the floor.',
              'Pull your knees toward your chest while simultaneously lifting your hips off the floor.',
              'Lower your hips slowly back down without letting your feet touch the ground.'
            ]
          },
          {
            id: 'ezbar-preacher-curls',
            name: 'EZ-Bar Preacher Curls',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Position yourself at the preacher bench, gripping the inner angled handles of the EZ-bar.',
              'Curl the bar toward your face in a smooth arc, squeezing the biceps hard at the peak.',
              'Lower the bar fully until your arms are extended, fighting the eccentric the entire way down.'
            ]
          },
          {
            id: 'incline-dumbbell-curls',
            name: 'Incline Dumbbell Curls',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit back on a 45-degree incline bench with a dumbbell in each hand, arms hanging freely.',
              'Curl both dumbbells upward with a supination motion, feeling the deep bicep stretch at the start.',
              'Lower with full control to the fully extended position before the next rep.'
            ]
          },
          {
            id: 'hammer-curls',
            name: 'Hammer Curls',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand with a dumbbell in each hand, palms facing inward in a neutral hammer grip.',
              'Curl both dumbbells upward while keeping your palms neutral, targeting the brachialis.',
              'Lower slowly with control, maintaining the neutral wrist position throughout.'
            ]
          }
        ]
      },

      // Leg Day
      {
        id: 'legs',
        title: 'Leg Day',
        exercises: [
          {
            id: 'squats',
            name: 'Barbell Back Squat',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Position the bar across your upper traps, brace your core, and unrack with controlled confidence.',
              'Descend until your thighs are at least parallel to the floor, keeping your chest tall and knees tracking over your toes.',
              'Drive through your heels to return to standing, squeezing your glutes powerfully at the top.'
            ]
          },
          {
            id: 'leg-press-close',
            name: 'Leg Press – Close Stance',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit in the leg press with feet placed close together in the center of the platform.',
              'Lower the sled under control until your knees reach approximately 90 degrees.',
              'Press through the entire foot to full extension, stopping short of locking out your knees.'
            ]
          },
          {
            id: 'leg-press-wide',
            name: 'Leg Press – Wide Stance',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Place your feet wide on the platform with toes pointed slightly outward to target the inner thighs.',
              'Lower the sled to a deep range while keeping your lower back flush against the pad.',
              'Press back powerfully, feeling the adductors and glutes engage at full extension.'
            ]
          },
          {
            id: 'leg-press-feet-high',
            name: 'Leg Press – Feet High',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Position your feet high on the platform to shift emphasis toward the hamstrings and glutes.',
              'Lower the sled to a comfortable deep range with a controlled tempo.',
              'Press through your heels, feeling the posterior chain drive the weight upward.'
            ]
          },
          {
            id: 'calf-raises',
            name: 'Standing Calf Raises',
            pose_analyzer: true,
            target_reps: '15-20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand on the edge of a platform with the balls of your feet, heels hanging freely.',
              'Rise as high as possible onto your tiptoes, pausing at the top for a full contraction.',
              'Lower your heels below platform level to achieve the deepest possible stretch.'
            ]
          },
          {
            id: 'chest-supported-shoulder-press',
            name: 'Chest-Supported Shoulder Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Lie prone on an incline bench and hold dumbbells at shoulder height with palms forward.',
              'Press both dumbbells overhead in a smooth, controlled arc until arms are fully extended.',
              'Lower back to shoulder height with a slow, stable descent, keeping your chest on the pad.'
            ]
          },
          {
            id: 'cable-lateral-raises',
            name: 'Cable Lateral Raises',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand sideways to a low cable pulley, grip the handle with the arm farthest from the machine.',
              'Raise your arm out to the side in a wide arc, keeping a slight bend in your elbow.',
              'Lower the cable with full control, resisting the pull all the way back to the start.'
            ]
          },
          {
            id: 'overhead-shoulder-press',
            name: 'Overhead Barbell Press',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Stand or sit with the barbell racked at shoulder height, gripping slightly outside shoulder-width.',
              'Press the bar directly overhead until your elbows are locked, shrugging your traps at the top.',
              'Lower in a controlled path back to the start, keeping your core braced throughout.'
            ]
          },
          {
            id: 'cable-rope-press',
            name: 'Cable Rope Face Pull',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Attach a rope to a mid-height cable and grip each end with a neutral grip at eye level.',
              'Pull the rope toward your face, separating your hands and retracting your shoulder blades.',
              'Pause briefly at the end range, then return the rope slowly with full muscular control.'
            ]
          },
          {
            id: 'front-raises',
            name: 'Dumbbell Front Raises',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand tall with a dumbbell in each hand resting against your thighs, palms facing your body.',
              'Raise both dumbbells forward to shoulder height in a smooth, controlled arc.',
              'Lower back to the starting position with a deliberate tempo, avoiding swinging momentum.'
            ]
          },
          {
            id: 'abs-circuit',
            name: 'Abs Finisher Circuit',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 20,
            instructions: [
              'Move continuously through crunches, reverse crunches, and plank holds without rest.',
              'Maintain steady, rhythmic breathing to fuel the sustained abdominal effort.',
              'Prioritize form over speed, keeping your lower back from arching excessively throughout.'
            ]
          }
        ]
      }
    ]
  },

  // ── 1.2  Upper / Lower ──────────────────────────────────────────────────
  {
    id: 'upperLower',
    title: 'Upper / Lower',
    subSections: [

      // Upper Body
      {
        id: 'upper',
        title: 'Upper Body',
        exercises: [
          {
            id: 'flat-barbell-bench-press',
            name: 'Flat Barbell Bench Press',
            pose_analyzer: true,
            target_reps: '5-6',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Lie flat and plant your feet firmly, creating a slight natural arch in your lower back.',
              'Lower the barbell to mid-chest with a four-second count, feeling the full pec stretch.',
              'Drive the bar upward explosively, maintaining full-body tension throughout the lift.'
            ]
          },
          {
            id: 'incline-dumbbell-press',
            name: 'Incline Dumbbell Press',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Set the bench to 30 degrees and position dumbbells at shoulder height with palms forward.',
              'Press upward and slightly inward, converging the dumbbells above your upper chest.',
              'Lower slowly, feeling the upper chest open fully before the next repetition.'
            ]
          },
          {
            id: 'weighted-pull-ups',
            name: 'Weighted Pull-Ups',
            pose_analyzer: true,
            target_reps: '5-6',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Secure a weight belt or hold a dumbbell between your feet, then grip the bar at shoulder-width.',
              'Pull your chin cleanly above the bar by driving your elbows down with powerful intent.',
              'Lower yourself with complete muscular control, achieving full extension at the bottom.'
            ]
          },
          {
            id: 'barbell-bent-over-row',
            name: 'Barbell Bent-Over Row',
            pose_analyzer: true,
            target_reps: '5-6',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Hinge at the hips to roughly 45 degrees, keeping your spine neutral and core tight.',
              'Pull the barbell toward your lower sternum, leading with your elbows and retracting your scapulae.',
              'Lower the bar back to the start with a controlled tempo, maintaining your hip hinge.'
            ]
          },
          {
            id: 'dumbbell-lateral-raises',
            name: 'Dumbbell Lateral Raises',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand with dumbbells at your sides and a slight bend in your elbows, shoulders relaxed.',
              'Raise both arms outward to shoulder height, leading with your elbows like wings opening.',
              'Lower with resistance, taking twice as long to descend as to raise.'
            ]
          },
          {
            id: 'rear-delt-fly',
            name: 'Rear Delt Fly',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Hinge forward to 45 degrees with a dumbbell in each hand, palms facing each other.',
              'Raise both dumbbells outward and upward in a wide arc, retracting your shoulder blades.',
              'Squeeze the rear delts at the peak and lower in a slow, deliberate arc.'
            ]
          },
          {
            id: 'chest-dips-superset',
            name: 'Chest Dips Superset',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Grip the parallel bars with your torso leaning forward at roughly 30 degrees to target the chest.',
              'Lower until your elbows reach about 90 degrees, feeling the pectoral muscles fully loaded.',
              'Press back to full extension and immediately transition into the next superset movement.'
            ]
          },
          {
            id: 'barbell-curls',
            name: 'Barbell Curls',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Stand tall with an underhand grip on the barbell just outside hip-width.',
              'Curl the bar in a smooth arc, squeezing the biceps hard at the top without swinging.',
              'Lower the bar through the full range with deliberate, controlled resistance.'
            ]
          },
          {
            id: 'incline-dumbbell-curls',
            name: 'Incline Dumbbell Curls',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Recline on a 45-degree bench so your arms hang freely, creating a deep bicep stretch.',
              'Curl both dumbbells with a supination motion, lifting only from the elbow.',
              'Lower fully to the hanging position to exploit the full stretched range every rep.'
            ]
          },
          {
            id: 'tricep-rope-pulldown',
            name: 'Tricep Rope Pulldown',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Grip the cable rope at the high pulley and position your elbows firmly at your sides.',
              'Extend your arms downward, splitting the rope slightly apart at the bottom for full tricep contraction.',
              'Allow the rope to rise with full eccentric control before the next repetition.'
            ]
          }
        ]
      },

      // Lower Body
      {
        id: 'lower',
        title: 'Lower Body',
        exercises: [
          {
            id: 'back-squat',
            name: 'Barbell Back Squat',
            pose_analyzer: true,
            target_reps: '5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Brace your abs and take a measured breath before unracking the loaded barbell.',
              'Descend deliberately, keeping your chest up, knees out, and hip crease below the knee.',
              'Ascend with maximal power, maintaining every point of tension through the lockout.'
            ]
          },
          {
            id: 'leg-press',
            name: 'Leg Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Position your feet hip-width apart at the center of the platform, toes slightly outward.',
              'Lower the sled until your knees form a 90-degree angle without your lower back rounding.',
              'Drive the platform away explosively, stopping short of knee lockout.'
            ]
          },
          {
            id: 'romanian-deadlift',
            name: 'Romanian Deadlift',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Hold a barbell at hip level, pushing your hips back while maintaining a flat, proud chest.',
              'Lower the bar along your legs until you feel a deep, satisfying hamstring stretch.',
              'Drive your hips forward to return to standing, squeezing your glutes powerfully.'
            ]
          },
          {
            id: 'hamstring-curl',
            name: 'Lying Hamstring Curl',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Lie prone on the curl machine with the pad resting just above your heel.',
              'Curl the pad toward your glutes in a smooth, powerful contraction, keeping your hips flat.',
              'Lower the weight with a four-count eccentric, feeling the hamstring lengthening fully.'
            ]
          },
          {
            id: 'standing-calf-raises',
            name: 'Standing Calf Raises',
            pose_analyzer: true,
            target_reps: '15-20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand on the edge of a step or calf raise machine, balls of your feet on the surface.',
              'Rise to maximum height, squeezing your calves at the peak of the movement.',
              'Drop your heels below the platform level for a deep, controlled stretch each rep.'
            ]
          },
          {
            id: 'hip-thrust',
            name: 'Barbell Hip Thrust',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Rest your upper back on a bench and roll a padded barbell over your hips to start.',
              'Drive your hips upward powerfully until your torso is parallel to the floor.',
              'Hold the top for a moment, then lower back down with complete muscular control.'
            ]
          },
          {
            id: 'bulgarian-split-squat',
            name: 'Bulgarian Split Squat',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Place your rear foot on a bench and hold dumbbells at your sides in a split-stance.',
              'Lower your rear knee toward the floor, keeping your front shin vertical and chest tall.',
              'Drive through your front heel to return to standing, feeling the deep glute engagement.'
            ]
          },
          {
            id: 'core-stability',
            name: 'Core Stability Circuit',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Cycle through plank variations including side planks and dead-bug holds without rest.',
              'Maintain steady diaphragmatic breathing, allowing your core to stay fully braced.',
              'Focus on quality of tension over speed, completing the full circuit with perfect form.'
            ]
          }
        ]
      }
    ]
  },

  // ── 1.3  Full Body ──────────────────────────────────────────────────────
  {
    id: 'fullBody',
    title: 'Full Body',
    subSections: [
      {
        id: 'workout',
        title: 'Full Body Workout',
        exercises: [
          {
            id: 'push-ups',
            name: 'Push-Ups',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Place your hands shoulder-width apart and engage your entire body into a rigid plank.',
              'Lower your chest to the floor with a slow two-count, keeping elbows close to your torso.',
              'Press back explosively to full arm extension, locking your scapulae down and back.'
            ]
          },
          {
            id: 'pull-ups',
            name: 'Pull-Ups',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Hang from an overhand grip with fully extended arms and shoulders slightly active.',
              'Pull your chin past the bar by driving your elbows toward your back pockets.',
              'Lower in a slow, controlled descent to full arm extension before your next rep.'
            ]
          },
          {
            id: 'flat-barbell-bench-press',
            name: 'Flat Barbell Bench Press',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Lie flat on the bench, create a slight arch and plant feet firmly on the floor.',
              'Lower the bar to your mid-chest in a controlled four-count descent.',
              'Press upward powerfully, exhaling through the concentric phase until lockout.'
            ]
          },
          {
            id: 'incline-dumbbell-press',
            name: 'Incline Dumbbell Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Set the bench to 30–45 degrees and position dumbbells at shoulder height.',
              'Press both dumbbells upward and inward until arms reach full extension.',
              'Lower with a slow, two-count descent, feeling the upper chest open at the bottom.'
            ]
          },
          {
            id: 'lat-pulldown',
            name: 'Lat Pulldown',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit at the pulldown station with thighs locked under the pad and grip wider than shoulders.',
              'Pull the bar to your upper chest, leading with your elbows and leaning slightly back.',
              'Release the bar with full control until your arms are completely extended.'
            ]
          },
          {
            id: 'chest-supported-rows',
            name: 'Chest-Supported Dumbbell Rows',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Lie prone on an incline bench with dumbbells hanging below your chest.',
              'Row both dumbbells up to your hips simultaneously, squeezing shoulder blades together.',
              'Lower with an intentional, slow eccentric to protect the shoulder joint.'
            ]
          },
          {
            id: 'squats',
            name: 'Barbell Back Squat',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Brace your core and position the bar across your upper traps with a firm grip.',
              'Squat to at least parallel, keeping your knees tracking over your toes and chest tall.',
              'Rise through your heels, squeezing your glutes as you reach full standing extension.'
            ]
          },
          {
            id: 'leg-press',
            name: 'Leg Press',
            pose_analyzer: true,
            target_reps: '12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit in the leg press with feet hip-width apart, centered on the platform.',
              'Lower the sled until your knees approach 90 degrees, back flat against the pad.',
              'Push powerfully through the full foot and extend, stopping short of full knee lockout.'
            ]
          },
          {
            id: 'shoulder-press',
            name: 'Dumbbell Shoulder Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit or stand with dumbbells at shoulder height, elbows at 90 degrees, palms forward.',
              'Press both dumbbells overhead simultaneously until your arms reach full extension.',
              'Lower them back to shoulder level with a controlled, smooth descent.'
            ]
          },
          {
            id: 'barbell-curls',
            name: 'Barbell Curls',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Stand with an underhand grip on the barbell, elbows pinned to your sides.',
              'Curl the bar upward in a smooth arc, focusing on peak bicep contraction.',
              'Lower the bar fully in a slow, measured tempo to maximize the time under tension.'
            ]
          },
          {
            id: 'tricep-rope-pulldown',
            name: 'Tricep Rope Pulldown',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Grip the cable rope at the high pulley, elbows tucked in at your sides.',
              'Extend your arms downward by contracting the triceps, splitting the rope at the bottom.',
              'Return to the start with a slow, resisted eccentric for full tricep development.'
            ]
          },
          {
            id: 'plank',
            name: 'Forearm Plank',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Form a straight line from crown to heels, resting on your forearms and toes.',
              'Draw your navel toward your spine and squeeze every muscle in your body.',
              'Hold this unified tension without allowing your hips to sag or rise.'
            ]
          }
        ]
      }
    ]
  },

  // ── 1.4  Bro-Split ─────────────────────────────────────────────────────
  {
    id: 'broSplit',
    title: 'Bro-Split',
    subSections: [

      // Chest Day
      {
        id: 'chest',
        title: 'Chest Day',
        exercises: [
          {
            id: 'push-ups',
            name: 'Push-Ups',
            pose_analyzer: true,
            target_reps: '15-20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Begin with a warm-up set of push-ups, focusing on smooth, full-range movement.',
              'Lower your chest all the way to the floor and press back up with intention.',
              'Use this set to activate your pecs and prime the chest for heavier loading.'
            ]
          },
          {
            id: 'flat-barbell-bench-press',
            name: 'Flat Barbell Bench Press',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Lie flat, retract your shoulder blades, and grip the bar just outside shoulder-width.',
              'Lower the bar to your sternum in a deliberate descent, feeling the chest fully stretch.',
              'Press the bar upward with a powerful, unified drive through your chest and triceps.'
            ]
          },
          {
            id: 'incline-dumbbell-press',
            name: 'Incline Dumbbell Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Set the bench at 30–45 degrees and position the dumbbells at shoulder height.',
              'Press upward in a smooth arc, focusing the tension in the upper portion of the chest.',
              'Lower slowly, allowing the stretch to fully develop before the next repetition.'
            ]
          },
          {
            id: 'chest-flyes',
            name: 'Dumbbell Chest Flyes',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Lie flat holding dumbbells directly above your chest, with a slight bend in the elbows.',
              'Open your arms wide in a broad arc, lowering until you feel a deep chest stretch.',
              'Bring the dumbbells back together in a controlled, squeezing motion at the top.'
            ]
          },
          {
            id: 'chest-dips',
            name: 'Chest-Forward Dips',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Grip the dip bars and lean your torso forward to shift emphasis to the lower chest.',
              'Lower until your elbows form a 90-degree angle while keeping your legs slightly forward.',
              'Press back to the top, engaging the chest fully throughout the upward push.'
            ]
          }
        ]
      },

      // Back Day
      {
        id: 'back',
        title: 'Back Day',
        exercises: [
          {
            id: 'deadlifts',
            name: 'Conventional Deadlift',
            pose_analyzer: true,
            target_reps: '5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Approach the bar with a hip-width stance, grip just outside your legs, and set a flat back.',
              'Drive the floor away with your legs while keeping the bar in contact with your shins.',
              'Lock out your hips at the top, then lower the bar with absolute control back to the floor.'
            ]
          },
          {
            id: 'weighted-pull-ups',
            name: 'Weighted Pull-Ups',
            pose_analyzer: true,
            target_reps: '6-8',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Attach a weight plate to a belt and grip the bar with an overhand, shoulder-width grip.',
              'Pull your chest toward the bar by initiating with your scapulae and driving your elbows down.',
              'Lower slowly to full extension, resisting the eccentric phase with maximum control.'
            ]
          },
          {
            id: 'chest-supported-rows',
            name: 'Chest-Supported Dumbbell Rows',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Lie prone on an incline bench, dumbbells hanging freely below shoulder level.',
              'Row both dumbbells toward your hips, driving your elbows straight back.',
              'Lower the dumbbells with a measured two-count, keeping your chest pressed to the pad.'
            ]
          },
          {
            id: 'cable-lat-pulldown',
            name: 'Cable Lat Pulldown',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Grip the pulldown bar wider than shoulder-width and lock your thighs under the pads.',
              'Pull the bar to your upper chest with your elbows driving toward the floor.',
              'Extend your arms back to the top slowly, feeling the lats stretch fully at the top.'
            ]
          },
          {
            id: 'neutral-grip-pulldown',
            name: 'Neutral-Grip Pulldown',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Attach a neutral-grip handle to the high pulley and sit in the pulldown station.',
              'Pull the bar to your upper chest with elbows tracking inward and downward.',
              'Extend your arms fully on the way up to achieve maximum lat elongation.'
            ]
          },
          {
            id: 'horizontal-neutral-grip-row',
            name: 'Horizontal Neutral-Grip Row',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit upright at the cable row station with a neutral V-bar and feet flat on the platform.',
              'Pull the handle to your lower abdomen, squeezing your shoulder blades together at the end.',
              'Allow a full forward reach at the front of the movement before the next rep.'
            ]
          },
          {
            id: 'barbell-bent-over-row',
            name: 'Barbell Bent-Over Row',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Hinge at the hips to 45 degrees with a flat back and grip the bar slightly outside hip-width.',
              'Row the bar toward your belly button, retracting your scapulae forcefully at the top.',
              'Lower the bar back to the start with a deliberate, controlled tempo.'
            ]
          },
          {
            id: 'seated-cable-row',
            name: 'Seated Cable Row',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Sit upright at the cable row machine with knees slightly bent and back tall.',
              'Pull the handle into your lower abdomen with elbows tucked close to your ribs.',
              'Extend your arms fully with a slight forward lean before each next pull.'
            ]
          },
          {
            id: 'reverse-crunches',
            name: 'Reverse Crunches',
            pose_analyzer: true,
            target_reps: '15-20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Lie flat on your back, hands beside you, knees bent and feet just off the floor.',
              'Contract your lower abs to curl your knees toward your chest and lift your hips.',
              'Lower back with control, keeping your feet hovering without touching the floor.'
            ]
          }
        ]
      },

      // Arms Day
      {
        id: 'arms',
        title: 'Arms Day',
        exercises: [
          {
            id: 'ezbar-preacher-curls',
            name: 'EZ-Bar Preacher Curls',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Rest your arms on the preacher bench pad and grip the inner curls of the EZ-bar.',
              'Curl the bar upward with a smooth arc, focusing on peak bicep contraction at the top.',
              'Lower the bar to full arm extension to fully stretch the bicep each rep.'
            ]
          },
          {
            id: 'incline-dumbbell-curls',
            name: 'Incline Dumbbell Curls',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Recline on a 45-degree bench with both arms hanging freely to create maximum stretch.',
              'Curl the dumbbells upward with supination, contracting fully at the peak.',
              'Lower under full control to the hanging position for each repetition.'
            ]
          },
          {
            id: 'hammer-curls',
            name: 'Hammer Curls',
            pose_analyzer: true,
            target_reps: '12',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Hold dumbbells in a neutral grip at your sides with elbows pinned to your torso.',
              'Curl both dumbbells upward simultaneously while maintaining the neutral wrist.',
              'Lower deliberately to the full extension position before the next rep.'
            ]
          },
          {
            id: 'tricep-extension-pushups',
            name: 'Tricep Extension Push-Ups',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Take a narrow push-up position with hands directly below your shoulders.',
              'Lower slowly, keeping elbows tightly tucked to your sides throughout the movement.',
              'Press back to the top, feeling the triceps extend powerfully at lockout.'
            ]
          },
          {
            id: 'bent-tricep-pull',
            name: 'Bent-Over Tricep Kickback',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Hinge forward to 45 degrees and brace your upper arm parallel to the floor.',
              'Extend the dumbbell rearward until your arm is fully straight and the tricep is squeezed.',
              'Return to the starting position under full, deliberate control.'
            ]
          },
          {
            id: 'tricep-rope-pulldown',
            name: 'Tricep Rope Pulldown',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Grip the rope attachment at the high cable with elbows at your sides.',
              'Push the rope down and split the ends apart at the bottom to fully contract the tricep.',
              'Allow the rope to return slowly with full eccentric resistance before the next rep.'
            ]
          }
        ]
      },

      // Leg Day (Bro-Split)
      {
        id: 'legs',
        title: 'Leg Day',
        exercises: [
          {
            id: 'back-squat',
            name: 'Barbell Back Squat',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Brace your abs, tighten your lats, and unrack the bar with controlled confidence.',
              'Descend until your thighs are parallel or lower, knees tracking over your toes.',
              'Drive through your heels to ascend powerfully, maintaining a proud chest position.'
            ]
          },
          {
            id: 'leg-press',
            name: 'Leg Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Position your feet hip-width at the center of the platform in the leg press machine.',
              'Lower the sled until your knees are at 90 degrees without your lower back lifting.',
              'Press through your entire foot explosively, avoiding locking out your knees.'
            ]
          },
          {
            id: 'romanian-deadlift',
            name: 'Romanian Deadlift',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Hold the barbell with an overhand grip, standing hip-width apart, back flat.',
              'Hinge at the hips and push them rearward, lowering the bar along your thighs.',
              'Drive the hips forward to the starting position, squeezing your glutes at the top.'
            ]
          },
          {
            id: 'hamstring-curl',
            name: 'Hamstring Curl',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Lie face down on the machine with the pad just above your Achilles tendon.',
              'Curl both legs toward your glutes in a powerful contraction, hips staying flat.',
              'Lower the weight with a measured, slow eccentric for maximum hamstring stimulus.'
            ]
          },
          {
            id: 'standing-calf-raises',
            name: 'Standing Calf Raises',
            pose_analyzer: true,
            target_reps: '20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand on the balls of your feet on a platform edge, heels hanging freely.',
              'Rise to the highest point you can reach, pausing to feel the calf contraction.',
              'Lower your heels below the platform for a full, deep stretch each repetition.'
            ]
          }
        ]
      },

      // Shoulders Day
      {
        id: 'shoulders',
        title: 'Shoulders Day',
        exercises: [
          {
            id: 'chest-supported-shoulder-press',
            name: 'Chest-Supported Shoulder Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Lie prone on an incline bench and hold dumbbells at shoulder level with palms forward.',
              'Press both dumbbells overhead to full extension without arching off the bench.',
              'Lower back to shoulder height with a slow, controlled descent each rep.'
            ]
          },
          {
            id: 'cable-lateral-raises',
            name: 'Cable Lateral Raises',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand with your side to the low cable and grip the handle with the far arm.',
              'Raise your arm in a wide lateral arc to shoulder height, elbows slightly bent.',
              'Lower the cable slowly, resisting the cable pull all the way back to your hip.'
            ]
          },
          {
            id: 'overhead-shoulder-press',
            name: 'Overhead Barbell Press',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Rack the barbell at shoulder height, grip just outside shoulder-width, and brace.',
              'Press the bar upward in a straight vertical path until arms are fully locked out.',
              'Lower back to shoulder level with a controlled descent, keeping core engaged.'
            ]
          },
          {
            id: 'cable-rope-press',
            name: 'Cable Rope Face Pull',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Set the rope attachment at face height on the cable and grip each end with palms inward.',
              'Pull the rope toward your forehead, flaring your elbows wide to target the rear delts.',
              'Return slowly with full tension control before the next repetition.'
            ]
          },
          {
            id: 'front-raises',
            name: 'Dumbbell Front Raises',
            pose_analyzer: true,
            target_reps: '12-15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand with dumbbells at your thighs, palms facing your body, core braced.',
              'Raise both arms forward to shoulder height in a controlled, smooth motion.',
              'Lower with deliberate resistance, avoiding any momentum from your torso.'
            ]
          },
          {
            id: 'seated-overhead-press',
            name: 'Seated Dumbbell Overhead Press',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Sit upright on a bench with back support, dumbbells at shoulder height, palms forward.',
              'Press both dumbbells overhead until arms are fully extended and touch lightly at the top.',
              'Lower back to shoulder height with a smooth two-count descent.'
            ]
          },
          {
            id: 'dumbbell-lateral-raises',
            name: 'Dumbbell Lateral Raises',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand with a dumbbell in each hand at your sides, slight bend in the elbow.',
              'Raise both arms out laterally to shoulder height, leading slightly with the elbows.',
              'Lower in a slow, controlled arc twice as long as the raise.'
            ]
          },
          {
            id: 'rear-delt-fly',
            name: 'Rear Delt Fly',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Hinge forward to 45 degrees with a flat back and a dumbbell in each hand.',
              'Raise both arms outward in a wide arc, squeezing the rear deltoids at the top.',
              'Lower in a slow, deliberate arc to fully restore the starting position.'
            ]
          }
        ]
      }
    ]
  },

  // ── 1.5  Hybrid Split ───────────────────────────────────────────────────
  {
    id: 'hybrid',
    title: 'Hybrid Split',
    subSections: [

      // Strength Upper
      {
        id: 'strengthUpper',
        title: 'Strength Upper',
        exercises: [
          {
            id: 'bench-press-heavy',
            name: 'Heavy Barbell Bench Press',
            pose_analyzer: true,
            target_reps: '3-5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Load the bar to a challenging weight, set your arch, and take a tight, aggressive grip.',
              'Lower the bar under complete control and press explosively off your chest with maximum intent.',
              'Lock out fully and breathe, resetting completely before each heavy single repetition.'
            ]
          },
          {
            id: 'pull-ups-weighted',
            name: 'Weighted Pull-Ups',
            pose_analyzer: true,
            target_reps: '4-6',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Add a weight plate or vest, grip the bar shoulder-width overhand, and hang with control.',
              'Pull your chin above the bar with focused, powerful lat engagement.',
              'Lower fully in a slow eccentric, feeling the full lat stretch at the bottom.'
            ]
          },
          {
            id: 'overhead-press-heavy',
            name: 'Heavy Overhead Press',
            pose_analyzer: true,
            target_reps: '3-5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Load a challenging weight, brace hard, and press the bar from chin to lockout in one smooth movement.',
              'Keep your glutes squeezed and your core rigid to protect the lumbar spine under heavy load.',
              'Lower the bar with full muscular control back to the front rack position.'
            ]
          },
          {
            id: 'battle-ropes',
            name: 'Battle Ropes',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '30s',
            estimated_xp: 20,
            instructions: [
              'Grip both ropes firmly and stand in a quarter-squat athletic position.',
              'Alternate arm slams in a powerful, rhythmic wave motion for the full work interval.',
              'Keep your core braced and hips stable throughout the explosive effort.'
            ]
          }
        ]
      },

      // Strength Lower
      {
        id: 'strengthLower',
        title: 'Strength Lower',
        exercises: [
          {
            id: 'squats-heavy',
            name: 'Heavy Barbell Back Squat',
            pose_analyzer: true,
            target_reps: '3-5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Set up with a challenging load, brace maximally, and take a deliberate, confident descent.',
              'Squat to depth with a stiff, upright torso, knees driving powerfully outward.',
              'Drive through the floor with maximum force to return to lockout on each rep.'
            ]
          },
          {
            id: 'deadlifts-heavy',
            name: 'Heavy Conventional Deadlift',
            pose_analyzer: true,
            target_reps: '3-5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Load a significant weight, take your brace, and engage the bar from the floor.',
              'Push the floor away with your legs while keeping the bar in close contact with your body.',
              'Fully lock out your hips and knees, then lower the bar with controlled reverence.'
            ]
          },
          {
            id: 'box-jumps',
            name: 'Box Jumps',
            pose_analyzer: true,
            target_reps: '5-8',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Stand a foot from the box, dip into a quarter squat, and swing your arms back.',
              'Explode upward from both feet simultaneously, driving your knees toward your chest mid-flight.',
              'Land softly in a quarter squat on the box, fully absorbing the impact, then step down.'
            ]
          },
          {
            id: 'sled-push',
            name: 'Sled Push',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '40s',
            estimated_xp: 25,
            instructions: [
              'Load the sled and grip the handles low with arms extended, body at a forward lean.',
              'Drive through the balls of your feet in powerful, alternating strides.',
              'Maintain your forward lean and keep driving without breaking your stride pattern.'
            ]
          }
        ]
      },

      // Conditioning
      {
        id: 'conditioning',
        title: 'Conditioning',
        exercises: [
          {
            id: 'burpees',
            name: 'Burpees',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Begin standing, then drop your hands to the floor and kick your feet back into a plank.',
              'Perform a push-up, jump your feet forward, and explosively jump upward with hands overhead.',
              'Land softly and immediately flow into the next repetition without pausing.'
            ]
          },
          {
            id: 'mountain-climbers',
            name: 'Mountain Climbers',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '45s',
            estimated_xp: 20,
            instructions: [
              'Start in a high plank with hands under shoulders and your body in a tight straight line.',
              'Drive one knee toward your chest, then quickly switch legs in a running motion.',
              'Keep your hips low and your core fully engaged throughout the entire interval.'
            ]
          },
          {
            id: 'kettlebell-swings',
            name: 'Kettlebell Swings',
            pose_analyzer: true,
            target_reps: '20',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Stand over the kettlebell, hinge at the hips, and grip the handle with both hands.',
              'Hike the bell back between your thighs, then snap your hips forward explosively.',
              'Let the bell float to shoulder height, then guide it back with control into the next hinge.'
            ]
          },
          {
            id: 'high-knees',
            name: 'High Knees',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '45s',
            estimated_xp: 15,
            instructions: [
              'Stand tall with your core braced, arms bent at 90 degrees and ready to pump.',
              'Drive each knee up to hip height in a rapid, alternating running motion in place.',
              'Pump your arms in opposition to your legs to generate maximum rhythmic speed.'
            ]
          },
          {
            id: 'reverse-crunches',
            name: 'Reverse Crunches',
            pose_analyzer: true,
            target_reps: '15-20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Lie flat with hands pressing into the floor beside your hips, legs raised at 90 degrees.',
              'Contract your lower abs and curl your hips off the floor, bringing your knees to your chest.',
              'Lower your hips back slowly without letting your feet touch the ground between reps.'
            ]
          }
        ]
      },

      // Active Recovery
      {
        id: 'recovery',
        title: 'Active Recovery',
        exercises: [
          {
            id: 'light-squats',
            name: 'Light Bodyweight Squats',
            pose_analyzer: true,
            target_reps: '15-20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand with feet shoulder-width, hands clasped at your chest, and move with ease.',
              'Descend slowly into a full squat depth, breathing deeply and restoring movement patterns.',
              'Rise gently, focusing on blood flow and mobility rather than strength output.'
            ]
          },
          {
            id: 'band-pull-aparts',
            name: 'Band Pull-Aparts',
            pose_analyzer: true,
            target_reps: '20',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Hold a resistance band at shoulder height with an overhand grip, arms extended forward.',
              'Pull the band apart horizontally until your arms are fully opened and band touches your chest.',
              'Return slowly to the start, maintaining upright posture and relaxed shoulders.'
            ]
          },
          {
            id: 'plank',
            name: 'Forearm Plank',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '45s',
            estimated_xp: 15,
            instructions: [
              'Rest on your forearms with your body in a neutral, straight line from head to heel.',
              'Focus on slow, diaphragmatic breathing while maintaining light, steady core engagement.',
              'Use this hold to promote blood circulation and central nervous system recovery.'
            ]
          },
          {
            id: 'walking',
            name: 'Steady-State Walking',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '600s',
            estimated_xp: 15,
            instructions: [
              'Walk at a comfortable, conversational pace that keeps your heart rate in a low aerobic zone.',
              'Maintain good posture with your shoulders back, eyes forward, and arms swinging naturally.',
              'Use this time to decompress mentally and allow your body to begin its recovery process.'
            ]
          }
        ]
      }
    ]
  }

];


// ─────────────────────────────────────────────────────────────────────────────
// 2 · CALISTHENICS WORKOUTS
// ─────────────────────────────────────────────────────────────────────────────

const calisthenicsTracks = [

  // ── 2.1  Beginner Full Body ─────────────────────────────────────────────
  {
    id: 'beginner',
    title: 'Beginner Full Body',
    subSections: [
      {
        id: 'fullBody',
        title: 'Full Body Basics',
        exercises: [
          {
            id: 'push-ups',
            name: 'Push-Ups',
            pose_analyzer: true,
            target_reps: '8-12',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Position your hands shoulder-width apart, body forming a straight line in a full plank.',
              'Lower your chest toward the floor keeping your elbows at 45 degrees from your torso.',
              'Press back to the start in one smooth motion, exhaling completely at the top.'
            ]
          },
          {
            id: 'assisted-pull-ups',
            name: 'Assisted Pull-Ups',
            pose_analyzer: true,
            target_reps: '5-8',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Use a band looped around the bar to support your bodyweight in the hanging position.',
              'Pull your chest toward the bar by driving your elbows down, squeezing your back.',
              "Lower slowly under the band's assistance, feeling the lat engagement throughout."
            ]
          },
          {
            id: 'bodyweight-squats',
            name: 'Bodyweight Squats',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand shoulder-width apart with toes pointed slightly outward and arms at your sides.',
              'Sink your hips back and down until your thighs reach parallel, keeping your chest tall.',
              'Drive through your full foot to stand, squeezing your glutes at the top.'
            ]
          },
          {
            id: 'glute-bridges',
            name: 'Glute Bridges',
            pose_analyzer: true,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Lie on your back with knees bent, feet flat on the floor hip-width apart.',
              'Drive your hips upward by squeezing your glutes, creating a straight line from knees to shoulders.',
              'Hold the top position for a breath, then lower your hips slowly back to the floor.'
            ]
          },
          {
            id: 'plank',
            name: 'Forearm Plank',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '30s',
            estimated_xp: 15,
            instructions: [
              'Lower onto your forearms and toes, aligning your body from head to heel.',
              'Draw your belly button toward your spine and squeeze your glutes tightly.',
              'Hold the position with total stillness, breathing steadily for the full duration.'
            ]
          },
          {
            id: 'frog-hold',
            name: 'Frog Hold',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '20s',
            estimated_xp: 15,
            instructions: [
              'Place your hands on the floor, fingers spread wide, and rest your knees on your elbows.',
              'Slowly lean forward, shifting your weight onto your hands until your feet lift gently.',
              'Breathe and balance here, developing wrist strength and body awareness for future skills.'
            ]
          }
        ]
      }
    ]
  },

  // ── 2.2  Intermediate Bodyweight Strength ───────────────────────────────
  {
    id: 'intermediate',
    title: 'Intermediate Bodyweight Strength',
    subSections: [
      {
        id: 'pushPullLegs',
        title: 'Push / Pull / Legs',
        exercises: [
          {
            id: 'archer-pushups',
            name: 'Archer Push-Ups',
            pose_analyzer: true,
            target_reps: '6-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Take a wide push-up stance and shift your weight toward one arm as you descend.',
              'The non-working arm straightens out to the side as you lower, acting as a guide.',
              'Press back to center, alternating sides each repetition for balanced upper-body development.'
            ]
          },
          {
            id: 'dips',
            name: 'Parallel Bar Dips',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Grip the parallel bars and lift yourself to full arm extension with shoulders depressed.',
              'Lower your body until your elbows form a 90-degree angle, leaning slightly forward.',
              'Press back to the top with a focused tricep and chest contraction.'
            ]
          },
          {
            id: 'strict-pullups',
            name: 'Strict Pull-Ups',
            pose_analyzer: true,
            target_reps: '8-10',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Hang from an overhand grip, completely relaxing your lats at the bottom position.',
              'Pull your chin above the bar using only your back and biceps, no kipping.',
              'Lower with total control through the full range of motion each and every repetition.'
            ]
          },
          {
            id: 'australian-rows',
            name: 'Australian Rows (Inverted Rows)',
            pose_analyzer: true,
            target_reps: '10-15',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Hang below a bar with your body straight and heels on the floor, arms fully extended.',
              'Pull your chest to the bar by squeezing your shoulder blades together powerfully.',
              'Lower yourself back to the straight-arm position with a slow, controlled eccentric.'
            ]
          },
          {
            id: 'pistol-progressions',
            name: 'Pistol Squat Progressions',
            pose_analyzer: true,
            target_reps: '5',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Begin with a box or band-assisted single-leg squat to build the neuromuscular pattern.',
              'Lower onto one leg with control, keeping your extended leg straight and arms forward.',
              'Drive through your heel to stand, progressing toward the full freestanding pistol squat.'
            ]
          },
          {
            id: 'nordic-hamstring',
            name: 'Nordic Hamstring Curls',
            pose_analyzer: true,
            target_reps: '5-8',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Anchor your feet under a bar or have a partner hold them, kneeling upright to start.',
              'Lower your torso toward the floor slowly, resisting the descent with your hamstrings.',
              'Catch yourself with your hands, push back to the kneeling position, and repeat.'
            ]
          },
          {
            id: 'hollow-body',
            name: 'Hollow Body Hold',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '30s',
            estimated_xp: 20,
            instructions: [
              'Lie on your back, pressing your lower back firmly into the floor to form a hollow shape.',
              'Raise both arms overhead and both legs off the floor, creating a banana-like curve.',
              'Hold this rigid, compressed position while breathing shallowly and steadily.'
            ]
          }
        ]
      }
    ]
  },

  // ── 2.3  Advanced Calisthenics ──────────────────────────────────────────
  {
    id: 'advanced',
    title: 'Advanced Calisthenics',
    subSections: [
      {
        id: 'skillStrengthSplit',
        title: 'Skill + Strength Split',
        exercises: [
          {
            id: 'one-arm-pushup-progression',
            name: 'One-Arm Push-Up Progression',
            pose_analyzer: true,
            target_reps: '3-5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Begin with an elevated one-arm push-up on a box or bar to reduce the load gradually.',
              'Keep your body perfectly square, core maximally braced, and feet wide for balance.',
              'Lower and press with controlled, deliberate power, progressing toward a full floor version.'
            ]
          },
          {
            id: 'front-lever-progressions',
            name: 'Front Lever Progressions',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '10s',
            estimated_xp: 30,
            instructions: [
              'Hang from a bar and perform the progression appropriate to your current level — tuck to straddle.',
              'Drive your lats hard downward to keep your body parallel to the floor, engaging your entire core.',
              'Hold the position for the target duration, progressing longer holds before advancing to the next stage.'
            ]
          },
          {
            id: 'planche-progressions',
            name: 'Planche Progressions',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '10s',
            estimated_xp: 30,
            instructions: [
              'Begin from the frog stand or planche lean and work through progressions toward tuck planche.',
              'Protract your scapulae forcefully and depress them while leaning forward over your hands.',
              'Hold each progression for the target time with active, full-body tension before progressing.'
            ]
          },
          {
            id: 'weighted-pullups-muscleup',
            name: 'Weighted Pull-Ups & Muscle-Up Complex',
            pose_analyzer: true,
            target_reps: '5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Begin with heavy weighted pull-ups to failure, then strip the weight and continue to muscle-ups.',
              'For the muscle-up, transition explosively from the pull to the dip in one fluid, practiced motion.',
              'Prioritize form over speed, ensuring a clean chest-to-bar pull before each transition.'
            ]
          }
        ]
      }
    ]
  },

  // ── 2.4  Skill Progression ──────────────────────────────────────────────
  {
    id: 'skillProgression',
    title: 'Skill Progression',
    subSections: [

      // Planche Training
      {
        id: 'planche',
        title: 'Planche Training',
        exercises: [
          {
            id: 'frog-hold',
            name: 'Frog Hold',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '30s',
            estimated_xp: 15,
            instructions: [
              'Place your hands flat on the floor, fingers spread, and rest your bent knees on your elbows.',
              'Lean forward, shifting your center of mass over your hands until your feet lift off.',
              'Hold with steady breathing, building wrist strength and core body awareness for the planche path.'
            ]
          },
          {
            id: 'planche-lean',
            name: 'Planche Lean',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '20s',
            estimated_xp: 20,
            instructions: [
              'Get into a push-up position with fingers pointing rearward at your waist level.',
              'Lean your shoulders forward past your hands as far as possible while maintaining a rigid body.',
              'Hold this position to build the shoulder and wrist strength required for the planche.'
            ]
          },
          {
            id: 'pseudo-planche-pushups',
            name: 'Pseudo Planche Push-Ups',
            pose_analyzer: true,
            target_reps: '8-12',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'Place your hands at hip level with fingers pointing backward and lean forward into the planche position.',
              'Perform push-ups from this leaned position, maintaining the forward shoulder lean throughout.',
              'Press back to the top, keeping protraction and forward lean constant for skill transfer.'
            ]
          },
          {
            id: 'tuck-planche-hold',
            name: 'Tuck Planche Hold',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '10s',
            estimated_xp: 25,
            instructions: [
              'From the frog stand, protract your scapulae maximally and lean forward until your hips lift.',
              'Tuck your knees tightly to your chest and hold your entire bodyweight on your hands.',
              'Strive for a body position perfectly parallel to the floor, building the skill incrementally.'
            ]
          },
          {
            id: 'advanced-tuck-straddle',
            name: 'Advanced Tuck to Straddle Planche',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '10s',
            estimated_xp: 30,
            instructions: [
              'From a tuck planche, begin opening your hips to a wider and wider angle as strength allows.',
              'The goal is a straddle with legs spread wide in a horizontal plane, parallel to the floor.',
              'Hold each intermediate position for the target time before opening further.'
            ]
          },
          {
            id: 'planche-pushups',
            name: 'Planche Push-Ups',
            pose_analyzer: true,
            target_reps: '3-5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Hold a tuck or straddle planche and lower your chest toward the floor with complete control.',
              'Press back to the planche position, maintaining protraction and horizontal body alignment.',
              'Each repetition demands maximum proprioceptive focus and full-body muscular engagement.'
            ]
          }
        ]
      },

      // Handstand Training
      {
        id: 'handstand',
        title: 'Handstand Training',
        exercises: [
          {
            id: 'frog-hold-handstand-prep',
            name: 'Frog Hold – Handstand Prep',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '30s',
            estimated_xp: 15,
            instructions: [
              'Establish the frog hold as a wrist and shoulder warm-up before more demanding inversions.',
              'Focus on spreading your fingers wide and feeling equal weight distribution across your palms.',
              'Use this hold to develop the proprioceptive sense of being inverted on your hands.'
            ]
          },
          {
            id: 'wall-handstand',
            name: 'Wall Handstand Hold',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 20,
            instructions: [
              'Kick up into a handstand with your heels resting lightly against a wall for support.',
              'Stack your wrists, elbows, shoulders, and hips in one vertical line.',
              'Engage your core and point your toes, minimizing wall contact as your balance improves.'
            ]
          },
          {
            id: 'hollow-body-hold',
            name: 'Hollow Body Hold',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '30s',
            estimated_xp: 20,
            instructions: [
              'Lie on your back and press your lower back flat into the floor, forming a concave shape.',
              'Raise your legs and arms simultaneously, holding a tight, banana-shaped body position.',
              'This is the exact body shape required for a straight, clean freestanding handstand.'
            ]
          },
          {
            id: 'handstand-pushups',
            name: 'Wall Handstand Push-Ups',
            pose_analyzer: true,
            target_reps: '5-8',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Kick up into a wall handstand and create a stable, aligned base with your hands.',
              'Lower your head toward the floor in a slow, controlled descent, feeling the shoulder loading.',
              'Press powerfully back to full arm extension, maintaining a hollow body position throughout.'
            ]
          },
          {
            id: 'freestanding-handstand',
            name: 'Freestanding Handstand',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '10s',
            estimated_xp: 30,
            instructions: [
              'Kick up away from the wall and find your balance point with fingertip pressure adjustments.',
              'Keep your body in a perfect hollow shape — no arch in your lower back.',
              'Hold the balance for the target duration, finding calm and stillness in the inversion.'
            ]
          }
        ]
      },

      // Front Lever Track
      {
        id: 'frontLever',
        title: 'Front Lever Track',
        exercises: [
          {
            id: 'tuck-front-lever',
            name: 'Tuck Front Lever',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '10s',
            estimated_xp: 25,
            instructions: [
              'Hang from a bar and pull your knees to your chest in a tuck position.',
              'Depress and retract your scapulae, driving your lats hard to bring your body horizontal.',
              'Maintain the tuck tightly, holding your body as close to parallel to the floor as possible.'
            ]
          },
          {
            id: 'advanced-tuck-front-lever',
            name: 'Advanced Tuck Front Lever',
            pose_analyzer: true,
            target_reps: null,
            target_duration: '10s',
            estimated_xp: 30,
            instructions: [
              'From a tuck front lever, extend your hips until your back is flat and horizontal.',
              'Maintain this advanced tuck with maximum lat tension and a completely rigid core.',
              'Progress toward opening your legs further into a full straddle or full front lever position.'
            ]
          }
        ]
      },

      // Muscle-up Pathway
      {
        id: 'muscleup',
        title: 'Muscle-Up Pathway',
        exercises: [
          {
            id: 'false-grip-rows',
            name: 'False Grip Rows',
            pose_analyzer: true,
            target_reps: '10-12',
            target_duration: null,
            estimated_xp: 20,
            instructions: [
              'Establish a false grip by placing the bar in the bend of your wrist, not your fingers.',
              'Perform inverted rows from this false grip, strengthening the specific wrist angle for muscle-ups.',
              'Prioritize grip integrity over volume — the false grip must feel natural before progressing.'
            ]
          },
          {
            id: 'explosive-pullups',
            name: 'Explosive Pull-Ups',
            pose_analyzer: true,
            target_reps: '5-8',
            target_duration: null,
            estimated_xp: 25,
            instructions: [
              'From a dead hang, generate a powerful kip or strict explosive pull to propel your chest above the bar.',
              'Aim to pull high enough that your hips reach the bar level — this is the muscle-up transition zone.',
              'Lower under control and reset completely before the next powerful repetition.'
            ]
          },
          {
            id: 'muscleup-transitions',
            name: 'Muscle-Up Transitions',
            pose_analyzer: true,
            target_reps: '3-5',
            target_duration: null,
            estimated_xp: 30,
            instructions: [
              'Pull explosively and, at the apex of the pull, shift your bodyweight forward over the bar.',
              'Transition from the pull to a dip position in one fluid, practiced motion without hesitation.',
              'Complete the dip to full lockout, then lower yourself with control back to the hanging start.'
            ]
          }
        ]
      }
    ]
  }

];


// ─────────────────────────────────────────────────────────────────────────────
// 3 · STRETCHING & YOGA
// ─────────────────────────────────────────────────────────────────────────────

const stretchingYogaTracks = [

  // ── 3.1  Daily Movement & Mobility ─────────────────────────────────────
  {
    id: 'stretching_daily',
    title: 'Daily Movement & Mobility',
    subSections: [
      {
        id: 'daily_movement',
        title: 'Mobility Routine',
        exercises: [
          {
            id: 'neck-circles',
            name: 'Neck Circles',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Sit or stand tall, allowing your chin to gently fall toward your chest.',
              'Slowly roll your head in a wide, smooth circle clockwise, then counter-clockwise.',
              'Move without forcing any range — allow gravity to guide the motion and release neck tension.'
            ]
          },
          {
            id: 'shoulder-rolls',
            name: 'Shoulder Rolls',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Stand or sit tall with your arms relaxed at your sides and your gaze forward.',
              'Roll both shoulders forward in large, deliberate circles, breathing deeply throughout.',
              'Reverse the direction, rolling them backward and squeezing your shoulder blades at the back.'
            ]
          },
          {
            id: 'arm-circles',
            name: 'Arm Circles',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Extend both arms straight out to your sides at shoulder height.',
              'Make large, controlled circles in the forward direction for 30 seconds.',
              'Reverse the direction for the remaining time, feeling the shoulder joint warm and open.'
            ]
          },
          {
            id: 'spine-wave',
            name: 'Spinal Wave',
            pose_analyzer: false,
            target_reps: '10',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand tall, then begin to articulate your spine by nodding your chin to your chest.',
              'Sequentially roll down, vertebra by vertebra, until you are folded forward comfortably.',
              'Unroll back to standing equally slowly, rebuilding your posture from the sacrum upward.'
            ]
          },
          {
            id: 'thoracic-rotation',
            name: 'Thoracic Spine Rotation',
            pose_analyzer: false,
            target_reps: '10',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Kneel on all fours, placing one hand behind your head and the other flat on the floor.',
              'Rotate your elbow toward the floor and then open it toward the ceiling in a smooth arc.',
              'Keep your hips still and let the movement originate entirely in your thoracic spine.'
            ]
          },
          {
            id: 'hip-cars',
            name: 'Hip CARs (Controlled Articular Rotations)',
            pose_analyzer: false,
            target_reps: '5',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand on one leg and lift the other knee to hip height in front of you.',
              'Slowly move the hip through the largest possible range of motion — forward, to the side, and behind.',
              'Complete full circles in both directions, keeping your standing leg stable and torso upright.'
            ]
          },
          {
            id: 'leg-swings-front',
            name: 'Front-to-Back Leg Swings',
            pose_analyzer: false,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand beside a wall or support, holding it lightly with one hand for balance.',
              'Swing the outside leg forward and backward in a controlled, pendulum-like arc.',
              'Allow the range of motion to gradually increase over the first few swings without forcing it.'
            ]
          },
          {
            id: 'leg-swings-side',
            name: 'Side-to-Side Leg Swings',
            pose_analyzer: false,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Face a wall and rest both hands on it for support, standing on one leg.',
              'Swing the free leg side to side across the front of your body in a horizontal arc.',
              'Let the swinging motion open the hip joint, increasing the range with each swing.'
            ]
          },
          {
            id: 'standing-quad',
            name: 'Standing Quad Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Stand on one leg, bend your other knee, and hold your ankle with the same-side hand.',
              'Draw your heel toward your glute while keeping your knees together and standing tall.',
              'Hold the stretch and breathe deeply, feeling the front of your thigh gradually release.'
            ]
          },
          {
            id: 'kneeling-hip-flexor',
            name: 'Kneeling Hip Flexor Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Step one foot forward into a low lunge with your rear knee resting on the floor.',
              'Shift your weight forward gently, feeling the stretch in the front of your rear hip.',
              'Raise your rear arm overhead and lean slightly away to deepen the iliopsoas stretch.'
            ]
          },
          {
            id: 'hamstring-single',
            name: 'Single-Leg Hamstring Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Sit on the floor with one leg extended forward and the other bent with foot to inner thigh.',
              'Hinge forward at your hips toward your extended leg, keeping your back flat.',
              'Breathe into the hamstring stretch, never rounding your back to reach your foot.'
            ]
          },
          {
            id: 'calf-wall',
            name: 'Standing Calf Stretch Against Wall',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Place your hands on a wall and step one foot back with a straight knee.',
              'Press your rear heel firmly into the floor, feeling the gastrocnemius lengthen.',
              'Hold, then bend the rear knee slightly to target the deeper soleus muscle.'
            ]
          },
          {
            id: 'adductor-side-lunge',
            name: 'Adductor Side Lunge Stretch',
            pose_analyzer: false,
            target_reps: '10',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand wide with toes pointed outward and your hands on your hips or pressed together.',
              'Shift your body weight to one side, bending that knee while keeping the other leg straight.',
              'Feel the inner thigh of the straight leg stretching, then shift slowly to the other side.'
            ]
          },
          {
            id: 'seated-twist',
            name: 'Seated Spinal Twist',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Sit upright with legs extended, then cross one foot over your other knee and plant it.',
              'Twist your torso toward the bent knee, placing the opposite elbow on the outside of it.',
              'Hold the twist and breathe, feeling your thoracic spine rotate and decompress.'
            ]
          },
          {
            id: 'doorway-chest',
            name: 'Doorway Chest Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Stand in a doorway with forearms resting on both sides of the frame at 90 degrees.',
              'Step gently forward with one foot, allowing your chest to open as your arms press back.',
              'Hold the deep pectoral stretch, breathing into your chest to facilitate a greater release.'
            ]
          }
        ]
      }
    ]
  },

  // ── 3.2  Pre-Workout Dynamic Warm-up ────────────────────────────────────
  {
    id: 'stretching_pre',
    title: 'Pre-Workout Dynamic Warm-up',
    subSections: [
      {
        id: 'pre_workout',
        title: 'Dynamic Warm-up',
        exercises: [
          {
            id: 'marching-knee-hugs',
            name: 'Marching Knee Hugs',
            pose_analyzer: false,
            target_reps: '10',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Walk forward, lifting one knee at a time toward your chest and hugging it briefly.',
              'Stand tall on the supporting leg, feeling a light glute and hip flexor activation.',
              'Alternate legs rhythmically, maintaining good posture throughout the movement.'
            ]
          },
          {
            id: 'butt-kicks',
            name: 'Butt Kicks',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s',
            estimated_xp: 15,
            instructions: [
              'Jog in place, kicking your heels up to your glutes on each stride.',
              'Pump your arms in coordination with your legs, maintaining a tall, upright posture.',
              'Focus on the speed of the heel-to-glute contact, increasing the pace gradually.'
            ]
          },
          {
            id: 'leg-swings-dynamic-front',
            name: 'Dynamic Front Leg Swings',
            pose_analyzer: false,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Hold a wall for balance and swing one leg forward and backward in an active pendulum.',
              'Progressively increase the range of the swing with each repetition to warm the hip joint.',
              'Keep your torso upright and your swing leg relaxed, letting momentum drive the movement.'
            ]
          },
          {
            id: 'leg-swings-dynamic-side',
            name: 'Dynamic Side Leg Swings',
            pose_analyzer: false,
            target_reps: '15',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Face a wall with both hands for support and swing one leg across your body side to side.',
              'Allow the range of the lateral swing to increase naturally as the hip warms up.',
              'Keep your swinging foot relaxed and let the motion be driven by the hip joint.'
            ]
          },
          {
            id: 'wgs',
            name: "World's Greatest Stretch",
            pose_analyzer: false,
            target_reps: '5',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Step into a deep forward lunge and place both hands on the floor inside your lead foot.',
              'Rotate your torso and reach the same-side arm toward the ceiling, following with your eyes.',
              'Return to the start and repeat on the other side, moving fluidly through each position.'
            ]
          },
          {
            id: 'inchworm',
            name: 'Inchworm',
            pose_analyzer: false,
            target_reps: '8',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand tall, hinge forward, and walk your hands out until you reach a full push-up position.',
              'Pause briefly in the plank, then walk your feet toward your hands by stepping short.',
              'Return to standing and repeat, feeling the hamstrings and shoulder girdle progressively warm.'
            ]
          },
          {
            id: 'dynamic-lunge-twist',
            name: 'Dynamic Lunge with Twist',
            pose_analyzer: false,
            target_reps: '10',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Step forward into a deep lunge position with your hands behind your head.',
              'Rotate your torso toward the lead knee, opening your chest toward the sky.',
              'Return to standing and alternate legs, keeping the rotation dynamic and flowing.'
            ]
          },
          {
            id: 'arm-swings-cross',
            name: 'Cross-Body Arm Swings',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s',
            estimated_xp: 15,
            instructions: [
              'Stand with feet hip-width apart and swing both arms across your body in a horizontal plane.',
              'Let the arms hug your torso, rotating your shoulders and upper back with the movement.',
              'Swing them wide again and repeat continuously, increasing speed gradually to build heat.'
            ]
          },
          {
            id: 'ankle-circles',
            name: 'Ankle Circles',
            pose_analyzer: false,
            target_reps: '10',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Sit or stand and lift one foot off the floor, supporting your leg at the knee.',
              'Rotate your ankle in large, smooth circles clockwise for 10 repetitions.',
              'Reverse the direction for another 10, then repeat on the opposite ankle.'
            ]
          },
          {
            id: 'hip-openers',
            name: 'Dynamic Hip Openers',
            pose_analyzer: false,
            target_reps: '10',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Stand on one leg and lift the other knee to hip height in front of your body.',
              'Open the knee outward in a wide external rotation, tracing a large circle with your knee.',
              'Bring the foot back down and repeat, alternating legs with smooth, controlled motion.'
            ]
          }
        ]
      }
    ]
  },

  // ── 3.3  Post-Workout Static Stretching ─────────────────────────────────
  {
    id: 'stretching_post',
    title: 'Post-Workout Static Stretching',
    subSections: [
      {
        id: 'post_workout',
        title: 'Cool Down Stretches',
        exercises: [
          {
            id: 'hamstring-stretch',
            name: 'Supine Hamstring Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s each',
            estimated_xp: 15,
            instructions: [
              'Lie on your back and raise one straight leg toward the ceiling, holding behind the thigh.',
              'Gently pull the leg toward you until you feel a comfortable stretch in the back of the thigh.',
              'Breathe deeply into the stretch, allowing the hamstring to release with each exhale.'
            ]
          },
          {
            id: 'quad-stretch',
            name: 'Standing Quad Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s each',
            estimated_xp: 15,
            instructions: [
              'Stand on one leg and pull your opposite heel toward your glute, keeping knees together.',
              'Maintain an upright posture, feeling the front of your thigh deeply stretched.',
              'Hold with steady, unhurried breathing until the muscle fully softens and releases.'
            ]
          },
          {
            id: 'hip-flexor-stretch',
            name: 'Kneeling Hip Flexor Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s each',
            estimated_xp: 15,
            instructions: [
              'Kneel on one knee with the other foot forward in a lunge, hips square and tall.',
              'Gently push your hips forward until you feel the stretch in the front of the rear hip.',
              'Raise your arms overhead to deepen the stretch through the iliopsoas and thoracic spine.'
            ]
          },
          {
            id: 'figure-4',
            name: 'Supine Figure-4 Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s each',
            estimated_xp: 15,
            instructions: [
              'Lie on your back, cross one ankle over the opposite knee to form a figure-4 shape.',
              'Hold behind the straight-leg thigh and gently pull both legs toward your chest.',
              'Feel the glute and piriformis of the crossed leg stretch deeply with each breath.'
            ]
          },
          {
            id: 'forward-fold',
            name: 'Standing Forward Fold',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Stand with feet hip-width, then hinge at the hips and let your torso hang freely.',
              'Allow your knees to soften slightly, letting gravity decompress the spine and stretch the hamstrings.',
              'Let your head and hands hang heavy, releasing any held tension in your upper body.'
            ]
          },
          {
            id: 'calf-stretch',
            name: 'Wall Calf Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s each',
            estimated_xp: 15,
            instructions: [
              'Place both hands on a wall, step one foot back and press the heel firmly into the ground.',
              'Hold the straight-leg position to stretch the gastrocnemius for 30 seconds.',
              'Then bend the back knee slightly to target the deeper soleus for the remaining 30 seconds.'
            ]
          },
          {
            id: 'inner-thigh-stretch',
            name: 'Butterfly Inner Thigh Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Sit on the floor, press the soles of your feet together, and let your knees fall outward.',
              'Hold your ankles and gently lean your torso forward, feeling the inner thighs open.',
              'Breathe into the stretch, using each exhale to sink a little deeper into the pose.'
            ]
          },
          {
            id: 'doorway-chest-post',
            name: 'Doorway Chest Opener',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Stand in a doorframe with forearms resting on each side at shoulder height.',
              'Step one foot through the doorway and let your chest gently fall forward into the opening.',
              'Hold and breathe, feeling the pectorals and anterior deltoids lengthen completely.'
            ]
          },
          {
            id: 'upper-back-stretch',
            name: 'Seated Upper Back Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Sit or stand and clasp your hands in front of you, turning your palms to face outward.',
              'Round your upper back and push your hands forward, separating your shoulder blades.',
              'Hold the stretch, feeling the thoracic muscles and rhomboids open and release.'
            ]
          },
          {
            id: 'triceps-stretch',
            name: 'Overhead Tricep Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Raise one arm overhead, bend the elbow, and let your hand drop behind your shoulder.',
              'Use the opposite hand to gently press the bent elbow further back and down.',
              'Hold the deep tricep and shoulder stretch, breathing calmly until the muscle releases.'
            ]
          },
          {
            id: 'neck-side-stretch',
            name: 'Neck Side Stretch',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Sit tall and gently tilt your head toward one shoulder, ear approaching the shoulder.',
              'Use the same-side hand to apply the lightest possible downward pressure on your head.',
              'Hold and breathe slowly, feeling the lateral neck muscles soften and lengthen.'
            ]
          },
          {
            id: 'lower-back-lean',
            name: 'Supine Lower Back Knees-to-Chest',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Lie flat on your back and draw both knees gently to your chest simultaneously.',
              'Hold behind your knees and rock side to side slowly to massage the lumbar spine.',
              'Allow your entire lower back to soften and release with each calming exhale.'
            ]
          }
        ]
      }
    ]
  },

  // ── 3.4  Yoga Programs ───────────────────────────────────────────────────
  {
    id: 'yoga_flow',
    title: 'Yoga Programs',
    subSections: [
      {
        id: 'beginner_yoga',
        title: 'Beginner Yoga Flow',
        exercises: [
          {
            id: 'tadasana',
            name: 'Tadasana (Mountain Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Stand with feet together, weight evenly distributed, arms at your sides with open palms.',
              'Lengthen through your crown, lift your sternum, and soften your shoulders downward.',
              'Breathe slowly and feel yourself grounded, still, and completely present in this standing meditation.'
            ]
          },
          {
            id: 'vrikshasana',
            name: 'Vrikshasana (Tree Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Stand on one leg and place the sole of your other foot against your inner calf or thigh.',
              'Bring your hands to your heart center or raise them overhead into a full branch shape.',
              'Gaze at a fixed point and breathe softly, finding stillness in the balanced stance.'
            ]
          },
          {
            id: 'trikonasana',
            name: 'Trikonasana (Triangle Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Step feet wide apart and turn one foot out 90 degrees, the other in 15 degrees.',
              'Extend your arms parallel to the floor, then hinge sideways and bring one hand to your shin.',
              'Open your chest and extend the top arm toward the sky, gazing up with a long, open neck.'
            ]
          },
          {
            id: 'utkatasana',
            name: 'Utkatasana (Chair Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s',
            estimated_xp: 15,
            instructions: [
              'Stand with feet together and bend your knees deeply as if sitting back into an imaginary chair.',
              'Raise your arms alongside your ears and lengthen your spine against the gravitational challenge.',
              'Hold the pose with steady breathing, feeling the quads, glutes, and shoulders working as one.'
            ]
          },
          {
            id: 'bhujangasana',
            name: 'Bhujangasana (Cobra Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s',
            estimated_xp: 15,
            instructions: [
              'Lie face down with hands under your shoulders, pressing the tops of your feet into the mat.',
              'Lift your chest by straightening your arms partially, keeping your elbows soft and close to your ribs.',
              'Hold this gentle backbend, breathing into your chest and releasing tension through your spine.'
            ]
          },
          {
            id: 'setu-bandhasana',
            name: 'Setu Bandhasana (Bridge Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Lie on your back, bend your knees, and place your feet hip-width apart close to your glutes.',
              'Press your feet firmly into the mat and lift your hips, interlacing your hands beneath you.',
              'Hold the bridge, feeling your chest open toward your chin as you breathe into the backbend.'
            ]
          },
          {
            id: 'paschimottanasana',
            name: 'Paschimottanasana (Seated Forward Fold)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Sit upright with your legs extended forward and flex your feet, drawing toes toward you.',
              'Inhale to lengthen your spine, then exhale as you hinge forward from your hips.',
              'Rest your hands on your shins or feet, breathing into the deep posterior-chain stretch.'
            ]
          },
          {
            id: 'cat-cow',
            name: 'Cat-Cow (Marjaryasana-Bitilasana)',
            pose_analyzer: false,
            target_reps: '10',
            target_duration: null,
            estimated_xp: 15,
            instructions: [
              'Come to all fours with wrists under shoulders and knees under hips in a neutral spine.',
              'Inhale and drop your belly, lifting your chest and tailbone into a gentle cow position.',
              'Exhale and round your spine toward the ceiling, tucking your chin and tailbone in cat position.'
            ]
          },
          {
            id: 'downward-dog',
            name: 'Adho Mukha Svanasana (Downward Dog)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Press from all fours to an inverted V by straightening your legs and lifting your hips high.',
              'Press your hands into the mat, spreading fingers wide and sending your heels toward the floor.',
              'Let your head hang freely between your arms and breathe long, slow breaths to deepen the stretch.'
            ]
          },
          {
            id: 'child-pose',
            name: "Balasana (Child's Pose)",
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'From kneeling, widen your knees and sink your hips back toward your heels.',
              'Walk your hands forward and let your forehead rest gently on the mat.',
              'Breathe softly into your lower back and hips, surrendering the weight of your body to the earth.'
            ]
          },
          {
            id: 'warrior-1',
            name: 'Virabhadrasana I (Warrior I)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Step one foot forward into a deep lunge, keeping your back foot planted at 45 degrees.',
              'Square your hips forward as much as possible and raise both arms overhead beside your ears.',
              'Hold with a strong, grounded stance and breathe into the power and openness of the pose.'
            ]
          },
          {
            id: 'warrior-2',
            name: 'Virabhadrasana II (Warrior II)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '45s each',
            estimated_xp: 15,
            instructions: [
              'Step your feet wide apart, turn one foot 90 degrees out and the other slightly in.',
              'Bend your front knee directly over your ankle and extend both arms parallel to the floor.',
              'Gaze over your front hand with a calm, focused expression and hold the powerful stance.'
            ]
          },
          {
            id: 'easy-pose',
            name: 'Sukhasana (Easy Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s',
            estimated_xp: 15,
            instructions: [
              'Sit cross-legged on the mat with your spine lengthened and your hands resting on your knees.',
              'Close your eyes softly, relax your shoulders, and allow your breath to become slow and even.',
              'Rest in this comfortable seated position, cultivating a quiet, receptive inner awareness.'
            ]
          },
          {
            id: 'pawanmuktasana',
            name: 'Pawanmuktasana (Wind-Relieving Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '60s each',
            estimated_xp: 15,
            instructions: [
              'Lie on your back and draw one knee into your chest, clasping your hands around your shin.',
              'Gently rock the knee side to side to massage the lower back and release the hip joint.',
              'Breathe deeply into the gentle compression of your abdomen, releasing digestive tension.'
            ]
          },
          {
            id: 'shavasana',
            name: 'Shavasana (Corpse Pose)',
            pose_analyzer: false,
            target_reps: null,
            target_duration: '300s',
            estimated_xp: 15,
            instructions: [
              'Lie flat on your back with legs slightly apart and arms resting away from your body, palms up.',
              'Close your eyes and consciously release every single muscle in your body from foot to forehead.',
              'Rest in complete stillness, breathing naturally and allowing the benefits of the practice to absorb.'
            ]
          }
        ]
      }
    ]
  }

];


// ─────────────────────────────────────────────────────────────────────────────
// ROOT EXPORT — Single source of truth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * workoutData
 * @type {Object}
 * @description Root data registry consumed by the Aura workout selector, session
 *   engine, pose-analyzer router, and XP award system.
 *
 *   Top-level shape:
 *   {
 *     gym:            { modality, title, tracks: [ { id, title, subSections: [ { id, title, exercises } ] } ] }
 *     calisthenics:   { modality, title, tracks: [ ... ] }
 *     stretchingYoga: { modality, title, tracks: [ ... ] }
 *   }
 */
export const workoutData = {

  gym: {
    modality: 'gym',
    title: 'Gym Workouts',
    tracks: gymTracks,
  },

  calisthenics: {
    modality: 'calisthenics',
    title: 'Calisthenics',
    tracks: calisthenicsTracks,
  },

  stretchingYoga: {
    modality: 'stretchingYoga',
    title: 'Stretching & Yoga',
    tracks: stretchingYogaTracks,
  },

};

// Named convenience exports for direct track or modality access
export const gymWorkouts          = workoutData.gym;
export const calisthenicsWorkouts = workoutData.calisthenics;
export const stretchingYogaWorkouts = workoutData.stretchingYoga;

/**
 * Helper: Retrieve a specific sub-section's exercise array by modality, track, and subSection IDs.
 *
 * @param {string} modalityKey   - One of 'gym' | 'calisthenics' | 'stretchingYoga'
 * @param {string} trackId       - The track `id` string (e.g. 'ppl', 'beginner', 'yoga_flow')
 * @param {string} subSectionId  - The subSection `id` string (e.g. 'push', 'fullBody', 'daily_movement')
 * @returns {Array} Array of exercise objects, or empty array if not found.
 */
export function getExercises(modalityKey, trackId, subSectionId) {
  const modality = workoutData[modalityKey];
  if (!modality) return [];
  const track = modality.tracks.find(t => t.id === trackId);
  if (!track) return [];
  const subSection = track.subSections.find(s => s.id === subSectionId);
  return subSection ? subSection.exercises : [];
}

/**
 * Helper: Retrieve a flat list of all exercise IDs across the entire registry.
 * Useful for backend analytical token validation.
 *
 * @returns {string[]} Array of all unique exercise `id` strings.
 */
export function getAllExerciseIds() {
  const ids = new Set();
  Object.values(workoutData).forEach(modality => {
    modality.tracks.forEach(track => {
      track.subSections.forEach(sub => {
        sub.exercises.forEach(ex => ids.add(ex.id));
      });
    });
  });
  return [...ids];
}
