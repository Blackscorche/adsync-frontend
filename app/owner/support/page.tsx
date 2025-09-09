'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HeadphonesIcon,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Monitor,
  Wifi,
  Upload,
  CreditCard
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
  lastUpdate: string;
}

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'normal',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [recentTickets] = useState<Ticket[]>([
    {
      id: 'TKT-001',
      subject: 'Screen not displaying content',
      category: 'technical',
      status: 'resolved',
      createdAt: '2024-01-14',
      lastUpdate: '2024-01-15'
    },
    {
      id: 'TKT-002',
      subject: 'Billing inquiry',
      category: 'billing',
      status: 'open',
      createdAt: '2024-01-15',
      lastUpdate: '2024-01-15'
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      setFormData({
        subject: '',
        category: 'general',
        priority: 'normal',
        message: ''
      });
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err) {
      setError('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string): React.ReactElement => {
    switch (category) {
      case 'technical':
        return <Monitor className="h-4 w-4" />;
      case 'billing':
        return <CreditCard className="h-4 w-4" />;
      case 'content':
        return <Upload className="h-4 w-4" />;
      case 'connectivity':
        return <Wifi className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">Get help with your digital signage system</p>
      </div>

      {/* Quick Contact Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone Support</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">+855 23 123 456</div>
            <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-6PM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Support</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">support@ivaamedia.com</div>
            <p className="text-xs text-muted-foreground">24-48 hour response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">&lt; 2 hours</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Support Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Support Request</CardTitle>
            <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
          </CardHeader>
          <CardContent>
            {submitSuccess && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your support request has been submitted successfully. We'll respond within 2 hours.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="content">Content Upload</SelectItem>
                      <SelectItem value="connectivity">Connectivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Support Tickets</CardTitle>
              <CardDescription>Track your open and resolved issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        <span className="font-medium text-sm">{ticket.subject}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>#{ticket.id}</span>
                        <span>Created: {ticket.createdAt}</span>
                      </div>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                ))}
                {recentTickets.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No support tickets yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      How do I restart my screen device?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    To restart your screen device, simply unplug the power cable for 10 seconds, 
                    then plug it back in. The device will automatically boot up and connect to the 
                    dashboard within 2-3 minutes.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      What file formats are supported?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    We support the following formats:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Images: JPG, PNG, GIF (max 10MB)</li>
                      <li>Videos: MP4, AVI, MOV (max 100MB)</li>
                      <li>Documents: PDF (max 5MB)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      My screen shows as offline
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    If your screen appears offline:
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Check your internet connection</li>
                      <li>Ensure the device is powered on</li>
                      <li>Verify WiFi credentials are correct</li>
                      <li>Restart the device if needed</li>
                      <li>Contact support if issue persists</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      How do I upgrade my subscription?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    To upgrade your subscription, go to the Billing section in your dashboard. 
                    You can choose from different plans and add extra upload credits as needed. 
                    Changes take effect immediately and you'll be charged a prorated amount.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}