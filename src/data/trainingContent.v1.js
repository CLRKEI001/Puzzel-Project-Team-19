// trainingContent.v1.js
//
// The PuzzleBox Training Course — content, Version 1.0
//
// This is the authoritative in-app transcription of
// "Training The PuzzleBox.pptx" (Dr Rivca Marais & Dr Jennifer Jansen),
// mapped into the application's existing seven-module training
// architecture (see src/lib/useTrainingModules.js FALLBACK_MODULES for
// the canonical module list/order this file follows).
//
// Like src/data/puzzleBoxContent.v1.js, this is deliberately kept as a
// plain versioned JS data object rather than hard-coded into the
// rendering component (src/components/TrainingModuleContent.js), so a
// future Admin Content Management phase can move it into Supabase
// without changing the rendering code — each module's content is an
// ordered array of typed "blocks" the renderer already knows how to draw.
//
// IMPORTANT — per the brief: "The PowerPoint is the authoritative source
// for the training content. Do NOT invent research findings, scoring
// rules, clinical interpretations or assessment procedures that are not
// supported by the supplied material. If something is unclear ...
// preserve it as unclear rather than inventing an answer."
//
// Two of the seven modules (6 — Online Navigation, 7 — Report Writing &
// Referral) are NOT covered by the 29-slide deck at all — there is no
// slide about the online platform UI and no slide about report writing
// or referral procedure. Rather than invent that content, those modules
// are marked `pptxCoverage: "none"` and instead point trainees at the
// equivalent real functionality already in the app (the online screener
// flow, and SummaryReport.js / reportGenerator.js's report output) with
// an explicit "not covered in the source training material" note.
//
// Content block types the renderer (TrainingModuleContent.js) supports:
//   "hero"            — big title + kicker + short intro
//   "timeline"         — ordered story beats (icon, title, body)
//   "principleCards"    — expandable grid of cards (title, summary, body)
//   "phasePipeline"      — the 4-phase PHASE/METHODS/OUTCOME pipeline
//   "statCallouts"       — row of big-number stat cards
//   "domainGrid"          — 4-domain puzzle-piece grid w/ sub-constructs
//   "caseStudy"            — the "Item F6 removed" worked example
//   "tierCompare"           — Tier 1 vs Tier 2 side-by-side
//   "adminScript"            — the full 40-item administration walkthrough
//   "scoringTable"            — age-based percentile/total-score table
//   "interpretationLadder"     — "Beyond the Score" 6-layer framework
//   "domainClassroomGuide"      — classroom-linked indicators per domain
//   "constructMap"                — construct pattern map summary (text form)
//   "capsMap"                      — CAPS subject mapping
//   "unclearNotice"                 — explicit "not covered" callout
//   "richText"                       — fallback paragraph block

export const TRAINING_CONTENT_VERSION = "1.0";

export const DEVELOPMENTAL_DOMAINS = [
  {
    id: "cognitive",
    label: "Cognitive",
    colorKey: "maroon",
    summary:
      "How the child thinks, pays attention, plans, remembers what they see, and works with early number and space concepts.",
    subConstructs: [
      "Ways of thinking: visual discrimination, visual reasoning, executive functioning, processing & reasoning",
      "Skills for learning: counting, spatial processing",
      "Memory: visual memory, auditory memory",
    ],
    classroom: [
      "Following a multi-step instruction (e.g., “pack away the blocks, then fetch your bag”)",
      "Staying on task during a seated item without needing constant redirection",
      "Copying a simple pattern or shape, or noticing what's different between two pictures",
      "Counting objects accurately and understanding that the last number counted is the total",
      "Knowing left from right, or finding their way around the classroom or playground",
    ],
  },
  {
    id: "language",
    label: "Language",
    colorKey: "purple",
    summary:
      "How well the child holds spoken information in mind and repeats or uses it accurately.",
    subConstructs: [
      "Receptive: sequential processing, comprehension, categorisation, conceptual thinking",
      "Expressive: expression, abstract reasoning, conceptual thinking, categorisation",
    ],
    classroom: [
      "Remembering and following a short string of spoken instructions",
      "Repeating a sentence back accurately after hearing it once",
      "Recalling a short list of words or items just heard",
    ],
  },
  {
    id: "fine_motor",
    label: "Fine Motor",
    colorKey: "pink",
    summary:
      "How the child plans and controls hand and pencil movements, and coordinates what they see with what they do.",
    subConstructs: [
      "Fine motor control: fine motor skills, manual dexterity, object manipulation, graphomotor",
      "Bilateral coordination",
      "Visual-motor integration: visual-motor coordination & integration, graphomotor",
    ],
    classroom: [
      "Drawing, copying shapes, or writing their name with reasonable control",
      "Building or assembling something (blocks, puzzles) using a sensible plan",
      "Managing buttons, scissors, or other tasks that need hand-eye coordination",
      "Stopping or adjusting a movement when needed, rather than acting impulsively",
    ],
  },
  {
    id: "emotional_social_moral",
    label: "Emotional-Social-Moral",
    colorKey: "teal",
    summary:
      "How the child understands feelings (their own and others'), gets along with peers, and makes fair, safe, and sensible social choices.",
    subConstructs: [
      "Emotion: emotion recognition, empathy",
      "Social: social cognition, social problem solving, theory of mind, social reasoning",
      "Moral: moral reasoning, moral understanding",
    ],
    classroom: [
      "Naming or recognising how a character or classmate is feeling",
      "Understanding that another person might think or want something different to them",
      "Sharing, taking turns, and resolving small disagreements with peers fairly",
      "Showing awareness of safety and the likely consequences of their actions",
      "Talking about themselves with a reasonably accurate, age-appropriate sense of who they are",
    ],
  },
];

