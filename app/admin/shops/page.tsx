'use client';
import { toast } from 'sonner';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/lib/config';
import { postcodeAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Building2,
  Edit,
  Trash2,
  Monitor,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Store,
  UserCheck,
  UserX
} from 'lucide-react';
import { shopsAPI } from '@/lib/api';
import api from '@/lib/api';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SHOP_TYPES } from '@/lib/constants';

interface Shop {
  id: number;
  name: string;
  address: string;
  postcode?: string;
  shop_type?: string;
  phone: string;
  approval_status?: string;
  subscription_status: string;
  owner_name: string;
  owner_email: string;
  registered_by_name?: string;
  designer_name?: string;
  designer_id?: number;
  screen_count: number;
  created_at: string;
  approved_at?: string;
  rejection_reason?: string;
  photo_url?: string;
}

interface Designer {
  id: number;
  full_name: string;
  email: string;
  assigned_shops: number;
  pending_content: number;
}

export default function ShopsManagementPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [pendingShops, setPendingShops] = useState<Shop[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedDesigner, setSelectedDesigner] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [shopPhoto, setShopPhoto] = useState<File | null>(null);
  const [createFormData, setCreateFormData] = useState({
    shopName: '',
    address: '',
    city: '',
    postcode: '',
    shopPhone: '',
    shopType: 'retail',
    ownerEmail: '',
    ownerPassword: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPhone: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',
    address: '',
    postcode: '',
    shop_type: 'retail',
    phone: ''
  });

  // Postcode lookup states for edit form
  const [editPostcodeLoading, setEditPostcodeLoading] = useState(false);
  const [editAddressSuggestions, setEditAddressSuggestions] = useState<any[]>([]);
  const [showEditAddressSuggestions, setShowEditAddressSuggestions] = useState(false);
  const editAddressDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editAddressDropdownRef.current && !editAddressDropdownRef.current.contains(event.target as Node)) {
        setShowEditAddressSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Postcode lookup for edit form
  const handleEditPostcodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const postcode = e.target.value;
    setFormData({ ...formData, postcode: postcode });

    if (!postcode) {
      setEditAddressSuggestions([]);
      setShowEditAddressSuggestions(false);
      return;
    }

    const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
    if (postcodePattern.test(postcode.replace(/\s/g, ''))) {
      await lookupPostcode(postcode);
    }
  };

  const lookupPostcode = async (postcode: string) => {
    setEditPostcodeLoading(true);

    try {
      const addressResponse = await postcodeAPI.getAddresses(postcode);
      if (addressResponse.success && addressResponse.addresses?.length > 0) {
        setEditAddressSuggestions(addressResponse.addresses);
        setShowEditAddressSuggestions(true);
      } else {
        // Fallback to basic postcode lookup
        const basicResponse = await postcodeAPI.lookup(postcode);
        if (basicResponse.success && basicResponse.data) {
          const data = basicResponse.data;
          setFormData(prev => ({
            ...prev,
            address: prev.address || data.city || '',
          }));
        }
      }
    } catch (error) {
      console.error('Postcode lookup failed:', error);
    } finally {
      setEditPostcodeLoading(false);
    }
  };

  const selectAddress = (address: any) => {
    setFormData(prev => ({
      ...prev,
      address: address.line1 || '',
    }));

    setShowEditAddressSuggestions(false);
    setEditAddressSuggestions([]);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all shops
      const shopsResponse = await api.get('/admin/shops');
      const allShops = shopsResponse.data;

      // Separate pending and other shops
      setShops(allShops.filter((s: Shop) => s.approval_status !== 'pending'));
      setPendingShops(allShops.filter((s: Shop) => s.approval_status === 'pending'));

      // Fetch designers
      const designersResponse = await api.get('/admin/designers');
      setDesigners(designersResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateShop = async () => {
    if (!selectedShop) return;

    try {
      await shopsAPI.update(selectedShop.id.toString(), {
        name: formData.name,
        address: formData.address,
        postcode: formData.postcode,
        shop_type: formData.shop_type,
        phone: formData.phone,
        designer_id: selectedDesigner === 'none' ? null : (selectedDesigner ? parseInt(selectedDesigner) : null)
      });

      setIsEditDialogOpen(false);
      setSelectedShop(null);
      setSelectedDesigner('');
      fetchAllData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update shop');
    }
  };

  const handleDeleteShop = (shop: Shop) => {
    setShopToDelete(shop);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteShop = async () => {
    if (!shopToDelete) return;

    try {
      await shopsAPI.delete(shopToDelete.id.toString());
      toast.success(`Shop "${shopToDelete.name}" deleted successfully`);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete shop');
    } finally {
      setDeleteDialogOpen(false);
      setShopToDelete(null);
    }
  };

  const handleApprove = async () => {
    if (!selectedDesigner) {
      toast.error('Please select a designer');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/admin/shops/${selectedShop?.id}/approve`, {
        status: 'approved',
        designer_id: selectedDesigner
      });

      await fetchAllData();
      setApprovalDialog(false);
      setSelectedShop(null);
      setSelectedDesigner('');
      toast.success('Shop approved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve shop');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/admin/shops/${selectedShop?.id}/approve`, {
        status: 'rejected',
        rejection_reason: rejectionReason
      });

      await fetchAllData();
      setRejectDialog(false);
      setSelectedShop(null);
      setRejectionReason('');
      toast.success('Shop rejected');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reject shop');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditClick = (shop: Shop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      ownerEmail: shop.owner_email,
      ownerName: shop.owner_name,
      ownerPassword: '',
      address: shop.address,
      postcode: shop.postcode || '',
      shop_type: shop.shop_type || 'retail',
      phone: shop.phone
    });
    setSelectedDesigner(shop.designer_id ? shop.designer_id.toString() : 'none');
    setIsEditDialogOpen(true);
  };

  const openApprovalDialog = (shop: Shop) => {
    setSelectedShop(shop);
    setApprovalDialog(true);
  };

  const openRejectDialog = (shop: Shop) => {
    setSelectedShop(shop);
    setRejectDialog(true);
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const submitData = new FormData();
      Object.entries(createFormData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      if (shopPhoto) {
        submitData.append('shopPhoto', shopPhoto);
      }

      await api.post('/sales/register-shop', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Shop registered successfully! Pending admin approval.');
      setCreateDialogOpen(false);
      setCreateFormData({
        shopName: '',
        address: '',
        city: '',
        postcode: '',
        shopPhone: '',
        shopType: 'retail',
        ownerEmail: '',
        ownerPassword: '',
        ownerFirstName: '',
        ownerLastName: '',
        ownerPhone: ''
      });
      setShopPhoto(null);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to register shop');
    } finally {
      setProcessing(false);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingShops = pendingShops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trial':
        return 'bg-blue-500';
      case 'suspended':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shops Management</h1>
          <p className="text-muted-foreground">Manage shops and approval requests</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Store className="mr-2 h-4 w-4" />
          Create Shop
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shop Directory</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search shops, owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading shops...</div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All Shops ({filteredShops.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                  Pending Approval ({filteredPendingShops.length})
                  {filteredPendingShops.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({filteredShops.filter(s => s.approval_status === 'rejected').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <Table>
                  <TableCaption>All approved and active shops</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Designer</TableHead>
                      <TableHead>Screens</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShops.filter(s => s.approval_status === 'approved').map((shop) => (
                      <TableRow key={shop.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {shop.photo_url ? (
                              <img
                                src={shop.photo_url}
                                alt={shop.name}
                                className="h-12 w-12 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{shop.name}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {shop.id}
                                {shop.shop_type && (
                                  <span className="ml-2">
                                    • {shop.shop_type.charAt(0).toUpperCase() + shop.shop_type.slice(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{shop.owner_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {shop.owner_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-xs flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {shop.phone}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {shop.address}
                              {shop.postcode && ` ${shop.postcode}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {shop.designer_name ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="text-sm">{shop.designer_name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Monitor className="h-4 w-4" />
                            <span>{shop.screen_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(shop.subscription_status)}>
                            {shop.subscription_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(shop.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/shops/${shop.id}`)}
                            >
                              <Monitor className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(shop)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteShop(shop)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                {filteredPendingShops.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending shop approvals at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPendingShops.map((shop) => (
                      <Card key={shop.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                              {shop.photo_url ? (
                                <img
                                  src={shop.photo_url}
                                  alt={shop.name}
                                  className="h-16 w-16 rounded-lg object-cover border"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                                  <Store className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {shop.name}
                                </CardTitle>
                                <Badge variant="secondary" className="mt-2">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Pending Approval
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Registered {new Date(shop.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="font-semibold mb-3">Shop Details</h4>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{shop.address || 'No address provided'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{shop.phone || 'No phone provided'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>Type: {shop.shop_type || 'Retail'}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3">Owner Information</h4>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{shop.owner_name}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{shop.owner_email}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>Registered by: {shop.registered_by_name || 'Admin'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openApprovalDialog(shop)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Approve & Assign Designer
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => openRejectDialog(shop)}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="mt-4">
                <Table>
                  <TableCaption>Rejected shop applications</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Rejection Reason</TableHead>
                      <TableHead>Rejected Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShops.filter(s => s.approval_status === 'rejected').map((shop) => (
                      <TableRow key={shop.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {shop.photo_url ? (
                              <img
                                src={shop.photo_url}
                                alt={shop.name}
                                className="h-10 w-10 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <span>{shop.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{shop.owner_name}</div>
                            <div className="text-xs text-muted-foreground">{shop.owner_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-red-600">{shop.rejection_reason || 'No reason provided'}</span>
                        </TableCell>
                        <TableCell>
                          {shop.approved_at && new Date(shop.approved_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteShop(shop)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Shop</DialogTitle>
            <DialogDescription>
              Assign a designer to manage this shop
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Designer</Label>
              <Select value={selectedDesigner} onValueChange={setSelectedDesigner}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a designer" />
                </SelectTrigger>
                <SelectContent>
                  {designers.map((designer) => (
                    <SelectItem key={designer.id} value={designer.id.toString()}>
                      <div className="flex justify-between items-center w-full">
                        <span>{designer.full_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({designer.assigned_shops} shops)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? 'Processing...' : 'Approve Shop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Shop</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Reject Shop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Shop</DialogTitle>
            <DialogDescription>
              Update shop information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-shop-name">Shop Name</Label>
              <Input
                id="edit-shop-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-shop-type">Shop Type</Label>
              <Select
                value={formData.shop_type}
                onValueChange={(value) => setFormData({ ...formData, shop_type: value })}
              >
                <SelectTrigger id="edit-shop-type">
                  <SelectValue placeholder="Select shop type" />
                </SelectTrigger>
                <SelectContent>
                  {SHOP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="salon">Salon</SelectItem>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2 relative" ref={editAddressDropdownRef}>
              <Label htmlFor="edit-postcode">Postcode</Label>
              <div className="relative">
                <Input
                  id="edit-postcode"
                  value={formData.postcode}
                  onChange={handleEditPostcodeChange}
                  placeholder="Enter postcode (e.g. SW1A 1AA)"
                  className="pr-10"
                />
                {editPostcodeLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Address suggestions dropdown */}
              {showEditAddressSuggestions && editAddressSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 text-xs text-gray-500 border-b">
                    Select an address or continue typing manually:
                  </div>
                  {editAddressSuggestions.map((address, index) => (
                    <button
                      key={address.id || index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => selectAddress(address)}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {address.line1}
                      </div>
                      {address.line2 && (
                        <div className="text-sm text-gray-600">{address.line2}</div>
                      )}
                      <div className="text-sm text-gray-500">
                        {address.city}, {address.postcode}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-designer">Assigned Designer</Label>
              <Select value={selectedDesigner || "none"} onValueChange={setSelectedDesigner}>
                <SelectTrigger id="edit-designer">
                  <SelectValue placeholder="Choose a designer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No designer assigned</SelectItem>
                  {designers.map((designer) => (
                    <SelectItem key={designer.id} value={designer.id.toString()}>
                      <div className="flex justify-between items-center w-full">
                        <span>{designer.full_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({designer.assigned_shops} shops)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateShop}>Update Shop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{shopToDelete?.name}"? This action cannot be undone.
              All related data including screens, content, and billing records will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShopToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteShop} className="bg-red-600 hover:bg-red-700">
              Delete Shop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Shop Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Shop</DialogTitle>
            <DialogDescription>
              Register a new shop and create owner account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateShop}>
            <div className="space-y-4 py-4">
              {/* Shop Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Shop Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="create-shopName">Shop Name *</Label>
                    <Input
                      id="create-shopName"
                      value={createFormData.shopName}
                      onChange={(e) => setCreateFormData({ ...createFormData, shopName: e.target.value })}
                      required
                      placeholder="Enter shop name"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="create-shopType">Shop Type</Label>
                    <Select
                      value={createFormData.shopType}
                      onValueChange={(value) => setCreateFormData({ ...createFormData, shopType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHOP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="create-address">Address</Label>
                    <Input
                      id="create-address"
                      value={createFormData.address}
                      onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-city">City</Label>
                    <Input
                      id="create-city"
                      value={createFormData.city}
                      onChange={(e) => setCreateFormData({ ...createFormData, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-postcode">Postcode</Label>
                    <Input
                      id="create-postcode"
                      value={createFormData.postcode}
                      onChange={(e) => setCreateFormData({ ...createFormData, postcode: e.target.value })}
                      placeholder="Postcode"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="create-shopPhone">Shop Phone</Label>
                    <Input
                      id="create-shopPhone"
                      value={createFormData.shopPhone}
                      onChange={(e) => setCreateFormData({ ...createFormData, shopPhone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Shop Owner Account</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="create-ownerFirstName">First Name *</Label>
                    <Input
                      id="create-ownerFirstName"
                      value={createFormData.ownerFirstName}
                      onChange={(e) => setCreateFormData({ ...createFormData, ownerFirstName: e.target.value })}
                      required
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-ownerLastName">Last Name *</Label>
                    <Input
                      id="create-ownerLastName"
                      value={createFormData.ownerLastName}
                      onChange={(e) => setCreateFormData({ ...createFormData, ownerLastName: e.target.value })}
                      required
                      placeholder="Last name"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="create-ownerEmail">Email Address *</Label>
                    <Input
                      id="create-ownerEmail"
                      type="email"
                      value={createFormData.ownerEmail}
                      onChange={(e) => setCreateFormData({ ...createFormData, ownerEmail: e.target.value })}
                      required
                      placeholder="owner@example.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="create-ownerPassword">Password *</Label>
                    <Input
                      id="create-ownerPassword"
                      type="password"
                      value={createFormData.ownerPassword}
                      onChange={(e) => setCreateFormData({ ...createFormData, ownerPassword: e.target.value })}
                      required
                      placeholder="Minimum 8 characters"
                      minLength={8}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="create-ownerPhone">Owner Phone</Label>
                    <Input
                      id="create-ownerPhone"
                      value={createFormData.ownerPhone}
                      onChange={(e) => setCreateFormData({ ...createFormData, ownerPhone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Shop Photo */}
              <div>
                <Label htmlFor="create-shopPhoto">Shop Photo (Optional)</Label>
                <div className="mt-2">
                  <label
                    htmlFor="create-shopPhoto"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    {shopPhoto ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mb-1" />
                        <p className="text-xs text-green-700 font-medium">{shopPhoto.name}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Building2 className="h-6 w-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Click to upload photo</p>
                      </div>
                    )}
                    <Input
                      id="create-shopPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setShopPhoto(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {shopPhoto && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShopPhoto(null)}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                {processing ? 'Creating...' : 'Create Shop'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}