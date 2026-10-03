// trainingBlockTemplates.js
//
// Starter ("blank but valid") content for every block type the renderer
// (src/components/TrainingModuleContent.js) knows how to draw. Used by
// the admin "+ Add Content" picker (src/components/TrainingContentEditor.js)
// so a newly-added block always has the fields its renderer expects,
// pre-filled with short placeholder text the admin immediately overwrites
// — never blank/undefined fields that would make the block render oddly
// before it's been edited.
//
// Keep this in sync with BLOCK_RENDERERS in TrainingModuleContent.js —
// the field names here must match exactly what each renderer reads.

export const BLOCK_TYPE_LABELS = {
  hero: "Hero banner",
  richText: "Text",
  timeline: "Timeline",
  principleCards: "Principle cards",
  phasePipeline: "Phase pipeline",
  statCallouts: "Stat callouts",
  domainGrid: "Domain grid",
  caseStudy: "Case study",
  tierCompare: "Tier comparison",
  adminScript: "Administration script",
  scoringTable: "Scoring table",
  interpretationLadder: "Interpretation ladder",
  domainClassroomGuide: "Classroom guide",
  constructMap: "Construct map (reference note)",
  capsMap: "CAPS curriculum map",
  unclearNotice: "Not-covered notice",
};

export const BLOCK_TYPE_DESCRIPTIONS = {
  hero: "Big title + kicker label + short intro paragraph. Usually the first block in a module.",
  richText: "One or more plain paragraphs, with an optional small italic note underneath.",
  timeline: "An ordered list of steps, each with an icon, title and short description.",
  principleCards: "A grid of expandable cards — click to reveal more detail.",
  phasePipeline: "A numbered, horizontal pipeline of phases, each with methods and an outcome.",
  statCallouts: "A row of big-number stat cards, with an optional footnote.",
  domainGrid: "A grid of the four developmental domains, each with a summary and sub-constructs.",
  caseStudy: "A worked example: an intro, a list of rated factors, and a verdict.",
  tierCompare: "Side-by-side comparison cards (e.g. Tier 1 vs Tier 2), plus a shared-foundation strip.",
  adminScript: "A numbered, expandable accordion of script items — built for long step-by-step procedures.",
  scoringTable: "A data table of score bands, plus a card per band explaining what it means.",
  interpretationLadder: "A vertical stack of labeled layers, each its own colour.",
  domainClassroomGuide: "Like Domain grid, but focused on classroom-observable signs per domain.",
  constructMap: "A single reference note in a card — for dense cross-reference content better described than rendered.",
  capsMap: "Subject cards showing directly- and indirectly-linked items.",
  unclearNotice: "An orange callout flagging that this topic isn't covered by the source material.",
};

export function starterBlockData(type) {
  switch (type) {
    case "hero":
      return { type, kicker: "New section", title: "New heading", intro: "Short introduction goes here." };
    case "richText":
      return { type, title: "New section", paragraphs: ["Write the first paragraph here."], note: "" };
    case "timeline":
      return { type, title: "New timeline", steps: [{ icon: "🔹", title: "Step title", body: "What happens in this step." }] };
    case "principleCards":
      return { type, title: "New cards", cards: [{ id: "card-1", title: "Card title", summary: "Short one-line summary.", body: "Fuller detail shown when the card is opened." }] };
    case "phasePipeline":
      return { type, title: "New pipeline", phases: [{ n: 1, name: "Phase name", icon: "🔹", methods: ["Method one"], outcome: "What this phase produces" }] };
    case "statCallouts":
      return { type, title: "New stats", stats: [{ value: "0", label: "What this number means" }], note: "" };
    case "domainGrid":
      return { type, title: "New domain grid", domains: [{ id: "domain-1", label: "Domain name", colorKey: "teal", summary: "What this domain covers.", subConstructs: ["Sub-construct one"] }] };
    case "caseStudy":
      return { type, title: "New case study", intro: "Set up the worked example.", factors: [{ label: "Factor", rating: "weak", note: "Why this factor rated this way." }], verdict: "The outcome of this example." };
    case "tierCompare":
      return {
        type, title: "New comparison", shared: ["Shared point one"],
        tiers: [{ name: "Tier name", users: "Who uses this tier", purpose: "What this tier is for.", supports: ["Supports professionals to..."], provides: ["Provides..."], goal: "One-line goal" }],
      };
    case "adminScript":
      return { type, title: "New script", items: [{ n: 1, title: "Item title", domain: "cognitive", script: "What to say and do.", scoring: "binary", toPass: "What counts as a pass." }] };
    case "scoringTable":
      return {
        type, title: "New scoring table",
        rows: [{ band: "On Track", age: "5", percentile: "≥ 75th", score: "≥ 30" }],
        interpretation: [{ band: "On Track", body: "What this band means." }],
      };
    case "interpretationLadder":
      return { type, title: "New ladder", layers: [{ label: "Layer label", colorKey: "teal" }] };
    case "domainClassroomGuide":
      return { type, title: "New classroom guide", domains: [{ id: "domain-1", label: "Domain name", colorKey: "teal", summary: "What this domain covers.", classroom: ["An example of this domain in the classroom"] }] };
    case "constructMap":
      return { type, title: "New construct map", note: "Describe the reference content here." };
    case "capsMap":
      return { type, title: "New CAPS map", intro: "Short intro to the mapping.", subjects: [{ name: "Subject name", direct: ["Directly-linked item"], indirect: ["Closest-fit item"] }] };
    case "unclearNotice":
      return { type, title: "Not covered in the training deck", body: "Explain what isn't covered and where to look instead." };
    default:
      return { type };
  }
}