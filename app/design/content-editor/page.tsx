'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Upload,
  Image,
  Video,
  Type,
  Palette,
  Layout,
  Save,
  Eye,
  Download,
  Undo,
  Redo,
  Copy,
  Trash2,
  Plus,
  Move,
  Maximize2,
  Settings,
  Clock
} from 'lucide-react'

interface ContentLayer {
  id: string
  type: 'image' | 'video' | 'text'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  opacity: number
  zIndex: number
  animation?: string
  duration?: number
  textStyle?: {
    fontSize: number
    fontFamily: string
    fontWeight: string
    color: string
    textAlign: string
    backgroundColor?: string
    padding?: number
  }
}

export default function ContentEditor() {
  const [selectedShop, setSelectedShop] = useState('')
  const [shops, setShops] = useState([])
  const [contents, setContents] = useState([])
  const [selectedContent, setSelectedContent] = useState(null)
  const [layers, setLayers] = useState<ContentLayer[]>([])
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 })
  const [zoom, setZoom] = useState(100)
  const [history, setHistory] = useState<ContentLayer[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAssignedShops()
  }, [])

  const fetchAssignedShops = async () => {
    try {
      const response = await fetch('/api/design/assigned-shops', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setShops(data)
    } catch (error) {
      toast.error('Failed to fetch assigned shops')
    }
  }

  const fetchShopContents = async (shopId: string) => {
    try {
      const response = await fetch(`/api/content/shop/${shopId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setContents(data.filter(c => c.status === 'pending_design'))
    } catch (error) {
      toast.error('Failed to fetch shop contents')
    }
  }

  const addLayer = (type: ContentLayer['type']) => {
    const newLayer: ContentLayer = {
      id: `layer-${Date.now()}`,
      type,
      content: type === 'text' ? 'New Text' : '',
      position: { x: 100, y: 100 },
      size: { width: 200, height: type === 'text' ? 50 : 150 },
      rotation: 0,
      opacity: 100,
      zIndex: layers.length,
      textStyle: type === 'text' ? {
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'center',
        padding: 10
      } : undefined
    }

    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    setSelectedLayer(newLayer.id)
    addToHistory(newLayers)
  }

  const updateLayer = (layerId: string, updates: Partial<ContentLayer>) => {
    const newLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    )
    setLayers(newLayers)
    addToHistory(newLayers)
  }

  const deleteLayer = (layerId: string) => {
    const newLayers = layers.filter(layer => layer.id !== layerId)
    setLayers(newLayers)
    setSelectedLayer(null)
    addToHistory(newLayers)
  }

  const duplicateLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      const newLayer = {
        ...layer,
        id: `layer-${Date.now()}`,
        position: {
          x: layer.position.x + 20,
          y: layer.position.y + 20
        }
      }
      const newLayers = [...layers, newLayer]
      setLayers(newLayers)
      setSelectedLayer(newLayer.id)
      addToHistory(newLayers)
    }
  }

  const addToHistory = (newLayers: ContentLayer[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newLayers)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setLayers(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setLayers(history[historyIndex + 1])
    }
  }

  const saveDesign = async () => {
    if (!selectedContent) {
      toast.error('Please select content to design')
      return
    }

    try {
      const response = await fetch(`/api/content/${selectedContent.id}/design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          design: {
            layers,
            canvasSize,
            version: '1.0'
          }
        })
      })

      if (response.ok) {
        toast.success('Design saved successfully')
      } else {
        toast.error('Failed to save design')
      }
    } catch (error) {
      toast.error('Failed to save design')
    }
  }

  const exportDesign = () => {
    const designData = {
      layers,
      canvasSize,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(designData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `design-${selectedContent?.id || 'draft'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentLayer = layers.find(l => l.id === selectedLayer)

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Content Designer</h1>

          <Select value={selectedShop} onValueChange={(value) => {
            setSelectedShop(value)
            fetchShopContents(value)
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select shop" />
            </SelectTrigger>
            <SelectContent>
              {shops.map(shop => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedContent?.id} onValueChange={(value) => {
            const content = contents.find(c => c.id === value)
            setSelectedContent(content)
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select content" />
            </SelectTrigger>
            <SelectContent>
              {contents.map(content => (
                <SelectItem key={content.id} value={content.id}>
                  {content.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>

          <div className="ml-4 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportDesign}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" onClick={saveDesign}>
              <Save className="h-4 w-4 mr-1" />
              Save Design
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Tools */}
        <div className="w-64 border-r bg-muted/50 p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-3">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => addLayer('text')}
              >
                <Type className="h-5 w-5" />
                <span className="text-xs">Text</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => addLayer('image')}
              >
                <Image className="h-5 w-5" />
                <span className="text-xs">Image</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => addLayer('video')}
              >
                <Video className="h-5 w-5" />
                <span className="text-xs">Video</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Layout className="h-5 w-5" />
                <span className="text-xs">Template</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Layers</h3>
            <div className="space-y-1">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-background ${
                    selectedLayer === layer.id ? 'bg-background border' : ''
                  }`}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  {layer.type === 'text' && <Type className="h-4 w-4" />}
                  {layer.type === 'image' && <Image className="h-4 w-4" />}
                  {layer.type === 'video' && <Video className="h-4 w-4" />}
                  <span className="text-sm flex-1">
                    {layer.type} {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateLayer(layer.id)
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLayer(layer.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Canvas</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Zoom</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => setZoom(value)}
                    min={25}
                    max={200}
                    step={25}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{zoom}%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Size</Label>
                <Select defaultValue="1920x1080">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1920x1080">1920×1080 (Full HD)</SelectItem>
                    <SelectItem value="1280x720">1280×720 (HD)</SelectItem>
                    <SelectItem value="3840x2160">3840×2160 (4K)</SelectItem>
                    <SelectItem value="1080x1920">1080×1920 (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-muted/20 overflow-auto p-8">
          <div
            ref={canvasRef}
            className="relative bg-white shadow-lg mx-auto"
            style={{
              width: `${(canvasSize.width * zoom) / 100}px`,
              height: `${(canvasSize.height * zoom) / 100}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left'
            }}
          >
            {layers.map(layer => (
              <div
                key={layer.id}
                className={`absolute border-2 ${
                  selectedLayer === layer.id ? 'border-primary' : 'border-transparent'
                } hover:border-primary/50 cursor-move`}
                style={{
                  left: `${layer.position.x}px`,
                  top: `${layer.position.y}px`,
                  width: `${layer.size.width}px`,
                  height: `${layer.size.height}px`,
                  transform: `rotate(${layer.rotation}deg)`,
                  opacity: layer.opacity / 100,
                  zIndex: layer.zIndex
                }}
                onClick={() => setSelectedLayer(layer.id)}
              >
                {layer.type === 'text' && (
                  <div
                    style={{
                      ...layer.textStyle,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: layer.textStyle?.textAlign || 'center'
                    }}
                  >
                    {layer.content}
                  </div>
                )}
                {layer.type === 'image' && (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {layer.type === 'video' && (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Properties */}
        {currentLayer && (
          <div className="w-80 border-l bg-background p-4 space-y-4">
            <h3 className="font-medium">Properties</h3>

            <Tabs defaultValue="style">
              <TabsList className="w-full">
                <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
                <TabsTrigger value="position" className="flex-1">Position</TabsTrigger>
                <TabsTrigger value="animation" className="flex-1">Animation</TabsTrigger>
              </TabsList>

              <TabsContent value="style" className="space-y-4">
                {currentLayer.type === 'text' && (
                  <>
                    <div>
                      <Label>Text Content</Label>
                      <Textarea
                        value={currentLayer.content}
                        onChange={(e) => updateLayer(currentLayer.id, { content: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Font Size</Label>
                      <Slider
                        value={[currentLayer.textStyle?.fontSize || 24]}
                        onValueChange={([value]) => updateLayer(currentLayer.id, {
                          textStyle: { ...currentLayer.textStyle, fontSize: value }
                        })}
                        min={12}
                        max={120}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Font Family</Label>
                      <Select
                        value={currentLayer.textStyle?.fontFamily}
                        onValueChange={(value) => updateLayer(currentLayer.id, {
                          textStyle: { ...currentLayer.textStyle, fontFamily: value }
                        })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Verdana">Verdana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={currentLayer.textStyle?.color}
                        onChange={(e) => updateLayer(currentLayer.id, {
                          textStyle: { ...currentLayer.textStyle, color: e.target.value }
                        })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>Opacity</Label>
                  <Slider
                    value={[currentLayer.opacity]}
                    onValueChange={([value]) => updateLayer(currentLayer.id, { opacity: value })}
                    min={0}
                    max={100}
                    className="mt-1"
                  />
                </div>
              </TabsContent>

              <TabsContent value="position" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>X Position</Label>
                    <Input
                      type="number"
                      value={currentLayer.position.x}
                      onChange={(e) => updateLayer(currentLayer.id, {
                        position: { ...currentLayer.position, x: parseInt(e.target.value) }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Y Position</Label>
                    <Input
                      type="number"
                      value={currentLayer.position.y}
                      onChange={(e) => updateLayer(currentLayer.id, {
                        position: { ...currentLayer.position, y: parseInt(e.target.value) }
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Width</Label>
                    <Input
                      type="number"
                      value={currentLayer.size.width}
                      onChange={(e) => updateLayer(currentLayer.id, {
                        size: { ...currentLayer.size, width: parseInt(e.target.value) }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input
                      type="number"
                      value={currentLayer.size.height}
                      onChange={(e) => updateLayer(currentLayer.id, {
                        size: { ...currentLayer.size, height: parseInt(e.target.value) }
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Rotation</Label>
                  <Slider
                    value={[currentLayer.rotation]}
                    onValueChange={([value]) => updateLayer(currentLayer.id, { rotation: value })}
                    min={-180}
                    max={180}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Z-Index</Label>
                  <Input
                    type="number"
                    value={currentLayer.zIndex}
                    onChange={(e) => updateLayer(currentLayer.id, { zIndex: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </TabsContent>

              <TabsContent value="animation" className="space-y-4">
                <div>
                  <Label>Animation Type</Label>
                  <Select
                    value={currentLayer.animation || 'none'}
                    onValueChange={(value) => updateLayer(currentLayer.id, { animation: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fade-in">Fade In</SelectItem>
                      <SelectItem value="slide-left">Slide from Left</SelectItem>
                      <SelectItem value="slide-right">Slide from Right</SelectItem>
                      <SelectItem value="zoom-in">Zoom In</SelectItem>
                      <SelectItem value="rotate">Rotate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={currentLayer.duration || 1}
                    onChange={(e) => updateLayer(currentLayer.id, { duration: parseFloat(e.target.value) })}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="mt-1"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}