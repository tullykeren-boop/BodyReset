export type GoalSeed = "REDUCE_PAIN" | "PREVENT" | "MOBILITY" | "ENERGY";
export type DifficultySeed = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export const bodyAreas = [
  {
    slug: "neck",
    name: "Neck",
    description: "Release tightness and rebuild control in the cervical spine.",
    sortOrder: 1,
  },
  {
    slug: "shoulders",
    name: "Shoulders",
    description: "Restore mobility and stability across the rotator cuff and deltoids.",
    sortOrder: 2,
  },
  {
    slug: "upper-back",
    name: "Upper back",
    description: "Counter the round-shouldered slump that builds through long meeting blocks.",
    sortOrder: 3,
  },
  {
    slug: "lower-back",
    name: "Lower back",
    description: "Ease tension and build resilience through the lumbar spine, hips, and core.",
    sortOrder: 4,
  },
  {
    slug: "wrists",
    name: "Wrists",
    description: "Relieve strain from typing and mousing all day.",
    sortOrder: 5,
  },
  {
    slug: "hips",
    name: "Hips",
    description: "Open tight hip flexors and strengthen the glutes that support them.",
    sortOrder: 6,
  },
] as const;

export const muscleGroups = [
  { slug: "erector-spinae", name: "Erector Spinae", description: "The muscles running along the spine that support upright posture." },
  { slug: "glutes", name: "Glutes", description: "The hip extensor muscles that stabilize the pelvis and lower back." },
  { slug: "hamstrings", name: "Hamstrings", description: "The back-of-thigh muscles that extend the hip and flex the knee." },
  { slug: "hip-flexors", name: "Hip Flexors", description: "The muscles at the front of the hip that lift the leg and tilt the pelvis." },
  { slug: "core", name: "Core / Abdominals", description: "The deep trunk muscles that stabilize the spine and pelvis." },
  { slug: "rotator-cuff", name: "Rotator Cuff", description: "The small muscles that stabilize and rotate the shoulder joint." },
  { slug: "upper-back", name: "Upper Back / Trapezius", description: "The muscles between the shoulder blades that support posture." },
  { slug: "chest", name: "Chest", description: "The pectoral muscles, often tight from forward posture." },
  { slug: "deltoids", name: "Deltoids", description: "The muscles capping the shoulder that drive arm movement." },
  { slug: "neck-flexors", name: "Neck Flexors & Extensors", description: "The muscles that support and move the cervical spine." },
  { slug: "levator-scapulae", name: "Levator Scapulae", description: "A muscle running from the neck to the shoulder blade, prone to tightness." },
  { slug: "adductors", name: "Adductors", description: "The inner-thigh muscles that stabilize the hip and pelvis." },
  { slug: "deep-hip-rotators", name: "Deep Hip Rotators", description: "Small muscles deep in the hip, including the piriformis." },
  { slug: "forearm-flexors", name: "Forearm Flexors", description: "The muscles on the palm side of the forearm that flex the wrist." },
  { slug: "forearm-extensors", name: "Forearm Extensors", description: "The muscles on the back of the forearm that extend the wrist." },
] as const;

// weight: 1 = primary driver of discomfort in this area, 2 = secondary/supporting
export const bodyAreaMuscleGroups: { bodyArea: string; muscleGroup: string; weight: number }[] = [
  { bodyArea: "neck", muscleGroup: "neck-flexors", weight: 1 },
  { bodyArea: "neck", muscleGroup: "levator-scapulae", weight: 2 },
  { bodyArea: "neck", muscleGroup: "upper-back", weight: 2 },

  { bodyArea: "shoulders", muscleGroup: "rotator-cuff", weight: 1 },
  { bodyArea: "shoulders", muscleGroup: "deltoids", weight: 2 },
  { bodyArea: "shoulders", muscleGroup: "chest", weight: 2 },
  { bodyArea: "shoulders", muscleGroup: "upper-back", weight: 2 },

  { bodyArea: "upper-back", muscleGroup: "upper-back", weight: 1 },
  { bodyArea: "upper-back", muscleGroup: "rotator-cuff", weight: 2 },
  { bodyArea: "upper-back", muscleGroup: "chest", weight: 2 },
  { bodyArea: "upper-back", muscleGroup: "erector-spinae", weight: 2 },

  { bodyArea: "lower-back", muscleGroup: "erector-spinae", weight: 1 },
  { bodyArea: "lower-back", muscleGroup: "core", weight: 1 },
  { bodyArea: "lower-back", muscleGroup: "glutes", weight: 2 },
  { bodyArea: "lower-back", muscleGroup: "hamstrings", weight: 2 },
  { bodyArea: "lower-back", muscleGroup: "hip-flexors", weight: 2 },

  { bodyArea: "wrists", muscleGroup: "forearm-flexors", weight: 1 },
  { bodyArea: "wrists", muscleGroup: "forearm-extensors", weight: 2 },

  { bodyArea: "hips", muscleGroup: "hip-flexors", weight: 1 },
  { bodyArea: "hips", muscleGroup: "glutes", weight: 2 },
  { bodyArea: "hips", muscleGroup: "adductors", weight: 2 },
  { bodyArea: "hips", muscleGroup: "deep-hip-rotators", weight: 2 },
];

