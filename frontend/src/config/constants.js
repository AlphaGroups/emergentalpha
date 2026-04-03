// New Logo URL
export const LOGO_URL = 'https://customer-assets.emergentagent.com/job_alpha-groups-build/artifacts/ciwa7zg4_Logo%20new.png';

// API Base URL
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Package Types
export const PACKAGE_TYPES = ['classic', 'select', 'signature', 'customize'];

// Lead Status Options
export const LEAD_STATUS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-700' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
];

// Vendor Categories - Grouped
export const VENDOR_CATEGORY_GROUPS = [
  {
    group: 'Design & Engineering',
    categories: [
      'Architect',
      'Structural Engineer',
      'Interior Designer',
      'Landscape Designer',
      'MEP Consultant',
      'Electrical Designer',
      'Plumbing Designer',
      'HVAC Designer',
      'BIM Modeler / Draftsman',
      '3D Visualizer',
    ]
  },
  {
    group: 'Liaisoning & Approvals',
    categories: [
      'Liaisoning Consultant (GHMC/HMDA)',
      'Legal Consultant',
      'Surveyor (Land Survey)',
      'Town Planning Consultant',
    ]
  },
  {
    group: 'Execution (Technicians & Contractors)',
    categories: [
      'Civil Works',
      'Labour Contractor',
      'Centring Contractor',
      'Piling Works',
      'Interior Works',
      'Demolition Works',
      'Waterproofing Works',
      'Electrician',
      'Plumbing',
      'HVAC',
      'Painter',
      'Flooring (Tiles, Granite)',
      'Roofing',
      'Carpenter',
      'False Ceiling',
    ]
  },
  {
    group: 'Material Suppliers',
    categories: [
      'Cement & TMT',
      'Sand & Aggregates',
      'Bricks & Blocks',
      'Tiles & Granite',
      'Electrical Materials',
      'Plumbing Materials',
      'Paint Supplier',
      'Hardware Supplier',
      'Doors & Windows (Wood)',
      'UPVC Materials',
      'Plywood & False Ceiling',
    ]
  },
  {
    group: 'Specialized Services',
    categories: [
      'QAQC Labs',
      'Inspection Services',
      'Borewell',
      'Solar Panel Installer',
      'Lift / Elevator Supplier',
      'Fire Safety Systems',
      'CCTV & Security Systems',
    ]
  },
  {
    group: 'Equipment & Rentals',
    categories: [
      'Machinery Rental (JCB, Excavators)',
      'Scaffolding Supplier',
    ]
  },
  {
    group: 'Other',
    categories: [
      'Other',
    ]
  }
];

// Flat list for backward compatibility
export const VENDOR_CATEGORIES = VENDOR_CATEGORY_GROUPS.flatMap(g => g.categories);

// Property Types
export const PROPERTY_TYPES = [
  { value: 'flat', label: 'Flat' },
  { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'Independent House' },
  { value: 'plot', label: 'Plot' }
];

// Listing Status
export const LISTING_STATUS = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700' },
  { value: 'sold', label: 'Sold', color: 'bg-red-100 text-red-700' },
  { value: 'coming_soon', label: 'Coming Soon', color: 'bg-yellow-100 text-yellow-700' },
];

// Collaboration Intent Types
export const COLLABORATION_INTENTS = [
  { value: 'landowner', label: 'Land Owner' },
  { value: 'investor', label: 'Investor' },
  { value: 'nri', label: 'NRI' }
];
