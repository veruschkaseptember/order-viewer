/**
 * Order Details Drawer Component
 * Displays order details and line items in a right-side sheet
 */

'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { useOrderDetailsByOrderId } from '@/hooks/use-orders';

interface OrderDetailsPanelProps {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailsPanel({
  orderId,
  onClose,
}: OrderDetailsPanelProps) {
  const {
    data: orderDetails,
    isLoading,
    error,
  } = useOrderDetailsByOrderId(orderId || '', !!orderId);

  if (!orderId) return null;

  return (
    <Sheet open={!!orderId} onOpenChange={() => onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            View complete order information and line items
          </SheetDescription>
        </SheetHeader>{' '}
        <div className="mt-6 space-y-6 px-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">
                Loading order details...
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-destructive">
                Failed to load order details
              </div>
            </div>
          )}

          {orderDetails && (
            <>
              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Order ID</div>
                    <div className="font-mono">
                      {orderDetails.order.orderId}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Customer</div>
                    <div>{orderDetails.order.customerName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <Badge
                      variant={
                        orderDetails.order.status === 'Shipped'
                          ? 'default'
                          : orderDetails.order.status === 'Processing'
                          ? 'secondary'
                          : orderDetails.order.status === 'Pending'
                          ? 'outline'
                          : 'destructive'
                      }>
                      {orderDetails.order.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Payment</div>
                    <Badge
                      variant={
                        orderDetails.order.paid ? 'default' : 'destructive'
                      }>
                      {orderDetails.order.paid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-semibold">
                      {formatCurrency(parseFloat(orderDetails.order.total))}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Created</div>
                    <div>
                      {new Date(
                        orderDetails.order.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div className="space-y-3">
                <h3 className="font-semibold">Line Items</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border rounded-lg px-3">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>{' '}
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity} &times;{' '}
                          {formatCurrency(parseFloat(item.price))}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(item.quantity * parseFloat(item.price))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <Separator />
                <div className="flex items-center justify-between py-2 font-semibold">
                  <div>Total</div>
                  <div>
                    {formatCurrency(parseFloat(orderDetails.order.total))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