export const exercises: {
  slug: string;
  name: string;
  description: string;
  instructions: string;
  difficulty: DifficultySeed;
  durationSeconds: number;
  equipment: string;
  goals: GoalSeed[];
  muscleGroups: { slug: string; isPrimary: boolean }[];
}[] = [
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
    muscleGroups: [{ slug: "neck-flexors", isPrimary: true }],
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
    muscleGroups: [{ slug: "neck-flexors", isPrimary: true }],
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
    muscleGroups: [{ slug: "neck-flexors", isPrimary: true }],
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
    muscleGroups: [{ slug: "levator-scapulae", isPrimary: true }, { slug: "upper-back", isPrimary: false }],
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
    muscleGroups: [{ slug: "neck-flexors", isPrimary: true }],
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
    muscleGroups: [{ slug: "chest", isPrimary: true }],
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
    muscleGroups: [{ slug: "deltoids", isPrimary: true }, { slug: "upper-back", isPrimary: false }],
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
    muscleGroups: [{ slug: "rotator-cuff", isPrimary: true }],
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
    muscleGroups: [
      { slug: "upper-back", isPrimary: true },
      { slug: "rotator-cuff", isPrimary: false },
      { slug: "deltoids", isPrimary: false },
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
    muscleGroups: [{ slug: "rotator-cuff", isPrimary: true }, { slug: "deltoids", isPrimary: false }],
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
    muscleGroups: [{ slug: "deltoids", isPrimary: true }, { slug: "upper-back", isPrimary: false }],
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
    muscleGroups: [{ slug: "upper-back", isPrimary: true }],
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
    muscleGroups: [{ slug: "upper-back", isPrimary: true }, { slug: "rotator-cuff", isPrimary: false }],
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
    muscleGroups: [{ slug: "upper-back", isPrimary: true }],
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
    muscleGroups: [{ slug: "upper-back", isPrimary: true }, { slug: "chest", isPrimary: false }],
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
    muscleGroups: [
      { slug: "upper-back", isPrimary: true },
      { slug: "erector-spinae", isPrimary: false },
      { slug: "core", isPrimary: false },
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
    muscleGroups: [{ slug: "hamstrings", isPrimary: true }, { slug: "erector-spinae", isPrimary: false }],
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
    muscleGroups: [{ slug: "erector-spinae", isPrimary: true }, { slug: "glutes", isPrimary: false }],
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
    muscleGroups: [
      { slug: "hip-flexors", isPrimary: true },
      { slug: "erector-spinae", isPrimary: false },
      { slug: "glutes", isPrimary: false },
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
    muscleGroups: [{ slug: "core", isPrimary: true }, { slug: "erector-spinae", isPrimary: false }],
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
    muscleGroups: [
      { slug: "core", isPrimary: true },
      { slug: "erector-spinae", isPrimary: true },
      { slug: "glutes", isPrimary: false },
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
    muscleGroups: [
      { slug: "glutes", isPrimary: true },
      { slug: "hamstrings", isPrimary: false },
      { slug: "erector-spinae", isPrimary: false },
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
    muscleGroups: [{ slug: "hip-flexors", isPrimary: true }],
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
    muscleGroups: [{ slug: "deep-hip-rotators", isPrimary: true }, { slug: "glutes", isPrimary: false }],
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
    muscleGroups: [{ slug: "adductors", isPrimary: true }],
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
    muscleGroups: [{ slug: "hip-flexors", isPrimary: true }, { slug: "deep-hip-rotators", isPrimary: false }],
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
    muscleGroups: [{ slug: "glutes", isPrimary: true }],
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
    muscleGroups: [{ slug: "glutes", isPrimary: true }],
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
    muscleGroups: [
      { slug: "forearm-flexors", isPrimary: true },
      { slug: "forearm-extensors", isPrimary: true },
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
    muscleGroups: [
      { slug: "forearm-flexors", isPrimary: true },
      { slug: "forearm-extensors", isPrimary: true },
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
    muscleGroups: [{ slug: "forearm-flexors", isPrimary: true }],
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
    muscleGroups: [{ slug: "forearm-flexors", isPrimary: true }],
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
    muscleGroups: [{ slug: "forearm-extensors", isPrimary: true }],
  },
];
