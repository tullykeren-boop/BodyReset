export type IssueTypeSeed = "PAIN" | "STIFFNESS" | "WEAKNESS" | "MOBILITY";
export type DifficultySeed = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export const targetAreas = [
  {
    slug: "lower-back",
    name: "Lower Back",
    description:
      "Ease tension and build resilience through the lumbar spine, hips, and core.",
    iconName: "spine",
    sortOrder: 1,
  },
  {
    slug: "knees",
    name: "Knees",
    description:
      "Support the joint by strengthening and loosening the muscles that stabilize it.",
    iconName: "knee",
    sortOrder: 2,
  },
  {
    slug: "shoulders",
    name: "Shoulders",
    description:
      "Restore mobility and stability across the rotator cuff and upper back.",
    iconName: "shoulder",
    sortOrder: 3,
  },
  {
    slug: "neck",
    name: "Neck",
    description:
      "Release tightness and rebuild control in the cervical spine and upper traps.",
    iconName: "neck",
    sortOrder: 4,
  },
  {
    slug: "hips",
    name: "Hips",
    description:
      "Open tight hip flexors and strengthen the glutes that support them.",
    iconName: "hip",
    sortOrder: 5,
  },
  {
    slug: "wrists",
    name: "Wrists",
    description:
      "Relieve strain and build endurance in the forearm muscles that cross the wrist.",
    iconName: "wrist",
    sortOrder: 6,
  },
] as const;

