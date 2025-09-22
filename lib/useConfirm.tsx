'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface UseConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<UseConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (customOptions?: UseConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(customOptions || {});
      setResolver(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    resolver?.(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolver?.(false);
    setIsOpen(false);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={options.title || 'Confirm Action'}
      description={options.description || 'Are you sure you want to proceed?'}
      confirmText={options.confirmText || 'Confirm'}
      cancelText={options.cancelText || 'Cancel'}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      variant={options.variant || 'default'}
    />
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}