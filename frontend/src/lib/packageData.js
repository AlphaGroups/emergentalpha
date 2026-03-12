// Package rates per sq ft
export const PACKAGE_RATES = {
  basic: {
    independent_house: 1850,
    villa: 2200,
    apartment: 1650,
    school: 1750,
    interior: 1200
  },
  premium: {
    independent_house: 2350,
    villa: 2800,
    apartment: 2100,
    school: 2200,
    interior: 1600
  },
  luxury: {
    independent_house: 2950,
    villa: 3500,
    apartment: 2650,
    school: 2800,
    interior: 2200
  }
};

// Package details with features
export const PACKAGES = {
  basic: {
    name: "Basic",
    description: "Quality construction with standard specifications",
    features: [
      "Tata/JSW TMT Steel",
      "UltraTech/ACC Cement",
      "Standard Electrical (Finolex)",
      "CPVC Plumbing (Astral)",
      "Basic Flooring (Vitrified Tiles)",
      "Asian Paints Interior",
      "Standard Windows (Aluminium)"
    ],
    rates: PACKAGE_RATES.basic
  },
  premium: {
    name: "Premium",
    description: "Enhanced quality with premium materials",
    features: [
      "Tata Tiscon TMT Steel",
      "UltraTech Premium Cement",
      "Premium Electrical (Havells)",
      "CPVC Plumbing (Supreme)",
      "Italian Marble/Granite Flooring",
      "Asian Paints Royale",
      "uPVC Windows (Fenesta)",
      "Modular Kitchen (Basic)"
    ],
    rates: PACKAGE_RATES.premium
  },
  luxury: {
    name: "Luxury",
    description: "Top-tier construction with luxury finishes",
    features: [
      "Tata Tiscon Super TMT",
      "ACC Gold Cement",
      "Premium Electrical (Schneider)",
      "Premium Plumbing (Jaquar)",
      "Imported Marble/Granite",
      "Asian Paints Ultima",
      "uPVC Windows (Fenesta Pro)",
      "Premium Modular Kitchen",
      "Home Automation Ready",
      "Vastu Compliance"
    ],
    rates: PACKAGE_RATES.luxury
  }
};

// Material specifications
export const MATERIAL_SPECS = [
  {
    category: 'Steel',
    basic: 'Tata/JSW TMT Fe500',
    premium: 'Tata Tiscon Fe500D',
    luxury: 'Tata Tiscon Super Fe550D',
  },
  {
    category: 'Cement',
    basic: 'UltraTech/ACC OPC 53',
    premium: 'UltraTech Premium OPC 53',
    luxury: 'ACC Gold/Birla A1',
  },
  {
    category: 'Electrical',
    basic: 'Finolex Wires + Standard MCBs',
    premium: 'Havells + Modular Switches',
    luxury: 'Schneider Electric Premium',
  },
  {
    category: 'Plumbing',
    basic: 'Astral CPVC Pipes',
    premium: 'Supreme CPVC + Hindware',
    luxury: 'Jaquar Complete Solution',
  },
  {
    category: 'Paints',
    basic: 'Asian Paints Tractor Emulsion',
    premium: 'Asian Paints Royale',
    luxury: 'Asian Paints Ultima/Berger Silk',
  },
  {
    category: 'Windows',
    basic: 'Aluminium Sliding',
    premium: 'uPVC (Fenesta/LG)',
    luxury: 'Fenesta Pro + Tinted Glass',
  },
];

// Quality checkpoints
export const QUALITY_CHECKPOINTS = [
  { 
    stage: 'Foundation', 
    checks: '85 Checkpoints', 
    items: ['Soil Testing', 'Excavation Depth', 'PCC Level', 'Steel Placement'] 
  },
  { 
    stage: 'Structure', 
    checks: '120 Checkpoints', 
    items: ['Column Alignment', 'Beam Reinforcement', 'Slab Thickness', 'Curing Process'] 
  },
  { 
    stage: 'Finishing', 
    checks: '145 Checkpoints', 
    items: ['Plastering Quality', 'Tile Alignment', 'Paint Finish', 'Hardware Fitting'] 
  },
  { 
    stage: 'Final', 
    checks: '50 Checkpoints', 
    items: ['Electrical Testing', 'Plumbing Pressure', 'Door Operation', 'Final Inspection'] 
  },
];

/**
 * Calculate construction cost
 * @param {number} plotArea - Area in sq.ft
 * @param {string} projectType - Type of project (e.g., 'independent_house')
 * @param {string} packageType - Package type ('basic', 'premium', 'luxury')
 * @returns {object|null} Calculation result or null if invalid
 */
export function calculateConstructionCost(plotArea, projectType, packageType) {
  const packageKey = packageType.toLowerCase();
  const projectKey = projectType.toLowerCase().replace(' ', '_');

  if (!PACKAGE_RATES[packageKey]) {
    return null;
  }
  if (!PACKAGE_RATES[packageKey][projectKey]) {
    return null;
  }

  const baseRate = PACKAGE_RATES[packageKey][projectKey];
  const estimatedCost = plotArea * baseRate;

  return {
    plot_area: plotArea,
    project_type: projectType,
    package_type: packageType,
    base_rate: baseRate,
    estimated_cost: estimatedCost,
    min_estimate: estimatedCost * 0.95,
    max_estimate: estimatedCost * 1.10
  };
}
