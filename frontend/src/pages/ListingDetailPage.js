import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Phone,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API, LISTING_STATUS } from '@/config/constants';

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`${API}/listings/${id}`);
        setListing(response.data);
      } catch (error) {
        // Use placeholder for demo
        setListing({
          id: id,
          title: 'Premium 3BHK Villa in Kokapet',
          property_type: 'villa',
          location: 'Kokapet, Hyderabad',
          price: 25000000,
          area_sqft: 3200,
          bedrooms: 3,
          bathrooms: 4,
          status: 'available',
          description: 'Luxurious 3BHK villa in the heart of Kokapet with modern amenities and premium finishes. Built with top-quality materials including Tata Steel, UltraTech cement, and Asian Paints. Features include a spacious living area, modular kitchen, and private garden.',
          images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
          ],
          amenities: ['Swimming Pool', 'Garden', 'Parking', 'Security', 'Power Backup', 'Modular Kitchen']
        });
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = LISTING_STATUS.find(s => s.value === status) || LISTING_STATUS[0];
    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-600 mb-4">Property Not Found</h2>
          <Link to="/sales">
            <Button>Back to Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="listing-detail-page" className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/sales"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Listings</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-sm overflow-hidden">
              <img 
                src={listing.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
                alt={listing.title}
                className="w-full h-[400px] object-cover"
              />
              {listing.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2">
                  {listing.images.slice(1, 5).map((img, idx) => (
                    <img 
                      key={idx}
                      src={img}
                      alt={`View ${idx + 2}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white p-8 rounded-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#010822] mb-2">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={16} />
                    <span>{listing.location}</span>
                  </div>
                </div>
                {getStatusBadge(listing.status)}
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[#2a4599] mb-1">
                    <Bed size={20} />
                    <span className="text-2xl font-bold">{listing.bedrooms}</span>
                  </div>
                  <span className="text-sm text-slate-500">Bedrooms</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[#2a4599] mb-1">
                    <Bath size={20} />
                    <span className="text-2xl font-bold">{listing.bathrooms}</span>
                  </div>
                  <span className="text-sm text-slate-500">Bathrooms</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[#2a4599] mb-1">
                    <Maximize size={20} />
                    <span className="text-2xl font-bold">{listing.area_sqft}</span>
                  </div>
                  <span className="text-sm text-slate-500">Sq.Ft</span>
                </div>
              </div>

              {/* Description */}
              <div className="py-6">
                <h3 className="font-bold text-[#010822] mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed">{listing.description}</p>
              </div>

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div className="py-6 border-t border-slate-100">
                  <h3 className="font-bold text-[#010822] mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="text-green-500" size={16} />
                        <span className="text-slate-600 text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white p-6 rounded-sm sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[#2a4599] mb-1">
                  {formatPrice(listing.price)}
                </div>
                <div className="text-slate-500 text-sm">
                  ₹{Math.round(listing.price / listing.area_sqft).toLocaleString()}/sqft
                </div>
              </div>

              <a href="tel:9492882197">
                <Button 
                  data-testid="contact-btn"
                  className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white font-bold py-4 mb-4"
                >
                  <Phone className="mr-2" size={18} />
                  Call Now
                </Button>
              </a>

              <Link to="/contact">
                <Button 
                  variant="outline"
                  className="w-full border-2 border-[#2a4599] text-[#2a4599] hover:bg-[#2a4599] hover:text-white font-bold py-4"
                >
                  Request Callback
                </Button>
              </Link>

              <p className="text-xs text-slate-500 text-center mt-4">
                Contact us for site visits and more details
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