// The full 40-item administration script, transcribed item-for-item from
// the Record Book slides (15-18). `toPass` / `scoring` are reproduced
// exactly as printed — nothing paraphrased or inferred beyond grouping
// for readability. Where the deck used an age-based lookup table, it is
// included verbatim rather than collapsed into a single number.
export const ADMINISTRATION_ITEMS = [
  {
    n: 1,
    title: "Complete the puzzle",
    domain: "cognitive",
    script: "Starting position: hands on table. Put the puzzle pieces in front of the child and say: “Complete the puzzle in the frame.”",
    scoring: "scale3_age_timed",
    toPass: "Score according to age using the table provided (record time).",
    ageTable: {
      "5 year old": [["> 14 min", 0], ["7 – 13 min", 1], ["< 6 min", 2]],
      "6 year old": [["> 13 min", 0], ["6 – 12 min", 1], ["< 5 min", 2]],
    },
  },
  { n: 2, title: "Planning", domain: "cognitive", script: "Observe while the child builds the puzzle.", scoring: "binary", toPass: "1) Shows evidence of planning (e.g., turns pieces purposefully, organises them by shape or colour, starts with corners/edges, sets small goals). 0) Shows poor planning (e.g., places pieces randomly, repeats same errors, no clear starting point or strategy)." },
  { n: 3, title: "Attention: staying focused", domain: "cognitive", script: "Observe while the child builds the puzzle.", scoring: "binary", toPass: "1) Maintains attention (e.g., stays engaged, not easily distracted, returns to task after interruption). 0) Has difficulty maintaining attention (e.g., easily distracted, frequently leaves the task, struggles to re-engage after interruption)." },
  { n: 4, title: "Matching and fitting pieces", domain: "cognitive", script: "Observe while the child builds the puzzle.", scoring: "binary", toPass: "1) Matches pieces effectively (e.g., uses shape, picture, colour, or pattern cues; places pieces accurately; uses the picture as a guide). 0) Struggles to match pieces (e.g., places pieces incorrectly, ignores shape or picture cues, forces or stacks pieces)." },
  { n: 5, title: "Logical approach", domain: "cognitive", script: "Observe while the child builds the puzzle.", scoring: "binary", toPass: "1) Logical order (e.g., completing a section before moving on, indicating thoughtful planning) or 0) trial-and-error." },
  { n: 6, title: "Self-monitoring: fixing mistakes", domain: "cognitive", script: "Observe while the child builds the puzzle.", scoring: "binary", toPass: "1) Notices when a piece doesn't fit, tries a different one, identifies mistakes, corrects them, and shows persistence when facing difficulty. 0) Struggles to notice mistakes, continues with incorrect pieces, or gives up easily when facing difficulty." },
  { n: 7, title: "Count the oranges", domain: "cognitive", script: "Identify the puzzle piece with oranges. Put the puzzle piece in front of the child and ask: “How many oranges are there all together?”", scoring: "binary", toPass: "Count 10 oranges." },
  { n: 8, title: "Position — left", domain: "cognitive", script: "Using the same puzzle piece with the oranges on, put it in front of the child. Say: “Put the puzzle piece to the left of the puzzle.”", scoring: "binary", toPass: "Correct positioning." },
  { n: 9, title: "Position — right", domain: "cognitive", script: "Put puzzle piece in front of child again and ask: “Put the puzzle piece to the right of the puzzle.”", scoring: "binary", toPass: "Correct positioning." },
  { n: 10, title: "Visual matching — cold drinks", domain: "cognitive", script: "Identify the two puzzle pieces with cold drinks. Point and ask: “Which two cold drinks look the same?”", scoring: "binary", toPass: "Identifies cold drinks correctly." },
  { n: 11, title: "Quantity identification — mielies", domain: "cognitive", script: "Point to the two puzzle pieces containing mielies. “Which container has four mielies?”", scoring: "binary", toPass: "Identifies correct container." },
  { n: 12, title: "Quantity comparison — sweets", domain: "cognitive", script: "Point to the puzzle pieces containing sweets. Ask: “Which bag has the most sweets?”", scoring: "binary", toPass: "Identifies correct bag." },
  { n: 13, title: "Visual search & count — red apples", domain: "cognitive", script: "“Find all the red apples in the puzzle.”", scoring: "binary", toPass: "Find all five red apples." },
  {
    n: 14,
    title: "Categorise & recall — difference grannies",
    domain: "cognitive",
    script: "Ask the child: “What is the difference between the two grannies – in which way do they not look the same?”",
    scoring: "scale3_checklist",
    toPass: "Checklist: missing sleeve / different shoes / spoon shorter / scarf on head / missing nose.",
    checklistScoring: [["5 = 2"], ["2, 3, 4 = 1"], ["0, 1 = 0"]],
  },
  {
    n: 15,
    title: "Delayed recall — orange things",
    domain: "language",
    script: "Look for all the orange things/objects in the picture. Assist the child to find them. (Dress of girl, pumpkin, carrots, oranges, cold drink, pineapple, granny's head scarf.) “I want you to remember them all because I'm going to cover them up and ask you to remember them.” Cover the puzzle and say: “Name all the orange things you saw.”",
    scoring: "scale3_age_checklist",
    toPass: "Checklist: dress girl / pumpkin / carrots / oranges / cold drink.",
    ageTable: { "5 year old": [["5", 2], ["2, 3, 4", 1], ["0, 1", 0]], "6 year old": [["—", "—"], ["3, 4, 5", 1], ["0, 1, 2", 0]] },
  },
  { n: 16, title: "Delayed recall — fruit by the fire", domain: "language", script: "Cover the puzzle and ask: “Can you remember which fruit is next to the fire?”", scoring: "binary", toPass: "Correctly identifies the apple." },
  { n: 17, title: "Sequencing — growing a pumpkin", domain: "cognitive", script: "Take the bottom row of the puzzle pieces and place them in front of the child in the following order: 1) plant; 2) pumpkin; 3) seeds; 4) watering can. Ask the child: “Put the four puzzle pieces into an order to show how the pumpkin grows.”", scoring: "binary", toPass: "Place in the following order: 1) Seeds; 2) Watering Can; 3) Plant; 4) Pumpkin." },
  { n: 18, title: "Oral narrative — tell a story", domain: "language", script: "Show the child the puzzle and ask: “Can you tell me a story about this puzzle picture?” (Note: see if they can tell a story about the puzzle.)", scoring: "binary", toPass: "Provide at least 3 four-word sentences describing the picture." },
  { n: 19, title: "Grammar — use of verb", domain: "language", script: "Scored from the story told in item 18.", scoring: "binary", toPass: "0) None. 1) Use 1 or more verbs." },
  { n: 20, title: "Grammar — use of adjective", domain: "language", script: "Scored from the story told in item 18.", scoring: "binary", toPass: "0) None. 1) Use 1 or more adjectives." },
  { n: 21, title: "Grammar — use of conjunction", domain: "language", script: "Scored from the story told in item 18 — two ideas linked in one sentence.", scoring: "binary", toPass: "0) None. 1) Use 1 or more conjunctions." },
  { n: 22, title: "Concept formation — day & night", domain: "cognitive", script: "Point at the relevant object in the puzzle and ask: “How does the shop look like at night?” “What does the shop look like during the day?”", scoring: "binary", toPass: "Both must be correct." },
  { n: 23, title: "Semantic development — potato / bicycle", domain: "language", script: "Ask the following questions: “What is a potato?” “What is a bicycle?”", scoring: "binary", toPass: "Both must be correct — 1 characteristic required." },
  { n: 24, title: "Sentence repetition 1", domain: "language", script: "Point to the boy in the puzzle. Say to the child: “Repeat the following sentence: ‘The boy would like to buy sweets from the shop.’”", scoring: "binary", toPass: "Repeated the sentence correctly." },
  { n: 25, title: "Sentence repetition 2", domain: "language", script: "Point to the grannies and say: “Repeat the following sentence: ‘The grannies took the salt and added it to the boiling pap.’”", scoring: "binary", toPass: "Repeated the sentence correctly." },
  { n: 26, title: "Verbal working memory — shopping list", domain: "language", script: "Point to the puzzle and say: “This shop has different types of vegetables, fruit and cold drinks.” Point to the boy and say: “This boy's mother has sent him to the shop to buy a list of things.” Cover puzzle and say: “I'm going to read a list of things he needs to buy. Try and remember everything on the list: onions, apples, potatoes, cold drinks, oranges.”", scoring: "binary", toPass: "Recall all 5 objects." },
  {
    n: 27,
    title: "Fine-motor speed — the security gate",
    domain: "fine_motor",
    script: "Point to the holes in the frame and tell the child the story: “Let us put a fence up to protect the shop from the cows and goats. Let me show you.” Remove the sticks, give the child ten sticks and say: “Now you do it as quickly as you can.”",
    scoring: "scale3_age_timed",
    toPass: "Score according to age using the table.",
    ageTable: { "5 year old": [["> 37s", 0], ["14 – 36s", 1], ["< 13s", 2]], "6 year old": [["> 33s", 0], ["10 – 32s", 1], ["< 9s", 2]] },
  },
  {
    n: 28,
    title: "Draw a bicycle",
    domain: "fine_motor",
    script: "Point at the bicycle in the puzzle picture. Cover the puzzle and ask the child: “Draw a bicycle here.” (point to the perspex sheet)",
    scoring: "binary_checklist",
    toPass: "Child must draw a recognisable drawing (5 features): a recognisable drawing; five recognisable features (frame, handle bars, seat, pedals, spokes, wheels); one creative element; recognisable parts that are connected.",
  },
  { n: 29, title: "Emergent writing — write your name", domain: "fine_motor", script: "Provide whiteboard marker and say to the child: “Write your name here.” (point to perspex sheet)", scoring: "binary", toPass: "Task completion (first name). Letter formation well defined & recognisable, no reversals of letters. Capital & small letters acceptable." },
  { n: 30, title: "Visual-motor control — the chase", domain: "fine_motor", script: "Place the perspex sheet on the puzzle and give the marker to the child. Say: “Help the dog catch the robber. Draw a line from the dog between the bicycles around the man to the robber. Don't let your line touch any people or things in the puzzle.”", scoring: "binary", toPass: "Line did not touch any person or object; no marker lift and no turn of direction." },
  {
    n: 31,
    title: "Draw a circle around the bird",
    domain: "fine_motor",
    script: "Say to the child: “Draw a circle around the bird.”",
    scoring: "binary_checklist",
    toPass: "Round circle, ends meet, that do not overlap. Line must not touch the bird. Scoring guide: clear circle; ends meet; no lifting of marker; line not touching the bird.",
  },
  { n: 32, title: "Pattern replication — the gate", domain: "fine_motor", script: "Give the child six sticks. Demonstrate the pattern for the child and say: “Use the sticks to make a security gate for the shop. The gate must look like this one here.” (pattern: /// X) Child must replicate the pattern.", scoring: "binary", toPass: "Replicate pattern correctly." },
  { n: 33, title: "Emotion recognition", domain: "emotional_social_moral", script: "Point to the puzzle and ask: “Show me the person that is happy.” “Show me who looks sad.” “Show me the person that is cross.”", scoring: "binary", toPass: "All three must be correct." },
  { n: 34, title: "Emotion understanding", domain: "emotional_social_moral", script: "Point to the puzzle and ask: “Why is the man cross?” “How is the lady in the pink dress feeling?” “How will the grannies feel after working all day at the shop?”", scoring: "binary", toPass: "All three must be correct." },
  { n: 35, title: "Social problem-solving — the dropped oranges", domain: "emotional_social_moral", script: "Point to the puzzle and ask: “If the granny drops a bowl of oranges, and some of the oranges fall on the floor, what could the boy do to help the granny?”", scoring: "binary", toPass: "See scoring guidance in record book (reasonable helping response)." },
  { n: 36, title: "Social awareness — asking to play with the dog", domain: "emotional_social_moral", script: "Point to the puzzle and ask: “The dog and the dog's owner walk up to the boy. The boy wants to play with the dog, but he is not sure if he is allowed to play with the dog. What can the boy do?”", scoring: "binary", toPass: "See if the child is able to suggest and understand socially acceptable ways to resolve the problem, e.g. ask permission from the owner to touch the dog." },
  { n: 37, title: "Social problem-solving — sharing the cold drink", domain: "emotional_social_moral", script: "Point to the puzzle and ask: “If the boy and his friend go to the shop to buy a cold drink, but there is only one cold drink left, what do you think is the best thing for them to do?”", scoring: "binary", toPass: "Acceptable answers: share, offer an alternative." },
  { n: 38, title: "Theory of mind — the robber and the mother", domain: "emotional_social_moral", script: "Ask the child: “The mother sees the robber and thinks that he is going to steal her shoe. Do you think that is what the robber is thinking and why?”", scoring: "binary", toPass: "The child can give a logical reason why they say this, e.g. relevant thoughts that are different to the mother's thoughts." },
  { n: 39, title: "Empathy & repair — the lady with groceries", domain: "emotional_social_moral", script: "Ask the child: “What would you do if you bumped into the lady carrying her groceries?”", scoring: "binary", toPass: "Child must verbalise an understanding of socially acceptable ways of resolving the problem (e.g. say sorry, help her)." },
  { n: 40, title: "Personal self-concept", domain: "emotional_social_moral", script: "Point at the picture of the boy in the puzzle: tell the child, “See this boy, he is kind, he works hard and he is a very good soccer player. Can you tell me more about yourself?”", scoring: "binary", toPass: "The child can share three characteristics about themselves." },
];

