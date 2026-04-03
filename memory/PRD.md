# Alpha Groups PropTech Platform - PRD

## Original Problem Statement
Build a CRO-optimized PropTech platform for Alpha Groups, a Hyderabad-based turnkey construction firm with:
- Service: Turnkey construction (End-to-end except approvals)
- Scope: Independent homes, luxury villas, G+5 apartments, schools, residential interiors
- Market Positioning: Professional, transparent, tech-forward
- Packages: Classic / Select / Signature / Customize

## User Personas
1. **Hyderabad Homeowner**: Looking to build independent house, concerned about delays & hidden costs
2. **Villa Buyer**: Premium customer seeking luxury villa construction
3. **Property Developer**: Building G+5 apartments
4. **Business Owner**: Schools or commercial construction
5. **Interior Client**: Residential interior renovation
6. **Referral Partner**: Earns commission by referring homebuilders
7. **Vendor**: Professionals seeking project opportunities

## Core Requirements
- [x] Home page with high-conversion hero section & "Start Your Project" CTA
- [x] Packages section on homepage (Classic/Select/Signature/Customize cards)
- [x] Dedicated Packages page with detailed comparison table
- [x] Cost Calculator with real-time estimation & lead capture
- [x] Admin panel for leads, packages, partners, vendors, listings
- [x] Partner Referral System with landing page, registration (mocked OTP), and dashboard
- [x] Collaboration page for landowners with value generation models
- [x] Sales listings page
- [x] Vendor registration with optional company name & email
- [x] 5-step transparent process (Requirement Collection → Estimation → Design → Construction → Handover)
- [x] Card-based "Why Choose Us" storytelling section

## Architecture
```
/app/
├── backend/
│   ├── server.py (FastAPI + MongoDB)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   └── src/
│       ├── App.js
│       ├── config/constants.js
│       ├── context/ (AuthContext, PartnerAuthContext)
│       ├── components/ (Navbar, Footer, AdminLayout, PartnerLayout)
│       └── pages/ (Home, Calculator, Packages, Collaboration, Sales, Vendor, Partner, Admin)
```

## Key API Endpoints
- POST /api/quick-lead - Homepage lead capture
- POST /api/calculate - Cost calculation (validates project_type & package_type)
- GET /api/packages - 4 package configs + 16 features
- POST /api/partner/register - Partner registration (mocked OTP)
- POST /api/partner/verify-otp - Verify OTP (123456)
- POST /api/vendors - Vendor registration (optional email/company)
- POST /api/admin/login - Admin auth

## Design System
- Brand Colors: Dusk Blue (#2a4599), Dark Blue (#010822), Orange (#F97316)
- Typography: Montserrat
- Components: Shadcn UI + Tailwind CSS

## Contact Info
- Phone: +91 94928 82197
- Email: alphagroups1997@gmail.com
- Location: Hyderabad, Telangana

## What's Been Implemented (April 2026)

### Session 1 (Dec 2025)
- Basic homepage, packages, services, calculator, contact, admin panel

### Session 2 (Recent)
- Partner portal, collaboration page, sales listings, vendor registration
- Admin dashboard expanded (leads, packages, partners, listings, vendors)

### Session 3 (Current - April 2026)
- **P0 Fixed**: Cost Calculator - real-time frontend calculation (area × rate), validation for negatives/empty/large values
- **P0 Fixed**: Navigation restructured to Home/Our Services/Collaboration/Sales (Partner removed from nav, kept in footer)
- **P0 Fixed**: Hero CTA changed to "Start Your Project" → lead capture modal
- **P0 Fixed**: Partner system overhaul: registration with password, login with phone+password or phone+OTP, forgot password with OTP reset, email optional
- **P0 Fixed**: ScrollToTop on route change (footer links now scroll to top)
- **P1 Done**: Packages moved to homepage as card layout with "Recommended" badge on Select
- **P1 Done**: Process updated to exact 5 steps (Requirement Collection → Estimation & Agreement → Planning & Design → Construction → Handover & Warranty)
- **P1 Done**: "Why Choose Us" redesigned from comparison table to card-based storytelling
- **P1 Done**: Collaboration page enhanced with value generation models (Rental Income, Mixed-Use, Profit Share)
- **P2 Done**: Vendor form - Company Name and Email made optional
- **P2 Done**: Admin login link in footer (already existed)
- **Backend Fix**: /api/calculate validates project_type and package_type against allowed values
- **Backend Fix**: QuickLeadCreate model for homepage lead capture

## Prioritized Backlog

### P0 - All Complete

### P1 - Recommended Next
- [ ] WhatsApp integration for instant chat
- [ ] Email notifications for new leads
- [ ] Real SMS OTP for partner registration (replace mock)
- [ ] Testimonials carousel with real customer photos
- [ ] Project portfolio gallery

### P2 - Future Enhancement
- [ ] Google Analytics integration
- [ ] Blog/Content section for SEO
- [ ] A/B testing for hero headlines
- [ ] Vastu Checklist interactive tool
- [ ] SMS alerts for lead status changes

## Testing Status
- Iteration 1: Passed
- Iteration 2: Passed
- Iteration 3: Passed (100% backend 22/22, 100% frontend)
