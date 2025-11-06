'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { adPreferencesAPI } from '@/lib/api';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';

interface AdPreferences {
  shopId: number;
  shopName: string;
  allowOutsideAds: boolean;
  blockedAdCategories: string[];
}

export default function AdPreferencesPage() {
  const [preferences, setPreferences] = useState<AdPreferences | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for editing
  const [allowOutsideAds, setAllowOutsideAds] = useState(true);
  const [blockedCategories, setBlockedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        toast.error('User not found. Please log in again.');
        return;
      }

      const user = JSON.parse(userStr);
      const shopId = user.shopId;

      if (!shopId) {
        toast.error('Shop ID not found.');
        return;
      }

      // Fetch preferences and categories in parallel
      const [prefsResponse, categoriesResponse] = await Promise.all([
        adPreferencesAPI.getPreferences(shopId),
        adPreferencesAPI.getCategories(),
      ]);

      setPreferences(prefsResponse);
      setAvailableCategories(categoriesResponse.categories);

      // Initialize local state
      setAllowOutsideAds(prefsResponse.allowOutsideAds);
      setBlockedCategories(prefsResponse.blockedAdCategories || []);
    } catch (error: any) {
      console.error('Error fetching ad preferences:', error);
      toast.error(error.response?.data?.error || 'Failed to load ad preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);

      await adPreferencesAPI.updatePreferences(preferences.shopId.toString(), {
        allowOutsideAds,
        blockedAdCategories: allowOutsideAds ? blockedCategories : [],
      });

      toast.success('Ad preferences updated successfully');

      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Error saving ad preferences:', error);
      toast.error(error.response?.data?.error || 'Failed to save ad preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setAllowOutsideAds(preferences.allowOutsideAds);
      setBlockedCategories(preferences.blockedAdCategories || []);
    }
  };

  const toggleCategory = (category: string) => {
    if (blockedCategories.includes(category)) {
      setBlockedCategories(blockedCategories.filter(c => c !== category));
    } else {
      setBlockedCategories([...blockedCategories, category]);
    }
  };

  const hasChanges = () => {
    if (!preferences) return false;
    return (
      allowOutsideAds !== preferences.allowOutsideAds ||
      JSON.stringify(blockedCategories.sort()) !== JSON.stringify((preferences.blockedAdCategories || []).sort())
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load ad preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ad Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Control third-party advertisements on your digital screens
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outside Ads Settings</CardTitle>
          <CardDescription>
            Choose whether to allow third-party advertisements on your screens and select which categories you want to block.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle for allowing outside ads */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium">Allow Outside Ads</div>
              <div className="text-sm text-muted-foreground">
                Enable third-party advertisements to display on your screens
              </div>
            </div>
            <Switch
              checked={allowOutsideAds}
              onCheckedChange={setAllowOutsideAds}
            />
          </div>

          {/* Category selection - only shown if ads are allowed */}
          {allowOutsideAds && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Block Ad Categories</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select categories you don't want to see on your screens. All other categories will be allowed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableCategories.map((category) => {
                  const isBlocked = blockedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`
                        flex items-center justify-between p-3 border rounded-lg transition-colors
                        ${isBlocked
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-green-500 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30'
                        }
                      `}
                    >
                      <span className="text-sm font-medium">{category}</span>
                      {isBlocked ? (
                        <X className="h-4 w-4 text-red-600" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {blockedCategories.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Blocked categories ({blockedCategories.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {blockedCategories.map((category) => (
                      <Badge key={category} variant="destructive">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info message when ads are disabled */}
          {!allowOutsideAds && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Outside ads are currently disabled</p>
                <p className="text-blue-700 dark:text-blue-300">
                  No third-party advertisements will be shown on your screens. Only your own content will be displayed.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges() || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges() || saving}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
