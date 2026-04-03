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

// Vendor Categories
export const VENDOR_CATEGORIES = [
  'Architect',
  'Structural Engineer',
  'Contractor',
  'Plumber',
  'Electrician',
  'Material Supplier',
  'Interior Designer',
  'Landscaper',
  'HVAC Specialist',
  'Waterproofing Expert'
];

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
