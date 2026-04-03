# Alpha Groups PropTech Platform - PRD

## Original Problem Statement
Build a CRO-optimized PropTech platform for Alpha Groups, a Hyderabad-based turnkey construction firm with:
- Service: Turnkey construction (End-to-end except approvals)
- Scope: Independent homes, luxury villas, G+5 apartments, schools, residential interiors
- Market Positioning: Professional, transparent, tech-forward
- Packages: Classic / Select / Signature / Customize

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
│       ├── config/constants.js (VENDOR_CATEGORY_GROUPS, PACKAGE_TYPES, etc.)
│       ├── utils/exportExcel.js
│       ├── context/ (AuthContext, PartnerAuthContext)
│       ├── components/ (Navbar, Footer, AdminLayout, PartnerLayout)
│       └── pages/ (Home, Calculator, Packages, Collaboration, Sales, Vendor, Partner, Admin)
```

## Key API Endpoints
- POST /api/quick-lead - Homepage lead capture
- POST /api/leads - Public lead with referral_code support
- POST /api/calculate - Cost calculation
- GET /api/packages - 4 package configs + features
- POST /api/partner/register, /api/partner/verify-otp - Registration with OTP
- POST /api/partner/login - Phone + password login
- POST /api/partner/login-otp, /api/partner/login-otp-verify - OTP login
- POST /api/partner/reset-password, /api/partner/reset-password-confirm - Password reset
- POST /api/vendors - Vendor registration (optional email/company/attachment)
- POST /api/admin/materials - Upload marketing materials
- GET /api/admin/partners-analytics - All partners lead analytics
- GET /api/admin/partners/{id}/analytics - Individual partner analytics
- POST /api/admin/packages/features/reorder - Reorder features

## What's Been Implemented

### Session 1 (Dec 2025)
- Basic homepage, packages, services, calculator, contact, admin panel

### Session 2
- Partner portal, collaboration page, sales listings, vendor registration
- Admin dashboard expanded

### Session 3 (April 2026)
- Cost Calculator fixed (real-time frontend calculation)
- Navigation restructured (Home/Our Services/Collaboration/Sales)
- Hero CTA "Start Your Project" with lead capture modal
- Packages moved to homepage (card layout, "Recommended" badge)
- 5-step process (Requirement Collection → Estimation → Design → Construction → Handover)
- Card-based "Why Choose Us"
- Collaboration page: value generation models

### Session 4 (April 2026)
- Partner system overhaul: phone-based login, OTP login, password reset, registration with password
- Partner removed from main nav (footer only), ScrollToTop
- Demo credentials on Admin + Partner login pages
- Admin sidebar: Materials tab added

### Session 5 (April 2026) — Current
- **Partner Add Lead**: New page (/partner/add-lead) for partners to submit leads with auto-tagged referral_code
- **Public Lead Form**: On partner landing page with referral code field
- **Commission text**: Changed "Earn 2%" to "Earn Up To 2%" everywhere
- **Vendor file upload**: Optional attachment (PDF/image, 5MB max) for brochure/visiting card
- **Vendor categories**: Comprehensive grouped list (7 groups, 50+ categories with collapsible sections)
- **Admin Export**: Excel export for Leads, Partners, Vendors tabs
- **Admin Feature Reorder**: Up/down arrows to reorder package features
- **Admin Materials**: Upload marketing materials with WhatsApp share to partners
- **Admin Partner Analytics**: Per-partner lead breakdown (Total/New/Contacted/Converted/Lost + conversion rate)

## Prioritized Backlog

### P1 - Recommended Next
- [ ] Integrate real SMS provider (Twilio) for OTP
- [ ] WhatsApp Business API for automated material distribution
- [ ] Testimonials carousel with real customer photos
- [ ] Project portfolio gallery
- [ ] Admin category management (add/edit vendor categories dynamically)

### P2 - Future Enhancement
- [ ] Google Analytics integration
- [ ] Blog/Content section for SEO
- [ ] Email notifications for new leads
- [ ] A/B testing for hero headlines
- [ ] Vastu Checklist interactive tool

## Testing Status
- Iteration 1-5: All Passed
- Iteration 6: Passed (100% backend 14/14, 100% frontend)
