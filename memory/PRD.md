# Alpha Groups Website - PRD

## Original Problem Statement
Build a CRO-optimized website for Alpha Groups, a Hyderabad-based turnkey construction firm with:
- Service: Turnkey construction (End-to-end except approvals)
- Scope: Independent homes, luxury villas, G+5 apartments, schools, residential interiors
- Market Positioning: Professional, transparent, tech-forward

## User Personas
1. **Hyderabad Homeowner**: Looking to build independent house, concerned about delays & hidden costs
2. **Villa Buyer**: Premium customer seeking luxury villa construction
3. **Property Developer**: Building G+5 apartments
4. **Business Owner**: Schools or commercial construction
5. **Interior Client**: Residential interior renovation

## Core Requirements (Static)
- [x] Home page with high-conversion hero section
- [x] Packages page with Basic/Premium/Luxury tiers
- [x] Services page covering all 5 service types
- [x] Cost Calculator with lead capture
- [x] Contact form for inquiries
- [x] Admin panel for lead management
- [x] Comparison section (Alpha Groups vs Local Contractors)
- [x] Trust signals with premium brands (Tata Steel, UltraTech, Asian Paints)
- [x] Quality checkpoints section (400+ checks)
- [x] Local SEO keywords in footer

## What's Been Implemented (December 2025)

### Frontend (React + Tailwind CSS)
- **Home Page**: Hero section with pain-point headlines, trust badges, comparison table, process steps, quality guarantee, CTA sections
- **Packages Page**: 3-tier pricing (Basic/Premium/Luxury), project type selector, material specifications, quality checkpoints
- **Services Page**: 5 services (Houses, Villas, Apartments, Schools, Interiors) with features and scope
- **Calculator Page**: 2-step wizard (project details → results + lead capture)
- **Contact Page**: Contact form with Hyderabad location selector
- **Admin Panel**: Login/Register, Dashboard with analytics, Leads management with status updates

### Backend (FastAPI + MongoDB)
- `/api/packages` - Package details with rates
- `/api/calculate` - Cost calculation engine
- `/api/leads` - Lead submission
- `/api/quote-request` - Quote request from calculator
- `/api/admin/login` - Admin authentication
- `/api/admin/register` - Admin registration
- `/api/admin/leads` - Leads CRUD
- `/api/admin/analytics` - Dashboard analytics

### Design
- Brand colors: Dusk Blue (#2a4599), Dark Blue (#010822), Accent Orange (#F97316)
- Typography: Montserrat
- Professional, tech-forward aesthetic

## Contact Information
- Phone: +91 94928 82197
- Email: alphagroups1997@gmail.com
- Location: Hyderabad, Telangana

## Prioritized Backlog

### P0 - Complete
- [x] Homepage with conversion elements
- [x] Packages with pricing
- [x] Cost calculator with lead capture
- [x] Contact form
- [x] Admin panel for leads

### P1 - Recommended Next
- [ ] Add more 3 hero headline variations (A/B testing ready)
- [ ] Vastu Checklist interactive tool
- [ ] Borewell depth vs Foundation guide
- [ ] Testimonials carousel with real customer photos
- [ ] Project portfolio gallery

### P2 - Future Enhancement
- [ ] WhatsApp integration for instant chat
- [ ] Email notifications for new leads
- [ ] SMS alerts
- [ ] Google Analytics integration
- [ ] Blog/Content section for SEO

## Local SEO Keywords (Implemented)
1. house construction in Hyderabad
2. villa builders in Gachibowli
3. turnkey construction Hyderabad
4. residential builders Jubilee Hills
5. construction company Kondapur
6. building contractors Madhapur
7. home builders Hitech City
8. apartment builders Hyderabad
9. construction services Telangana
10. best builders in Hyderabad

## Next Action Items
1. Add testimonials with real project photos
2. Create project portfolio gallery
3. Implement WhatsApp chat widget
4. Set up email notifications for leads
5. Add more interactive tools (Vastu Checklist)