export const muscleGroups = [
  { slug: "erector-spinae", name: "Erector Spinae", description: "The muscles running along the spine that support upright posture." },
  { slug: "glutes", name: "Glutes", description: "The hip extensor muscles that stabilize the pelvis and lower back." },
  { slug: "hamstrings", name: "Hamstrings", description: "The back-of-thigh muscles that extend the hip and flex the knee." },
  { slug: "hip-flexors", name: "Hip Flexors", description: "The muscles at the front of the hip that lift the leg and tilt the pelvis." },
  { slug: "core", name: "Core / Abdominals", description: "The deep trunk muscles that stabilize the spine and pelvis." },
  { slug: "quadriceps", name: "Quadriceps", description: "The front-of-thigh muscles that extend the knee." },
  { slug: "calves", name: "Calves", description: "The lower leg muscles that support the knee and ankle." },
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

// weight: 1 = primary driver of this target area, 2 = secondary/supporting
export const targetAreaMuscleGroups: {
  targetArea: string;
  muscleGroup: string;
  weight: number;
}[] = [
  { targetArea: "lower-back", muscleGroup: "erector-spinae", weight: 1 },
  { targetArea: "lower-back", muscleGroup: "core", weight: 1 },
  { targetArea: "lower-back", muscleGroup: "glutes", weight: 2 },
  { targetArea: "lower-back", muscleGroup: "hamstrings", weight: 2 },
  { targetArea: "lower-back", muscleGroup: "hip-flexors", weight: 2 },

  { targetArea: "knees", muscleGroup: "quadriceps", weight: 1 },
  { targetArea: "knees", muscleGroup: "hamstrings", weight: 2 },
  { targetArea: "knees", muscleGroup: "calves", weight: 2 },
  { targetArea: "knees", muscleGroup: "glutes", weight: 2 },

  { targetArea: "shoulders", muscleGroup: "rotator-cuff", weight: 1 },
  { targetArea: "shoulders", muscleGroup: "upper-back", weight: 2 },
  { targetArea: "shoulders", muscleGroup: "chest", weight: 2 },
  { targetArea: "shoulders", muscleGroup: "deltoids", weight: 2 },

  { targetArea: "neck", muscleGroup: "neck-flexors", weight: 1 },
  { targetArea: "neck", muscleGroup: "upper-back", weight: 2 },
  { targetArea: "neck", muscleGroup: "levator-scapulae", weight: 2 },

  { targetArea: "hips", muscleGroup: "hip-flexors", weight: 1 },
  { targetArea: "hips", muscleGroup: "glutes", weight: 2 },
  { targetArea: "hips", muscleGroup: "adductors", weight: 2 },
  { targetArea: "hips", muscleGroup: "deep-hip-rotators", weight: 2 },

  { targetArea: "wrists", muscleGroup: "forearm-flexors", weight: 1 },
  { targetArea: "wrists", muscleGroup: "forearm-extensors", weight: 2 },
];

export const exercises: {
  slug: string;
  name: string;
  description: string;
  instructions: string;
  difficulty: DifficultySeed;
  durationSeconds: number;
  equipment: string;
  issueTypes: IssueTypeSeed[];
  muscleGroups: { slug: string; isPrimary: boolean }[];
}[] = [
  // --- Lower back ---
  {
    slug: "cat-cow-stretch",
    name: "Cat-Cow Stretch",
    description: "A gentle flow between spinal flexion and extension.",
    instructions:
      "Start on hands and knees. Inhale, drop your belly and lift your chest and tailbone (cow). Exhale, round your spine toward the ceiling and tuck your chin (cat). Move slowly with your breath.",
    difficulty: "BEGINNER",
    durationSeconds: 45,
    equipment: "none",
    issueTypes: ["STIFFNESS", "MOBILITY", "PAIN"],
    muscleGroups: [
      { slug: "erector-spinae", isPrimary: true },
      { slug: "core", isPrimary: false },
    ],
  },
  {
    slug: "childs-pose",
    name: "Child's Pose",
    description: "A restful stretch that lengthens the low back and hips.",
    instructions:
      "Kneel with big toes touching, knees apart. Sit hips back toward your heels and walk your hands forward, lowering your chest toward the floor. Breathe deeply and relax into the stretch.",
    difficulty: "BEGINNER",
    durationSeconds: 45,
    equipment: "none",
    issueTypes: ["PAIN", "STIFFNESS"],
    muscleGroups: [
      { slug: "erector-spinae", isPrimary: true },
      { slug: "glutes", isPrimary: false },
    ],
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
    issueTypes: ["PAIN", "STIFFNESS"],
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
      "Lie on your back with knees bent, feet flat. Flatten your low back into the floor by gently engaging your abs and tilting your pelvis, then release. Repeat in a slow, controlled rhythm.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    issueTypes: ["PAIN", "STIFFNESS", "WEAKNESS"],
    muscleGroups: [
      { slug: "core", isPrimary: true },
      { slug: "erector-spinae", isPrimary: false },
    ],
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
    issueTypes: ["WEAKNESS", "MOBILITY"],
    muscleGroups: [
      { slug: "core", isPrimary: true },
      { slug: "erector-spinae", isPrimary: true },
      { slug: "glutes", isPrimary: false },
    ],
  },
  {
    slug: "glute-bridge",
    name: "Glute Bridge",
    description: "Strengthens the glutes and hamstrings to take load off the low back and hips.",
    instructions:
      "Lie on your back, knees bent, feet flat hip-width apart. Squeeze your glutes and lift your hips until your body forms a straight line from shoulders to knees. Lower with control and repeat.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    issueTypes: ["WEAKNESS", "PAIN"],
    muscleGroups: [
      { slug: "glutes", isPrimary: true },
      { slug: "hamstrings", isPrimary: false },
      { slug: "erector-spinae", isPrimary: false },
      { slug: "hip-flexors", isPrimary: false },
    ],
  },
  {
    slug: "seated-forward-fold",
    name: "Seated Forward Fold",
    description: "Lengthens tight hamstrings that pull on the pelvis and low back.",
    instructions:
      "Sit with legs extended in front of you. Hinge forward from your hips, reaching toward your feet while keeping your back long. Ease into the stretch without forcing it.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    issueTypes: ["STIFFNESS", "MOBILITY"],
    muscleGroups: [{ slug: "hamstrings", isPrimary: true }, { slug: "erector-spinae", isPrimary: false }],
  },

  // --- Knees ---
  {
    slug: "standing-quad-stretch",
    name: "Standing Quad Stretch",
    description: "Loosens the quadriceps to reduce pull on the front of the knee.",
    instructions:
      "Stand tall, holding onto a wall for balance if needed. Bend one knee and grab your ankle behind you, gently pulling your heel toward your glutes. Keep your knees close together. Hold, then switch.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    issueTypes: ["STIFFNESS", "MOBILITY"],
    muscleGroups: [{ slug: "quadriceps", isPrimary: true }],
  },
  {
    slug: "straight-leg-raises",
    name: "Straight Leg Raises",
    description: "Builds quad strength without bending the knee under load.",
    instructions:
      "Lie on your back with one knee bent and the other leg straight. Tighten the thigh of the straight leg and lift it to the height of the bent knee. Lower slowly and repeat, then switch legs.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    issueTypes: ["WEAKNESS"],
    muscleGroups: [{ slug: "quadriceps", isPrimary: true }, { slug: "core", isPrimary: false }],
  },
  {
    slug: "wall-sit",
    name: "Wall Sit",
    description: "An isometric hold that builds quad and glute endurance.",
    instructions:
      "Lean your back against a wall and slide down until your knees are bent to a comfortable angle. Hold the position with your core engaged, then slide back up.",
    difficulty: "INTERMEDIATE",
    durationSeconds: 30,
    equipment: "wall",
    issueTypes: ["WEAKNESS"],
    muscleGroups: [{ slug: "quadriceps", isPrimary: true }, { slug: "glutes", isPrimary: false }],
  },
  {
    slug: "seated-hamstring-stretch",
    name: "Seated Hamstring Stretch",
    description: "Eases tension behind the knee and thigh.",
    instructions:
      "Sit on the edge of a chair with one leg extended, heel on the floor. Keep your back straight and hinge forward from your hips until you feel a stretch behind your thigh. Hold, then switch legs.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "chair",
    issueTypes: ["STIFFNESS", "MOBILITY"],
    muscleGroups: [{ slug: "hamstrings", isPrimary: true }],
  },
  {
    slug: "standing-calf-stretch",
    name: "Standing Calf Stretch",
    description: "Loosens the calf to reduce compensation stress on the knee.",
    instructions:
      "Stand facing a wall with hands on it. Step one foot back and press the heel into the floor, keeping the back leg straight. Hold, then switch legs.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "wall",
    issueTypes: ["STIFFNESS", "MOBILITY"],
    muscleGroups: [{ slug: "calves", isPrimary: true }],
  },
  {
    slug: "terminal-knee-extension",
    name: "Terminal Knee Extension",
    description: "Targets the quad muscles that stabilize the last few degrees of knee extension.",
    instructions:
      "Loop a band around a fixed point at knee height and step back so it's taut behind your knee. Slightly bend the knee, then straighten it fully against the band's resistance. Repeat, then switch legs.",
    difficulty: "INTERMEDIATE",
    durationSeconds: 40,
    equipment: "resistance band",
    issueTypes: ["WEAKNESS", "PAIN"],
    muscleGroups: [{ slug: "quadriceps", isPrimary: true }],
  },
  {
    slug: "clamshells",
    name: "Clamshells",
    description: "Strengthens the hip stabilizers that support the knee from above.",
    instructions:
      "Lie on your side with knees bent and stacked, hips stacked. Keeping feet together, lift your top knee like a clamshell opening, then lower with control. Repeat, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    issueTypes: ["WEAKNESS"],
    muscleGroups: [{ slug: "glutes", isPrimary: true }],
  },

  // --- Shoulders ---
  {
    slug: "shoulder-rolls",
    name: "Shoulder Rolls",
    description: "A warm-up movement that loosens the shoulder girdle.",
    instructions:
      "Stand or sit tall. Roll your shoulders up, back, and down in a slow circular motion. After several reps, reverse direction.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    issueTypes: ["MOBILITY", "STIFFNESS"],
    muscleGroups: [{ slug: "deltoids", isPrimary: true }, { slug: "upper-back", isPrimary: false }],
  },
  {
    slug: "doorway-chest-stretch",
    name: "Doorway Chest Stretch",
    description: "Opens tight chest muscles that round the shoulders forward.",
    instructions:
      "Stand in a doorway with forearms on the frame, elbows at shoulder height. Gently lean forward until you feel a stretch across your chest. Hold and breathe.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "doorway",
    issueTypes: ["STIFFNESS", "MOBILITY"],
    muscleGroups: [{ slug: "chest", isPrimary: true }],
  },
  {
    slug: "band-external-rotation",
    name: "Band External Rotation",
    description: "Strengthens the rotator cuff to stabilize the shoulder joint.",
    instructions:
      "Hold a resistance band with elbow tucked at your side, bent 90 degrees. Rotate your forearm outward away from your body, keeping your elbow pinned to your side. Return slowly and repeat.",
    difficulty: "INTERMEDIATE",
    durationSeconds: 40,
    equipment: "resistance band",
    issueTypes: ["WEAKNESS", "PAIN"],
    muscleGroups: [{ slug: "rotator-cuff", isPrimary: true }],
  },
  {
    slug: "wall-slides",
    name: "Wall Slides",
    description: "Restores overhead mobility and activates the muscles around the shoulder blade.",
    instructions:
      "Stand with your back against a wall, arms bent in a goalpost position touching the wall. Slowly slide your arms upward while keeping contact with the wall, then lower. Repeat.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "wall",
    issueTypes: ["MOBILITY", "WEAKNESS"],
    muscleGroups: [
      { slug: "upper-back", isPrimary: true },
      { slug: "rotator-cuff", isPrimary: false },
      { slug: "deltoids", isPrimary: false },
    ],
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
    issueTypes: ["STIFFNESS"],
    muscleGroups: [{ slug: "deltoids", isPrimary: true }, { slug: "upper-back", isPrimary: false }],
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
    issueTypes: ["WEAKNESS"],
    muscleGroups: [{ slug: "upper-back", isPrimary: true }],
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
    issueTypes: ["PAIN", "MOBILITY"],
    muscleGroups: [{ slug: "rotator-cuff", isPrimary: true }, { slug: "deltoids", isPrimary: false }],
  },

  // --- Neck ---
  {
    slug: "neck-side-tilt-stretch",
    name: "Neck Side Tilt Stretch",
    description: "Releases tension along the side of the neck.",
    instructions:
      "Sit or stand tall. Tilt your head toward one shoulder, letting the opposite side of your neck stretch. Hold gently, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    issueTypes: ["STIFFNESS", "PAIN"],
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
    issueTypes: ["WEAKNESS", "PAIN"],
    muscleGroups: [{ slug: "neck-flexors", isPrimary: true }],
  },
  {
    slug: "neck-rotation-stretch",
    name: "Neck Rotation Stretch",
    description: "Improves rotational mobility in the cervical spine.",
    instructions:
      "Slowly turn your head to look over one shoulder as far as comfortable. Hold, return to center, then turn to the other side.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    issueTypes: ["MOBILITY", "STIFFNESS"],
    muscleGroups: [{ slug: "neck-flexors", isPrimary: true }, { slug: "levator-scapulae", isPrimary: false }],
  },
  {
    slug: "upper-trap-stretch",
    name: "Upper Trap Stretch",
    description: "Targets the muscle that often tightens from stress and screen time.",
    instructions:
      "Sit tall and gently drop one ear toward your shoulder, then use light hand pressure to deepen the stretch. Hold, then switch sides.",
    difficulty: "BEGINNER",
    durationSeconds: 30,
    equipment: "none",
    issueTypes: ["STIFFNESS", "PAIN"],
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
    issueTypes: ["WEAKNESS"],
    muscleGroups: [{ slug: "neck-flexors", isPrimary: true }],
  },
  {
    slug: "shoulder-blade-squeeze",
    name: "Shoulder Blade Squeeze",
    description: "Supports the neck by strengthening the upper back.",
    instructions:
      "Sit or stand tall with arms relaxed. Squeeze your shoulder blades together, hold briefly, then release with control.",
    difficulty: "BEGINNER",
    durationSeconds: 40,
    equipment: "none",
    issueTypes: ["WEAKNESS"],
    muscleGroups: [{ slug: "upper-back", isPrimary: true }],
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
    issueTypes: ["STIFFNESS", "MOBILITY"],
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
    issueTypes: ["STIFFNESS", "PAIN"],
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
    issueTypes: ["STIFFNESS", "MOBILITY"],
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
    issueTypes: ["MOBILITY"],
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
    issueTypes: ["WEAKNESS"],
    muscleGroups: [{ slug: "glutes", isPrimary: true }],
  },

  // --- Wrists ---
  {
    slug: "wrist-flexor-stretch",
    name: "Wrist Flexor Stretch",
    description: "Stretches the underside of the forearm.",
    instructions:
      "Extend one arm in front of you, palm up. Use your other hand to gently pull the fingers back toward you until you feel a stretch. Hold, then switch hands.",
    difficulty: "BEGINNER",
    durationSeconds: 20,
    equipment: "none",
    issueTypes: ["STIFFNESS", "PAIN"],
    muscleGroups: [{ slug: "forearm-flexors", isPrimary: true }],
  },
  {
    slug: "wrist-extensor-stretch",
    name: "Wrist Extensor Stretch",
    description: "Stretches the top of the forearm, easing strain from typing.",
    instructions:
      "Extend one arm in front of you, palm down. Use your other hand to gently press the back of your hand down and toward you. Hold, then switch hands.",
    difficulty: "BEGINNER",
    durationSeconds: 20,
    equipment: "none",
    issueTypes: ["STIFFNESS", "PAIN"],
    muscleGroups: [{ slug: "forearm-extensors", isPrimary: true }],
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
    issueTypes: ["MOBILITY"],
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
    issueTypes: ["STIFFNESS", "MOBILITY"],
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
    issueTypes: ["WEAKNESS"],
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
    issueTypes: ["WEAKNESS"],
    muscleGroups: [{ slug: "forearm-extensors", isPrimary: true }],
  },
];
