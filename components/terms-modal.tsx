'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface TermsModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsModal({ open, onAccept, onDecline }: TermsModalProps) {
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      onAccept();
      setAgreed(false); // Reset for next use
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read and accept our terms and conditions to continue
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-base">1. Service Agreement</h3>
            <p>
              By registering your shop with Ivaa Media Digital Signage Platform, you agree to use our services
              in accordance with these terms and conditions. Our platform provides cloud-based digital signage
              management solutions for displaying content on your screens.
            </p>

            <h3 className="font-semibold text-base">2. Subscription and Billing</h3>
            <p>
              • Monthly subscription fees are due on the same date each month<br/>
              • Payment is required within 7 days of invoice date<br/>
              • Late payments may result in service suspension<br/>
              • First month includes 1 free content upload, additional uploads are charged<br/>
              • Subscription can be cancelled with 30 days notice
            </p>

            <h3 className="font-semibold text-base">3. Content Guidelines</h3>
            <p>
              All uploaded content must comply with local laws and regulations. You are responsible for ensuring:
            </p>
            <ul className="list-disc pl-6">
              <li>Content does not infringe on any copyrights or trademarks</li>
              <li>Content is appropriate for public display</li>
              <li>Content does not contain malicious code or harmful material</li>
              <li>Content meets our technical specifications (max 100MB per file)</li>
            </ul>

            <h3 className="font-semibold text-base">4. Service Level Agreement</h3>
            <p>
              We strive to maintain 99.9% uptime for our services. However, we are not liable for:
            </p>
            <ul className="list-disc pl-6">
              <li>Internet connectivity issues at your location</li>
              <li>Hardware failures of your display devices</li>
              <li>Force majeure events beyond our control</li>
              <li>Scheduled maintenance (with 48 hours notice)</li>
            </ul>

            <h3 className="font-semibold text-base">5. Data Protection</h3>
            <p>
              We are committed to protecting your data in accordance with GDPR and other applicable data protection laws.
              Your business information and content are stored securely and will not be shared with third parties without
              your consent, except as required by law.
            </p>

            <h3 className="font-semibold text-base">6. Limitation of Liability</h3>
            <p>
              Our liability is limited to the monthly subscription fee paid. We are not responsible for any indirect,
              incidental, or consequential damages arising from the use of our services.
            </p>

            <h3 className="font-semibold text-base">7. Contract Duration</h3>
            <p>
              • Initial contract period: 12 months<br/>
              • Automatic renewal: Monthly basis after initial period<br/>
              • Early termination fee: 2 months subscription fee<br/>
              • Contract start date: {new Date().toLocaleDateString()}<br/>
              • Contract end date: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>

            <h3 className="font-semibold text-base">8. Modifications</h3>
            <p>
              We reserve the right to modify these terms with 30 days notice. Continued use of the service after
              modifications constitutes acceptance of the new terms.
            </p>

            <h3 className="font-semibold text-base">9. Governing Law</h3>
            <p>
              These terms are governed by the laws of the United Kingdom. Any disputes shall be resolved through
              arbitration in London, UK.
            </p>

            <h3 className="font-semibold text-base">10. Contact Information</h3>
            <p>
              For questions about these terms, please contact:<br/>
              Ivaa Media Ltd.<br/>
              Email: legal@ivaamedia.com<br/>
              Phone: +44 20 1234 5678
            </p>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox 
            id="terms" 
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read and agree to the terms and conditions
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={!agreed}>
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}