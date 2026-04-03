import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API, PROPERTY_TYPES, LISTING_STATUS } from '@/config/constants';

const AdminListings = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    property_type: 'villa',
    location: '',
    price: '',
    area_sqft: '',
    bedrooms: 3,
    bathrooms: 3,
    description: '',
    images: [],
    status: 'available',
    owner_type: 'alpha',
    amenities: []
  });

  const fetchListings = async () => {
    try {
      const response = await axios.get(`${API}/admin/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [token]);

  const createListing = async () => {
    if (!newListing.title || !newListing.location || !newListing.price) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      await axios.post(`${API}/admin/listings`, {
        ...newListing,
        price: parseFloat(newListing.price),
        area_sqft: parseFloat(newListing.area_sqft)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Listing created');
      setAddDialogOpen(false);
      setNewListing({
        title: '', property_type: 'villa', location: '', price: '', area_sqft: '',
        bedrooms: 3, bathrooms: 3, description: '', images: [], status: 'available',
        owner_type: 'alpha', amenities: []
      });
      fetchListings();
    } catch (error) {
      toast.error('Failed to create listing');
    }
  };

  const updateListing = async (listingId, updates) => {
    try {
      await axios.patch(`${API}/admin/listings/${listingId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Listing updated');
      fetchListings();
    } catch (error) {
      toast.error('Failed to update listing');
    }
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete(`${API}/admin/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Listing deleted');
      fetchListings();
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const config = LISTING_STATUS.find(s => s.value === status) || LISTING_STATUS[0];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-listings" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#010822]">Property Listings</h1>
          <p className="text-slate-500 mt-1">Manage sales listings</p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2a4599] hover:bg-[#1e3a8a]">
              <Plus className="mr-2" size={16} />
              Add Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                  placeholder="e.g., Premium 3BHK Villa in Kokapet"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property Type</Label>
                  <Select
                    value={newListing.property_type}
                    onValueChange={(value) => setNewListing({ ...newListing, property_type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newListing.location}
                    onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                    placeholder="e.g., Gachibowli, Hyderabad"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Area (sq.ft)</Label>
                  <Input
                    type="number"
                    value={newListing.area_sqft}
                    onChange={(e) => setNewListing({ ...newListing, area_sqft: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bedrooms</Label>
                  <Input
                    type="number"
                    value={newListing.bedrooms}
                    onChange={(e) => setNewListing({ ...newListing, bedrooms: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    value={newListing.bathrooms}
                    onChange={(e) => setNewListing({ ...newListing, bathrooms: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={newListing.status}
                    onValueChange={(value) => setNewListing({ ...newListing, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LISTING_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Owner Type</Label>
                  <Select
                    value={newListing.owner_type}
                    onValueChange={(value) => setNewListing({ ...newListing, owner_type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpha">Alpha Groups</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={createListing} className="w-full bg-[#F97316] hover:bg-[#ea580c]">
                Create Listing
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p>No listings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Property</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Owner</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-xs text-slate-500">{listing.location}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{listing.property_type}</TableCell>
                    <TableCell className="font-medium">{formatPrice(listing.price)}</TableCell>
                    <TableCell>
                      <Select
                        value={listing.status}
                        onValueChange={(value) => updateListing(listing.id, { status: value })}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LISTING_STATUS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="capitalize">{listing.owner_type}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => deleteListing(listing.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminListings;