export const TRAINING_MODULES_CONTENT = {
  // ---------------------------------------------------------------------
  // MODULE 1 — Introduction to The Puzzle Box
  // ---------------------------------------------------------------------
  1: {
    slug: "introduction",
    // The founding story (Gary King's 12-piece puzzle, the partnership with
    // Dr Jansen) lives on the public About page (src/components/About.js →
    // FoundingStory), not here — kept in one place rather than duplicated,
    // per direct feedback from the project. Module 1 is the course's
    // orientation/roadmap instead.
    pptxCoverage: "partial",
    sourceSlides: [13],
    blocks: [
      {
        type: "hero",
        kicker: "Module 1 · Introduction",
        title: "Welcome to PuzzleBox training",
        intro:
          "This course takes you from the big picture of The PuzzleBox through to running a full screening and understanding what the results mean.",
      },
      {
        type: "richText",
        title: "What The PuzzleBox is",
        paragraphs: [
          "The PuzzleBox is a single, play-based puzzle designed to screen broad areas of early childhood development — thinking, language, fine motor skills and social-emotional growth — built for the South African context.",
        ],
        note: "Curious how it all started? Read the full founding story on The Puzzle Project's About page.",
      },
      {
        type: "timeline",
        title: "Your training journey",
        steps: [
          { icon: "bulb", title: "Module 2 — Research Background", body: "Guiding principles, theoretical framework and the four developmental domains." },
          { icon: "puzzle", title: "Module 3 — Equipment & Setting Up", body: "Meet The PuzzleBox itself and the Tier 1 / Tier 2 screening structure." },
          { icon: "clipboard", title: "Module 4 — Administration", body: "The full 40-item Record Book script, item by item." },
          { icon: "chart", title: "Module 5 — Interpretation", body: "Scoring, percentile bands, and reading beyond the score." },
          { icon: "laptop", title: "Module 6 — Online Navigation", body: "Using the online platform to run a screening." },
          { icon: "notes", title: "Module 7 — Report Writing & Referral", body: "From a completed screening to a report and, where appropriate, a referral." },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // MODULE 2 — Research Background & Psychometric Properties
  // ---------------------------------------------------------------------
  2: {
    slug: "research-background",
    pptxCoverage: "full",
    sourceSlides: [5, 6, 7, 8, 9, 10, 11, 12],
    blocks: [
      {
        type: "hero",
        kicker: "Module 2 · Research Background",
        title: "Guiding principles & the science behind The PuzzleBox",
        intro:
          "Every design choice in The PuzzleBox — from the materials to the single-puzzle format — traces back to a guiding principle and a body of research. This module unpacks both.",
      },
      {
        type: "principleCards",
        title: "Guiding principles",
        cards: [
          { id: "screening", title: "General developmental screening", summary: "Designed to screen broad development, not one narrow skill.", body: "The PuzzleBox is built as a general developmental screener — one tool that gives an early signal across multiple domains, rather than many separate single-purpose tests." },
          { id: "multicultural", title: "Multi-cultural", summary: "Built around scenes and items familiar across cultures.", body: "Item content (a shop scene, everyday objects, family figures) was chosen to be recognisable and meaningful across South Africa's cultural diversity." },
          { id: "multilingual", title: "Multi-lingual application", summary: "Usable across isiXhosa, English, Afrikaans and more.", body: "The screener and its record book support administration in multiple languages, reflecting the Record Book's own language-of-screening options (isiXhosa / English / Afrikaans)." },
          { id: "play", title: "Play-based, South African", summary: "Feels like play, not a test — and reflects a South African setting.", body: "Children engage with The PuzzleBox as a puzzle to play with. The scene itself — a local shop, a shared community moment — is grounded in a South African context." },
          { id: "recyclable", title: "Recyclable material", summary: "Made with recyclable material.", body: "The physical PuzzleBox materials were chosen with recyclability in mind." },
          { id: "affordable", title: "Affordable & accessible", summary: "Designed to be affordable and accessible at scale.", body: "Cost and accessibility were explicit design constraints — the tool needed to be realistic to distribute widely, not just in well-resourced settings." },
          { id: "single", title: "Single puzzle", summary: "One puzzle, not a kit of many tools.", body: "The whole screener is built around a single, reimagined puzzle — interactive tasks like removing and placing pieces do the work that would otherwise need several separate tools." },
          { id: "early", title: "Early intervention", summary: "Built to catch developmental concerns early.", body: "The entire purpose of screening at ages 5–6 is to identify children who may benefit from support while early intervention can still make the most difference." },
        ],
      },
      {
        type: "richText",
        title: "Theoretical framework",
        paragraphs: [
          "The PuzzleBox's domain mapping and item design draw on: Griffiths (1954) and its later expansions (Stroud et al., 2016); constructs identified through test reviews (Marais, 2020); the PASS Model; Kohlberg's Theory; and Erik Erikson's Psychosocial Theory — alongside trends in developmental assessment and evidence-informed developmental milestones.",
          "Domain mapping groups items under four areas: Cognitive, Language, Fine Motor, and Social-Emotional-Moral.",
        ],
        note: "The deck names these frameworks directly; it does not elaborate further on how each one specifically maps to each item beyond the Construct Pattern Map covered in Module 5. That mapping is preserved as-is rather than expanded upon.",
      },
      {
        type: "phasePipeline",
        title: "How The PuzzleBox was developed — four phases",
        phases: [
          { n: 1, name: "Conceptualisation", icon: "bulb", methods: ["Literature review", "Consultations", "Theoretical framework", "Domain & item mapping"], outcome: "Concept & blueprint defined" },
          { n: 2, name: "Design & Development", icon: "gear", methods: ["Item development", "Translation & adaptation", "Expert review", "Prototyping"], outcome: "Pilot-ready tool" },
          { n: 3, name: "Piloting", icon: "users", methods: ["196 children (65 + 60 + 71)", "Item analysis & EFA", "Refine tool", "3 rounds of piloting", "Item selection"], outcome: "Final item set selected" },
          { n: 4, name: "Standardisation", icon: "chart", methods: ["327 children", "Psychometric analysis", "Reliability & validity testing", "Cut points", "Final review"], outcome: "Standardised tool" },
        ],
      },
      {
        type: "richText",
        title: "Item development: the shop scene",
        paragraphs: [
          "Items were developed around a single multi-cultural, familiar scenario — a shop scene — with each item built around a feature of that scene. The puzzle's use was reimagined into interactive tasks, such as removing and placing pieces, rather than simply assembling a picture.",
        ],
      },
      {
        type: "caseStudy",
        title: "Worked example: why an item gets removed — “Item F6: Balance stones”",
        intro:
          "Not every trialled item made it into the final PuzzleBox. This is the deck's own worked example of an item that was removed during piloting, and why — useful for understanding how seriously psychometric evidence is weighed.",
        factors: [
          { label: "Psychometric properties", rating: "weak", note: "Low factor loading and very low communality (0.06), unacceptable across all parameters." },
          { label: "Theoretical alignment", rating: "strong", note: "Alignment with Successive & Attention." },
          { label: "Evidence-informed milestones", rating: "weak", note: "Lacked direct match." },
          { label: "Qualitative appraisal", rating: "weak", note: "Difficult to standardise the size of the stones. Stones were also heavier than the bottle tops, which sometimes influenced execution of the item." },
          { label: "Format-specific equipment criteria", rating: "weak", note: "Equipment: bottle tops, stones." },
        ],
        verdict: "Removed from the final tool.",
      },
      {
        type: "statCallouts",
        title: "Current evidence base",
        stats: [
          { value: "327", label: "Children in the standardisation sample, aged 5 to 6 years 11 months, across multiple Eastern Cape locations representing varied linguistic, educational, demographic and socio-economic contexts." },
          { value: "α = .883", label: "Strong internal consistency of the Total Score (Cronbach's alpha)." },
          { value: "KR-20 = .872", label: "Strong internal consistency (Kuder–Richardson 20)." },
        ],
        note: "Preliminary convergent evidence has also been established through comparison with the SGSM. Limitation (stated directly in the source material): the current reference sample does not constitute nationally representative South African norms. Test-retest reliability, inter-rater reliability, stronger criterion/convergent validity, and national external validation remain outstanding.",
      },
      {
        type: "domainGrid",
        title: "The four developmental domains",
        domains: DEVELOPMENTAL_DOMAINS.map((d) => ({ id: d.id, label: d.label, colorKey: d.colorKey, summary: d.summary, subConstructs: d.subConstructs })),
      },
    ],
  },

  // ---------------------------------------------------------------------
  // MODULE 3 — Test Equipment & Setting Up
  // ---------------------------------------------------------------------
  3: {
    slug: "equipment-setup",
    pptxCoverage: "full",
    sourceSlides: [13, 14],
    blocks: [
      {
        type: "hero",
        kicker: "Module 3 · Equipment & Setting Up",
        title: "Introducing The PuzzleBox",
        intro:
          "The PuzzleBox is a culturally responsive early childhood learning screening tool supporting early identification, referral & educational support.",
      },
      {
        type: "tierCompare",
        title: "One screening tool, two tiers of application",
        shared: ["Early identification", "Culturally responsive support", "Collaboration between educators, families & professionals", "Timely referral & intervention"],
        tiers: [
          {
            name: "Tier 1 — Educator Screening Tier",
            users: "Preschool Educators",
            purpose: "Classroom-based screening to identify children who may benefit from additional support, assessment, or referral.",
            supports: ["Recognise support needs", "Identify need for further assessment", "Communicate concerns with families/professionals", "Support referral pathways"],
            provides: ["Global screening score", "Three-category interpretation", "CAPS-linked activities", "Classroom guidance", "Educator report & referral templates"],
            goal: "Identify, refer & classroom support",
          },
          {
            name: "Tier 2 — Psychological Screening Interpretation Tier",
            users: "Psychologists, Registered Psychological Counsellors & Psychometrists",
            purpose: "Interpret screening results to inform decisions about additional support, monitoring, referral, or comprehensive assessment where appropriate.",
            supports: ["Interpret screening patterns within a developmental context", "Identify areas that may warrant further observation or assessment", "Integrate screening results with other available information", "Inform recommendations for support, referral, or further assessment"],
            provides: ["Global screening score", "Learning area indicators", "Developmental constructs", "CAPS-linked educational context", "Interpretation guidelines", "Psychometric & theoretical foundations"],
            goal: "Screen, interpret & guide",
          },
        ],
      },
      {
        type: "richText",
        title: "What's in the Record Book",
        paragraphs: [
          "The physical PuzzleBox Record Book captures: personal information (child's name, age, date of birth, date of screening, gender, home language, language of instruction, language of screening, place of screening, cellphone, examiner), followed by scored items 1 through 40.",
          "Scoring in the Record Book uses three types: a simple 0 = Fail / 1 = Pass; a 0 / 1 / 2 scale where 2 means “Passed confidently” (manually judged, or looked up from an age-based time/count table); and checklist items where a count of correctly identified sub-items feeds an age-based table.",
        ],
      },
      {
        type: "unclearNotice",
        title: "A note on the physical puzzle equipment itself",
        body: "The source material shows the Record Book pages and the finished PuzzleBox photograph, but does not include a dedicated “unbox and set up your equipment” walkthrough (e.g. an itemised equipment checklist or step-by-step physical setup instructions beyond what's implied by the administration script in Module 4). That is preserved here as not covered, rather than inventing setup steps.",
      },
    ],
  },

  // ---------------------------------------------------------------------
  // MODULE 4 — Administration
  // ---------------------------------------------------------------------
  4: {
    slug: "administration",
    pptxCoverage: "full",
    sourceSlides: [15, 16, 17, 18],
    blocks: [
      {
        type: "hero",
        kicker: "Module 4 · Administration",
        title: "The 40-item administration script",
        intro:
          "This is the full Record Book script, item by item — exactly what to say, what to do, and how to score each of the 40 items. Work through it in order; items build on the same puzzle scene.",
      },
      {
        type: "richText",
        title: "Before you start",
        paragraphs: [
          "Read each question and assess the child's performance on the task required. Tick the circle that best indicates the child's performance, using the scoring shown for each item (0 = Fail, 1 = Pass, and where noted, 2 = Passed confidently).",
        ],
      },
      { type: "adminScript", title: "Items 1–40", items: ADMINISTRATION_ITEMS },
    ],
  },

  // ---------------------------------------------------------------------
  // MODULE 5 — Interpretation
  // ---------------------------------------------------------------------
  5: {
    slug: "interpretation",
    pptxCoverage: "full",
    sourceSlides: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
    blocks: [
      {
        type: "hero",
        kicker: "Module 5 · Interpretation",
        title: "Scoring & interpretation",
        intro:
          "A total score is only the starting point. This module covers how to score, how to interpret the score against age-based norms, and how to look beyond the score.",
      },
      {
        type: "scoringTable",
        title: "Scoring",
        rows: [
          { band: "On Track", age: "5", percentile: "≥ 75th", score: "≥ 30" },
          { band: "On Track", age: "6", percentile: "≥ 75th", score: "≥ 33" },
          { band: "Progressing", age: "5", percentile: "50th–74th", score: "25 – 29" },
          { band: "Progressing", age: "6", percentile: "50th–74th", score: "27 – 32" },
          { band: "Concerns", age: "5", percentile: "< 50th", score: "≤ 24" },
          { band: "Concerns", age: "6", percentile: "< 50th", score: "≤ 26" },
        ],
        interpretation: [
          { band: "Developmental Concerns (<50th percentile)", body: "The child's performance falls below the 50th percentile, indicating that certain developmental areas may require closer monitoring or targeted support to enhance progress. A referral for further assessment or intervention is recommended." },
          { band: "Progressing (50th–74th percentile)", body: "The child's performance is within the average range, suggesting steady development. Continued opportunities for practice and enrichment are recommended to support further growth." },
          { band: "On Track (≥75th percentile)", body: "The child's performance is above the 75th percentile, reflecting age-appropriate and well-established skills in this area. Continued stimulation and engagement are encouraged to maintain progress." },
        ],
      },
      {
        type: "interpretationLadder",
        title: "Beyond the score",
        layers: [
          { label: "Global Score", colorKey: "purple" },
          { label: "Clinical observations", colorKey: "teal" },
          { label: "Domain level qualitative interpretations", colorKey: "maroon" },
          { label: "Item level qualitative interpretations", colorKey: "orange" },
          { label: "Theory linked qualitative interpretations", colorKey: "pink" },
          { label: "Classroom linked interpretations", colorKey: "purple" },
        ],
      },
      {
        type: "domainClassroomGuide",
        title: "The four domains — what to look for in the classroom",
        domains: DEVELOPMENTAL_DOMAINS,
      },
      {
        type: "constructMap",
        title: "Construct Pattern Map (reference)",
        note:
          "The full deck includes a detailed Construct Pattern Map linking each of the 40 administration items to specific cognitive, language, fine-motor and emotional-social-moral constructs (e.g. Executive Functions → items 1, 2, 3, 5, 6, 17; Planning & Organisation → items 2, 17, 32; and so on, across 25 named constructs). It is reproduced as a downloadable reference rather than inline here, since it is a dense cross-reference table rather than a teaching sequence.",
      },
      {
        type: "capsMap",
        title: "CAPS curriculum links",
        intro:
          "The PuzzleBox's 40 items map onto three CAPS subject areas — direct links shown solid, closest-fit (no direct CAPS topic) shown dashed.",
        subjects: [
          { name: "Mathematics", direct: ["Puzzle assembly (1)", "Matching & fitting pieces (4)", "Counting oranges (7)", "Position left (8)", "Position right (9)", "Visual matching (10)", "Quantity identification (11)", "Quantity comparison (12)", "Visual search & count (13)", "Categorise & recall (15)", "Draw a circle (31)", "Pattern replication (32)"], indirect: ["Logical approach (5)"] },
          { name: "Home Language", direct: ["Oral narrative (18)", "Grammar — verbs (19)", "Grammar — adjectives (20)", "Grammar — conjunctions (21)", "Semantic knowledge (23)", "Sentence repetition 1 (24)", "Sentence repetition 2 (25)", "Emergent writing (29)"], indirect: ["Delayed recall (16)", "Verbal working memory (26)"] },
          { name: "Life Skills", direct: ["Detail discrimination (14)", "Sequencing — growth (17)", "Day/night concept (22)", "Fine-motor speed (27)", "Draw a bicycle (28)", "Visual-motor control (30)", "Emotion recognition (33)", "Emotion reasoning (34)", "Social problem-solving (35)", "Social rules (36)", "Sharing & fairness (37)", "Empathy & repair (39)", "Self-concept (40)"], indirect: ["Planning (2)", "Sustained attention (3)", "Self-monitoring (6)", "Perspective-taking (38)"] },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // MODULE 6 — Online Navigation
  // ---------------------------------------------------------------------
  6: {
    slug: "online-navigation",
    pptxCoverage: "none",
    sourceSlides: [],
    blocks: [
      {
        type: "hero",
        kicker: "Module 6 · Online Navigation",
        title: "Using The PuzzleBox online platform",
        intro:
          "This module walks through the online platform you're using right now — logging in, finding a child's profile, and running a screening.",
      },
      {
        type: "unclearNotice",
        title: "Not covered in the training deck",
        body: "“Training The PuzzleBox.pptx” does not include any slide about the online platform's navigation or interface. Rather than invent screenshots or steps that aren't in the source material, this module instead points you to the real, live online screener — the same screens you'll use day to day — described below.",
      },
      {
        type: "richText",
        title: "Where to find things in the app",
        paragraphs: [
          "From your dashboard, open a child's profile to start or continue a screening — the on-screen flow mirrors the Record Book item-for-item, in the same order covered in Module 4.",
          "Completed screenings produce a summary report (see Module 7), which you can review, discuss with a psychologist on Tier 2, and use to guide referral conversations with families.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // MODULE 7 — Report Writing & Referral
  // ---------------------------------------------------------------------
  7: {
    slug: "report-writing-referral",
    pptxCoverage: "none",
    sourceSlides: [],
    blocks: [
      {
        type: "hero",
        kicker: "Module 7 · Report Writing & Referral",
        title: "From score to support",
        intro:
          "The last step of the journey: turning a completed screening into a clear report, and knowing when and how to refer a child for further support.",
      },
      {
        type: "unclearNotice",
        title: "Not covered in the training deck",
        body: "The training deck does not include a slide on report-writing procedure or referral workflow/templates. Rather than invent a referral process that isn't in the source material, this module points you to the app's actual report output.",
      },
      {
        type: "richText",
        title: "What the app gives you",
        paragraphs: [
          "Once a screening is complete, the app generates a summary report from the recorded scores — organised around the same On Track / Progressing / Concerns bands and domain breakdown covered in Module 5.",
          "Use the interpretation guidance from Module 5 (the score bands, and the “beyond the score” layers — clinical observations, domain-, item-, theory- and classroom-linked interpretations) to inform the conversation you have with families and, where appropriate, the referral you make.",
        ],
      },
    ],
  },
};

export function getModuleContent(sortOrder) {
  return TRAINING_MODULES_CONTENT[sortOrder] || null;
}