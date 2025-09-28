'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Store, Phone, Mail, Monitor, ExternalLink, Navigation } from 'lucide-react';

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

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
  screen_count: number;
  created_at: string;
  photo_url?: string;
  // Add coordinates if available from geocoding
  latitude?: number;
  longitude?: number;
}

interface ShopsMapProps {
  shops: Shop[];
  height?: string;
  showControls?: boolean;
  onShopClick?: (shop: Shop) => void;
}

// UK center coordinates (approximate center of UK)
const UK_CENTER: [number, number] = [54.5, -3.5];
const DEFAULT_ZOOM = 6;

// Mock coordinates for demo purposes - in production, you'd geocode the addresses
const getMockCoordinates = (shopId: number, address: string): [number, number] => {
  // Simple hash to generate consistent mock coordinates based on shop data
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const addressHash = hash(address + shopId.toString());

  // Generate coordinates within UK bounds
  // UK rough bounds: lat 50-60, lng -8-2
  const lat = 50 + (addressHash % 1000) / 100; // 50.00 to 59.99
  const lng = -8 + (Math.floor(addressHash / 1000) % 1000) / 100; // -8.00 to 1.99

  return [lat, lng];
};

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

const getApprovalStatusBadge = (status?: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500 text-white text-xs">Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-red-500 text-white text-xs">Rejected</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500 text-white text-xs">Pending</Badge>;
    default:
      return null;
  }
};

export default function ShopsMap({
  shops,
  height = '400px',
  showControls = true,
  onShopClick
}: ShopsMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(UK_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    setIsClient(true);

    // If we have shops, center the map on the first shop or calculate center
    if (shops.length > 0) {
      const firstShop = shops[0];
      const coords = getMockCoordinates(firstShop.id, firstShop.address);
      setMapCenter(coords);
      setMapZoom(shops.length === 1 ? 13 : 7);
    }
  }, [shops]);

  const handleShopClick = (shop: Shop) => {
    if (onShopClick) {
      onShopClick(shop);
    }
  };

  const centerOnShop = (shop: Shop) => {
    const coords = getMockCoordinates(shop.id, shop.address);
    setMapCenter(coords);
    setMapZoom(13);
  };

  if (!isClient) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading map...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      {showControls && (
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shop Locations ({shops.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMapCenter(UK_CENTER);
                setMapZoom(DEFAULT_ZOOM);
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Reset View
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div style={{ height, width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {shops.map((shop) => {
              const coordinates = getMockCoordinates(shop.id, shop.address);

              return (
                <Marker
                  key={shop.id}
                  position={coordinates}
                  eventHandlers={{
                    click: () => handleShopClick(shop),
                  }}
                >
                  <Popup maxWidth={300} className="shop-popup">
                    <div className="p-2 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        {shop.photo_url ? (
                          <img
                            src={shop.photo_url}
                            alt={shop.name}
                            className="h-12 w-12 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <Store className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{shop.name}</h3>
                          {shop.shop_type && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {shop.shop_type}
                            </p>
                          )}
                          <div className="flex gap-1 mt-1">
                            <Badge className={`${getStatusColor(shop.subscription_status)} text-white text-xs`}>
                              {shop.subscription_status}
                            </Badge>
                            {getApprovalStatusBadge(shop.approval_status)}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span>{shop.address} {shop.postcode}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{shop.phone}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{shop.owner_email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Monitor className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{shop.screen_count || 0} screens</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.open(`/admin/shops/${shop.id}`, '_blank');
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}