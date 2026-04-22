import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  IndianRupee,
  Building2,
  Home,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API, PROPERTY_TYPES, LISTING_STATUS } from '@/config/constants';

const SalesPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    property_type: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.property_type !== 'all') params.append('property_type', filters.property_type);
      if (filters.status !== 'all') params.append('status', filters.status);
      
      const response = await axios.get(`${API}/listings?${params}`);
      const data = response.data;
      setListings(Array.isArray(data) ? data : Array.isArray(data?.listings) ? data.listings : Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = LISTING_STATUS.find(s => s.value === status) || LISTING_STATUS[0];
    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const getPropertyIcon = (type) => {
    switch (type) {
      case 'villa': return Building2;
      case 'flat': return Building2;
      default: return Home;
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Placeholder listings if no data
  const placeholderListings = [
    {
      id: 'placeholder-1',
      title: 'Premium 3BHK Villa in Kokapet',
      property_type: 'villa',
      location: 'Kokapet, Hyderabad',
      price: 25000000,
      area_sqft: 3200,
      bedrooms: 3,
      bathrooms: 4,
      status: 'available',
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      amenities: ['Swimming Pool', 'Garden', 'Parking']
    },
    {
      id: 'placeholder-2',
      title: 'Luxury 4BHK Independent House',
      property_type: 'house',
      location: 'Jubilee Hills, Hyderabad',
      price: 45000000,
      area_sqft: 4500,
      bedrooms: 4,
      bathrooms: 5,
      status: 'coming_soon',
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
      amenities: ['Home Theater', 'Gym', 'Terrace Garden']
    },
    {
      id: 'placeholder-3',
      title: 'Modern 2BHK Flat in Gachibowli',
      property_type: 'flat',
      location: 'Gachibowli, Hyderabad',
      price: 8500000,
      area_sqft: 1200,
      bedrooms: 2,
      bathrooms: 2,
      status: 'available',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      amenities: ['Clubhouse', 'Security', 'Power Backup']
    }
  ];

  const displayListings = listings.length > 0 ? listings : placeholderListings;

  return (
    <div data-testid="sales-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#010822] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Property Sales
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Explore premium properties built by Alpha Groups and our collaboration partners
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            
            <Select
              value={filters.property_type}
              onValueChange={(value) => setFilters({ ...filters, property_type: value })}
            >
              <SelectTrigger data-testid="filter-type" className="w-40">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger data-testid="filter-status" className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {LISTING_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2a4599] border-t-transparent"></div>
            </div>
          ) : displayListings.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-600 mb-2">No Properties Found</h3>
              <p className="text-slate-500">Check back soon for new listings</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayListings.map((listing) => {
                const PropertyIcon = getPropertyIcon(listing.property_type);
                
                return (
                  <Link 
                    key={listing.id}
                    to={`/sales/${listing.id}`}
                    data-testid={`listing-${listing.id}`}
                    className="bg-white rounded-sm overflow-hidden border border-slate-200 hover:shadow-xl transition-all group"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm">
                        <span className="text-lg font-bold text-[#2a4599]">
                          {formatPrice(listing.price)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                        <PropertyIcon size={16} />
                        <span className="capitalize">{listing.property_type}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-[#010822] mb-2 group-hover:text-[#2a4599] transition-colors">
                        {listing.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                        <MapPin size={14} />
                        <span>{listing.location}</span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Bed size={16} />
                          <span>{listing.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Bath size={16} />
                          <span>{listing.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Maximize size={16} />
                          <span>{listing.area_sqft} sqft</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#2a4599]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Looking to Build Your Own Home?
          </h2>
          <p className="text-slate-200 mb-8">
            Explore our construction packages or get a free cost estimate
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/packages">
              <Button 
                className="bg-white text-[#2a4599] hover:bg-slate-100 font-bold px-8 py-4"
              >
                View Packages
              </Button>
            </Link>
            <Link to="/calculator">
              <Button 
                className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-8 py-4"
              >
                Get Cost Estimate
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalesPage;
