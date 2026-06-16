import { getEventAdminData } from '@/lib/actions/event.action';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function AdminEventsPage() {
  const data = await getEventAdminData('frat-night');

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Event Tickets</h1>
        <p className="text-muted-foreground">No event found.</p>
      </div>
    );
  }

  const { event, stats, orders } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(event.date).toLocaleDateString('en-NG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalTicketsSold}</p>
          </CardContent>
        </Card>
        {stats.tierBreakdown.map((tier) => (
          <Card key={tier.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tier.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {tier.sold}
                {tier.max !== null && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}/ {tier.max}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(tier.revenue)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Paid Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-semibold">
                      {order.ticketCode}
                    </TableCell>
                    <TableCell>{order.buyerName}</TableCell>
                    <TableCell>{order.buyerEmail}</TableCell>
                    <TableCell>{order.buyerPhone}</TableCell>
                    <TableCell>
                      {'tier' in order && order.tier
                        ? (order.tier as { name: string }).name
                        : '—'}
                    </TableCell>
                    <TableCell>{formatCurrency(Number(order.amount))}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
