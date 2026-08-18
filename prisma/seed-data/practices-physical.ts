import type { PracticeSeed } from "./types";

// The original 33 desk-recovery practices. Prose is unchanged from the first
// build; only the link weights moved to the 0-100 scale. Per-practice posture,
// discreetness and exertion are applied from PHYSICAL_PRACTICE_META below.
export const physicalPractices: PracticeSeed[] = [
  // --- Neck ---
  {
    slug: "neck-mobility-reset",
    name: "Neck Mobility Reset",
    description: "A slow, controlled reset for a stiff or tense neck.",
    instructions:
      "Sit tall. Slowly drop your right ear toward your right shoulder, hold, then roll your chin gently down and across to the left.",
    difficulty: "BEGINNER",
    durationSeconds: 45,
    equipment: "none",
    goals: ["MOBILITY", "REDUCE_PAIN"],
    mechanisms: [{ slug: "neck-flexors", weight: 80 }],
  },
  {
    slug: "chin-tucks",
    name: "Chin Tucks",
    description: "Strengthens the deep neck flexors and corrects forward head posture.",
    instructions:
      "Sit or stand tall. Gently draw your chin straight back, creating a 'double chin', without tilting your head down. Hold briefly, then release.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["PREVENT", "REDUCE_PAIN"],
    mechanisms: [{ slug: "neck-flexors", weight: 80 }],
  },
  {
    slug: "neck-side-stretch",
    name: "Neck Side Stretch",
    description: "Releases tension along the side of the neck.",
    instructions:
      "Sit or stand tall. Tilt your head toward one shoulder, letting the opposite side of your neck stretch. Hold gently, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["REDUCE_PAIN", "MOBILITY"],
    mechanisms: [{ slug: "neck-flexors", weight: 80 }],
  },
  {
    slug: "upper-trap-release",
    name: "Upper Trap Release",
    description: "Targets the muscle that tightens most from stress and screen time.",
    instructions:
      "Sit tall and gently drop one ear toward your shoulder, then use light hand pressure to deepen the stretch. Hold, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["REDUCE_PAIN", "MOBILITY"],
    mechanisms: [{ slug: "levator-scapulae", weight: 80 }, { slug: "upper-back", weight: 45 }],
  },
  {
    slug: "isometric-neck-press",
    name: "Isometric Neck Press",
    description: "Builds neck strength and stability without moving the joint.",
    instructions:
      "Place your palm against your forehead and gently press your head into your hand without letting your head move. Hold, then repeat pressing to each side and the back of your head.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    goals: ["PREVENT"],
    mechanisms: [{ slug: "neck-flexors", weight: 80 }],
  },

  // --- Shoulders ---
  {
    slug: "doorway-chest-opener",
    name: "Doorway Chest Opener",
    description: "Opens tight chest muscles that round the shoulders forward.",
    instructions:
      "Stand in a doorway, forearms on the frame at shoulder height. Lean forward gently until you feel a stretch across your chest and front shoulders.",
    difficulty: "BEGINNER",
    durationSeconds: 45,
    equipment: "doorway",
    goals: ["MOBILITY", "REDUCE_PAIN"],
    mechanisms: [{ slug: "chest", weight: 80 }],
  },
  {
    slug: "shoulder-rolls",
    name: "Shoulder Rolls",
    description: "A warm-up movement that loosens the shoulder girdle and gets blood flowing.",
    instructions:
      "Stand or sit tall. Roll your shoulders up, back, and down in a slow circular motion. After several reps, reverse direction.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["MOBILITY", "ENERGY"],
    mechanisms: [{ slug: "deltoids", weight: 80 }, { slug: "upper-back", weight: 45 }],
  },
  {
    slug: "band-external-rotation",
    name: "Band External Rotation",
    description: "Strengthens the rotator cuff to stabilize the shoulder joint.",
    instructions:
      "Hold a resistance band with elbow tucked at your side, bent 90 degrees. Rotate your forearm outward away from your body, keeping your elbow pinned to your side.",
    difficulty: "INTERMEDIATE",
    durationSeconds: 40,
    equipment: "resistance band",
    goals: ["PREVENT"],
    mechanisms: [{ slug: "rotator-cuff", weight: 80 }],
  },
  {
    slug: "wall-slides",
    name: "Wall Slides",
    description: "Restores overhead mobility and activates the muscles around the shoulder blade.",
    instructions:
      "Stand with your back against a wall, arms bent in a goalpost position touching the wall. Slowly slide your arms upward while keeping contact with the wall, then lower.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "wall",
    goals: ["MOBILITY", "PREVENT"],
    mechanisms: [
      { slug: "upper-back", weight: 80 },
      { slug: "rotator-cuff", weight: 45 },
      { slug: "deltoids", weight: 45 },
    ],
  },
  {
    slug: "pendulum-swing",
    name: "Pendulum Swing",
    description: "A gentle, passive movement to relieve shoulder pain and encourage mobility.",
    instructions:
      "Lean forward slightly, supporting yourself with one hand on a chair. Let your other arm hang loose and gently swing it in small circles, letting gravity do the work.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "chair",
    goals: ["REDUCE_PAIN", "MOBILITY"],
    mechanisms: [{ slug: "rotator-cuff", weight: 80 }, { slug: "deltoids", weight: 45 }],
  },
  {
    slug: "cross-body-shoulder-stretch",
    name: "Cross-Body Shoulder Stretch",
    description: "Stretches the back of the shoulder and upper arm.",
    instructions:
      "Bring one arm across your chest at shoulder height. Use the opposite hand to gently pull it closer. Hold, then switch arms.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["REDUCE_PAIN"],
    mechanisms: [{ slug: "deltoids", weight: 80 }, { slug: "upper-back", weight: 45 }],
  },

  // --- Upper back ---
  {
    slug: "seated-spinal-twist",
    name: "Seated Spinal Twist",
    description: "Restores rotation through a stiff thoracic spine.",
    instructions:
      "Sit sideways in your chair. Twist toward the backrest, holding the far side with both hands. Keep your hips facing forward.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "chair",
    goals: ["MOBILITY", "REDUCE_PAIN"],
    mechanisms: [{ slug: "upper-back", weight: 80 }],
  },
  {
    slug: "wall-angels",
    name: "Wall Angels",
    description: "Trains the mid-back muscles that keep your shoulders from rounding forward.",
    instructions:
      "Stand with your back, head, and arms against a wall, elbows bent 90 degrees. Slowly slide your arms up and down like a snow angel, keeping contact with the wall.",
    difficulty: "INTERMEDIATE",
    durationSeconds: 40,
    equipment: "wall",
    goals: ["PREVENT", "MOBILITY"],
    mechanisms: [{ slug: "upper-back", weight: 80 }, { slug: "rotator-cuff", weight: 45 }],
  },
  {
    slug: "scapular-squeeze",
    name: "Scapular Squeeze",
    description: "Activates the muscles between the shoulder blades to counter rounded posture.",
    instructions:
      "Sit or stand tall with arms relaxed at your sides. Squeeze your shoulder blades together and down, hold briefly, then release. Repeat.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    goals: ["PREVENT"],
    mechanisms: [{ slug: "upper-back", weight: 80 }],
  },
  {
    slug: "thoracic-extension-stretch",
    name: "Thoracic Extension Stretch",
    description: "Counters the forward hunch that builds from hours at a keyboard.",
    instructions:
      "Sit tall, hands laced behind your head. Gently arch your upper back over the top of your chair, opening the chest and lifting the chin slightly. Hold, then release.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "chair",
    goals: ["MOBILITY", "REDUCE_PAIN"],
    mechanisms: [{ slug: "upper-back", weight: 80 }, { slug: "chest", weight: 45 }],
  },
  {
    slug: "cat-cow-stretch",
    name: "Cat-Cow Stretch",
    description: "A gentle flow between spinal flexion and extension that wakes up the whole back.",
    instructions:
      "Start on hands and knees. Inhale, drop your belly and lift your chest and tailbone (cow). Exhale, round your spine toward the ceiling and tuck your chin (cat).",
    difficulty: "BEGINNER",
    durationSeconds: 45,
    equipment: "none",
    goals: ["MOBILITY", "ENERGY"],
    mechanisms: [
      { slug: "upper-back", weight: 80 },
      { slug: "erector-spinae", weight: 45 },
      { slug: "core", weight: 45 },
    ],
  },

  // --- Lower back ---
  {
    slug: "standing-forward-fold",
    name: "Standing Forward Fold",
    description: "Lets gravity release a tight, tense lower back.",
    instructions:
      "Stand, feet hip-width apart. Hinge at the hips and let your upper body hang, knees soft, until you feel your lower back release.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    goals: ["REDUCE_PAIN", "MOBILITY"],
    mechanisms: [{ slug: "hamstrings", weight: 80 }, { slug: "erector-spinae", weight: 45 }],
  },
  {
    slug: "childs-pose",
    name: "Child's Pose",
    description: "A restful stretch that lengthens the low back and hips.",
    instructions:
      "Kneel with big toes touching, knees apart. Sit hips back toward your heels and walk your hands forward, lowering your chest toward the floor.",
    difficulty: "BEGINNER",
    durationSeconds: 45,
    equipment: "none",
    goals: ["REDUCE_PAIN"],
    mechanisms: [{ slug: "erector-spinae", weight: 80 }, { slug: "glutes", weight: 45 }],
  },
  {
    slug: "knee-to-chest-stretch",
    name: "Knee-to-Chest Stretch",
    description: "Releases tension in the low back and hip flexors.",
    instructions:
      "Lie on your back with knees bent. Pull one knee toward your chest with both hands, keeping the other foot flat on the floor. Hold, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["REDUCE_PAIN"],
    mechanisms: [
      { slug: "hip-flexors", weight: 80 },
      { slug: "erector-spinae", weight: 45 },
      { slug: "glutes", weight: 45 },
    ],
  },
  {
    slug: "pelvic-tilts",
    name: "Pelvic Tilts",
    description: "A small, controlled movement that builds core and low-back control.",
    instructions:
      "Lie on your back with knees bent, feet flat. Flatten your low back into the floor by gently engaging your abs and tilting your pelvis, then release.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    goals: ["PREVENT", "REDUCE_PAIN"],
    mechanisms: [{ slug: "core", weight: 80 }, { slug: "erector-spinae", weight: 45 }],
  },
  {
    slug: "bird-dog",
    name: "Bird Dog",
    description: "Builds core and spinal stability by challenging balance.",
    instructions:
      "Start on hands and knees. Extend your right arm and left leg straight out, keeping your hips level and core engaged. Hold, return, then switch sides.",
    difficulty: "INTERMEDIATE",
    durationSeconds: 40,
    equipment: "none",
    goals: ["PREVENT", "ENERGY"],
    mechanisms: [
      { slug: "core", weight: 80 },
      { slug: "erector-spinae", weight: 80 },
      { slug: "glutes", weight: 45 },
    ],
  },
  {
    slug: "glute-bridge",
    name: "Glute Bridge",
    description: "Strengthens the glutes and hamstrings to take load off the low back.",
    instructions:
      "Lie on your back, knees bent, feet flat hip-width apart. Squeeze your glutes and lift your hips until your body forms a straight line from shoulders to knees.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    goals: ["PREVENT", "ENERGY"],
    mechanisms: [
      { slug: "glutes", weight: 80 },
      { slug: "hamstrings", weight: 45 },
      { slug: "erector-spinae", weight: 45 },
    ],
  },

  // --- Hips ---
  {
    slug: "kneeling-hip-flexor-stretch",
    name: "Kneeling Hip Flexor Stretch",
    description: "Lengthens tight hip flexors from prolonged sitting.",
    instructions:
      "Kneel on one knee with the other foot planted in front, both at 90 degrees. Gently shift your weight forward until you feel a stretch at the front of the back hip. Hold, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["REDUCE_PAIN", "MOBILITY"],
    mechanisms: [{ slug: "hip-flexors", weight: 80 }],
  },
  {
    slug: "figure-4-stretch",
    name: "Figure-4 Stretch",
    description: "Releases deep hip rotators and glutes, easing referred hip pain.",
    instructions:
      "Lie on your back, cross one ankle over the opposite knee. Reach through and pull the uncrossed thigh toward your chest until you feel a stretch in the crossed hip. Hold, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["REDUCE_PAIN"],
    mechanisms: [{ slug: "deep-hip-rotators", weight: 80 }, { slug: "glutes", weight: 45 }],
  },
  {
    slug: "butterfly-stretch",
    name: "Butterfly Stretch",
    description: "Opens the inner thighs and hips.",
    instructions:
      "Sit with the soles of your feet together, knees falling out to the sides. Hold your feet and gently press your knees toward the floor, keeping your back straight.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["MOBILITY"],
    mechanisms: [{ slug: "adductors", weight: 80 }],
  },
  {
    slug: "hip-circles",
    name: "Hip Circles",
    description: "A dynamic movement that lubricates the hip joint through its full range.",
    instructions:
      "Stand holding onto something for balance. Lift one knee and draw a slow circle with it, moving through your full comfortable range. Repeat, then switch directions and legs.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    goals: ["MOBILITY", "ENERGY"],
    mechanisms: [{ slug: "hip-flexors", weight: 80 }, { slug: "deep-hip-rotators", weight: 45 }],
  },
  {
    slug: "standing-hip-abduction",
    name: "Standing Hip Abduction",
    description: "Strengthens the muscles on the outside of the hip.",
    instructions:
      "Stand tall holding a wall or chair for balance. Keeping your leg straight, lift it out to the side, then lower with control. Repeat, then switch legs.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    goals: ["PREVENT"],
    mechanisms: [{ slug: "glutes", weight: 80 }],
  },
  {
    slug: "clamshells",
    name: "Clamshells",
    description: "Strengthens the hip stabilizers that support the pelvis.",
    instructions:
      "Lie on your side with knees bent and stacked, hips stacked. Keeping feet together, lift your top knee like a clamshell opening, then lower with control. Repeat, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    goals: ["PREVENT"],
    mechanisms: [{ slug: "glutes", weight: 80 }],
  },

  // --- Wrists ---
  {
    slug: "wrist-forearm-stretch",
    name: "Wrist & Forearm Stretch",
    description: "Stretches both sides of the forearm in one movement.",
    instructions:
      "Extend one arm, palm up. Use the other hand to gently pull the fingers back toward you, then flip and repeat palm down.",
    difficulty: "BEGINNER",
    durationSeconds: 35,
    equipment: "none",
    goals: ["REDUCE_PAIN", "MOBILITY"],
    mechanisms: [
      { slug: "forearm-flexors", weight: 80 },
      { slug: "forearm-extensors", weight: 80 },
    ],
  },
  {
    slug: "wrist-circles",
    name: "Wrist Circles",
    description: "A gentle mobility drill for the wrist joint.",
    instructions:
      "Clasp your hands together or extend your arms and rotate your wrists in slow circles, then reverse direction.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["MOBILITY", "ENERGY"],
    mechanisms: [
      { slug: "forearm-flexors", weight: 80 },
      { slug: "forearm-extensors", weight: 80 },
    ],
  },
  {
    slug: "prayer-stretch",
    name: "Prayer Stretch",
    description: "A classic stretch for both sides of the wrist.",
    instructions:
      "Bring your palms together in front of your chest, fingers pointing up. Slowly lower your hands toward your waist while keeping palms pressed together until you feel a stretch.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    goals: ["REDUCE_PAIN", "MOBILITY"],
    mechanisms: [{ slug: "forearm-flexors", weight: 80 }],
  },
  {
    slug: "wrist-curls",
    name: "Wrist Curls",
    description: "Builds strength and endurance in the wrist flexors.",
    instructions:
      "Hold a light weight (or a filled water bottle) with your forearm resting on a table, palm up. Curl your wrist up, then lower with control. Repeat.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "light weight",
    goals: ["PREVENT"],
    mechanisms: [{ slug: "forearm-flexors", weight: 80 }],
  },
  {
    slug: "reverse-wrist-curls",
    name: "Reverse Wrist Curls",
    description: "Builds strength in the often-neglected wrist extensors.",
    instructions:
      "Hold a light weight with your forearm resting on a table, palm down. Lift your knuckles up toward you, then lower with control. Repeat.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "light weight",
    goals: ["PREVENT"],
    mechanisms: [{ slug: "forearm-extensors", weight: 80 }],
  },
];
