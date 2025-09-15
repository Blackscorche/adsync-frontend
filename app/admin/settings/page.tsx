'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Monitor,
  Plus,
  Edit,
  Trash2,
  FileText,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { CURRENCY, formatCurrency } from '@/lib/constants';

interface ScreenSize {
  size_inches: number;
  monthly_fee: number;
}

export default function AdminSettingsPage() {
  const [screenSizes, setScreenSizes] = useState<ScreenSize[]>([]);
  const [commissionRate, setCommissionRate] = useState('10');
  const [contentPrice, setContentPrice] = useState('5');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [showAddScreen, setShowAddScreen] = useState(false);
  const [showEditScreen, setShowEditScreen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<ScreenSize | null>(null);

  // Form states
  const [newScreenSize, setNewScreenSize] = useState('');
  const [newScreenPrice, setNewScreenPrice] = useState('');
  const [editScreenPrice, setEditScreenPrice] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch screen sizes
      const screenResponse = await api.get('/admin/screen-sizes');
      // Ensure monthly_fee is a number for each screen
      const screens = screenResponse.data.map((screen: any) => ({
        size_inches: parseInt(screen.size_inches),
        monthly_fee: parseFloat(screen.monthly_fee)
      }));
      setScreenSizes(screens);

      // Fetch settings
      const settingsResponse = await api.get('/admin/settings');
      const commissionSetting = settingsResponse.data.find(
        (s: any) => s.setting_key === 'commission_percentage'
      );
      const contentPriceSetting = settingsResponse.data.find(
        (s: any) => s.setting_key === 'content_price'
      );

      if (commissionSetting) {
        setCommissionRate(commissionSetting.setting_value);
      }
      if (contentPriceSetting) {
        setContentPrice(contentPriceSetting.setting_value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Set default values
      setScreenSizes([
        { size_inches: 32, monthly_fee: 15.00 },
        { size_inches: 43, monthly_fee: 20.00 },
        { size_inches: 55, monthly_fee: 25.00 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addScreenSize = async () => {
    if (!newScreenSize || !newScreenPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      await api.post('/admin/screen-sizes', {
        size_inches: parseInt(newScreenSize),
        monthly_fee: parseFloat(newScreenPrice)
      });
      toast.success('Screen size added successfully');
      setShowAddScreen(false);
      setNewScreenSize('');
      setNewScreenPrice('');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to add screen size');
    } finally {
      setSaving(false);
    }
  };

  const updateScreenPrice = async () => {
    if (!editingScreen || !editScreenPrice) return;

    setSaving(true);
    try {
      await api.post('/admin/screen-sizes', {
        size_inches: editingScreen.size_inches,
        monthly_fee: parseFloat(editScreenPrice)
      });
      toast.success('Screen price updated successfully');
      setShowEditScreen(false);
      setEditingScreen(null);
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update screen price');
    } finally {
      setSaving(false);
    }
  };

  const deleteScreenSize = async (size: number) => {
    if (!confirm(`Are you sure you want to delete the ${size}" screen size?`)) return;

    setSaving(true);
    try {
      await api.delete(`/admin/screen-sizes/${size}`);
      toast.success('Screen size deleted successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to delete screen size');
    } finally {
      setSaving(false);
    }
  };

  const updateCommissionRate = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings/commission_percentage', {
        value: commissionRate
      });
      toast.success('Commission rate updated successfully');
    } catch (error) {
      toast.error('Failed to update commission rate');
    } finally {
      setSaving(false);
    }
  };

  const updateContentPrice = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings/content_price', {
        value: contentPrice
      });
      toast.success('Content price updated successfully');
    } catch (error) {
      toast.error('Failed to update content price');
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (screen: ScreenSize) => {
    setEditingScreen(screen);
    setEditScreenPrice(screen.monthly_fee.toString());
    setShowEditScreen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure pricing and commission rates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Screen Pricing - Left Column */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Screen Size Pricing</CardTitle>
                <CardDescription className="text-sm">Monthly fees for different screen sizes</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddScreen(true)}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9">Size</TableHead>
                  <TableHead className="h-9">Monthly Fee</TableHead>
                  <TableHead className="h-9 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screenSizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      No screen sizes configured
                    </TableCell>
                  </TableRow>
                ) : (
                  screenSizes.map((screen) => (
                    <TableRow key={screen.size_inches}>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <Monitor className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{screen.size_inches}"</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(screen.monthly_fee)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => openEditDialog(screen)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => deleteScreenSize(screen.size_inches)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column - Pricing Settings */}
        <div className="space-y-4">
          {/* Content Pricing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Content Pricing</CardTitle>
              <CardDescription className="text-sm">Price for content uploads</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Price per Content</Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{CURRENCY.symbol}</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={contentPrice}
                    onChange={(e) => setContentPrice(e.target.value)}
                    className="w-24 h-8"
                  />
                  <Button
                    size="sm"
                    onClick={updateContentPrice}
                    disabled={saving}
                    className="h-8"
                  >
                    Save
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Charged to shop owners for each content upload
              </p>
            </CardContent>
          </Card>

          {/* Commission Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sales Commission</CardTitle>
              <CardDescription className="text-sm">Commission rate for sales team</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Commission Rate</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-20 h-8"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  <Button
                    size="sm"
                    onClick={updateCommissionRate}
                    disabled={saving}
                    className="h-8"
                  >
                    Save
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Applied to shop registrations and content sales
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Screen Dialog */}
      <Dialog open={showAddScreen} onOpenChange={setShowAddScreen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Screen Size</DialogTitle>
            <DialogDescription>Configure pricing for a new screen size</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Screen Size (inches)</Label>
              <Input
                type="number"
                placeholder="e.g., 75"
                value={newScreenSize}
                onChange={(e) => setNewScreenSize(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Monthly Fee ({CURRENCY.symbol})</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 35.00"
                value={newScreenPrice}
                onChange={(e) => setNewScreenPrice(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddScreen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={addScreenSize} disabled={saving}>
              {saving ? 'Adding...' : 'Add Screen Size'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Screen Dialog */}
      <Dialog open={showEditScreen} onOpenChange={setShowEditScreen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Screen Price</DialogTitle>
            <DialogDescription>
              Update the monthly fee for {editingScreen?.size_inches}" screens
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-sm">Monthly Fee ({CURRENCY.symbol})</Label>
            <Input
              type="number"
              step="0.01"
              value={editScreenPrice}
              onChange={(e) => setEditScreenPrice(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowEditScreen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={updateScreenPrice} disabled={saving}>
              {saving ? 'Updating...' : 'Update Price'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}