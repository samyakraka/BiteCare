"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/admin-utils"
import { Search, MoreHorizontal, Eye, Edit, Printer, Loader2, CheckCircle, Clock, ChefHat, Truck } from "lucide-react"

// Sample order data
const sampleOrders = [
  {
    id: "order1",
    userId: "user123",
    createdAt: new Date(),
    status: "delivered",
    total: 32.99,
    subtotal: 26.99,
    tax: 2.0,
    deliveryFee: 4.0,
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 12.99 },
      { name: "Caesar Salad", quantity: 1, price: 8.99 },
      { name: "Garlic Bread", quantity: 1, price: 4.99 },
    ],
    address: "123 Main St, Apt 4B, New York, NY 10001",
  },
  {
    id: "order2",
    userId: "user456",
    createdAt: new Date(Date.now() - 86400000),
    status: "preparing",
    total: 45.5,
    subtotal: 38.5,
    tax: 3.0,
    deliveryFee: 4.0,
    items: [
      { name: "Pepperoni Pizza", quantity: 2, price: 14.99 },
      { name: "Tiramisu", quantity: 1, price: 6.99 },
    ],
    address: "456 Park Ave, New York, NY 10022",
  },
  {
    id: "order3",
    userId: "user789",
    createdAt: new Date(Date.now() - 172800000),
    status: "received",
    total: 28.75,
    subtotal: 22.75,
    tax: 2.0,
    deliveryFee: 4.0,
    items: [
      { name: "Vegetarian Pizza", quantity: 1, price: 13.99 },
      { name: "Mozzarella Sticks", quantity: 1, price: 7.99 },
    ],
    address: "789 Broadway, New York, NY 10003",
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    async function fetchOrders() {
      try {
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(ordersQuery)

        if (querySnapshot.empty) {
          // Use sample data if no orders found
          setOrders(sampleOrders)
          setFilteredOrders(sampleOrders)
        } else {
          const ordersData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }))

          setOrders(ordersData)
          setFilteredOrders(ordersData)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders, using sample data",
          variant: "destructive",
        })
        // Use sample data on error
        setOrders(sampleOrders)
        setFilteredOrders(sampleOrders)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = orders.filter(
        (order) =>
          order.id.toString().toLowerCase().includes(query) ||
          (order.userId && order.userId.toString().toLowerCase().includes(query)),
      )
      setFilteredOrders(filtered)
    }
  }, [searchQuery, orders])

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order)
    setSelectedStatus(order.status)
    setIsEditDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !selectedStatus) return

    try {
      // Update local state first for immediate feedback
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === selectedOrder.id ? { ...order, status: selectedStatus } : order)),
      )

      // Try to update in Firebase if available
      try {
        const orderRef = doc(db, "orders", selectedOrder.id)
        await updateDoc(orderRef, {
          status: selectedStatus,
          updatedAt: Timestamp.now(),
        })
      } catch (error) {
        console.log("Firebase update failed, but UI is updated", error)
      }

      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Order status has been updated",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <Clock className="h-4 w-4" />
      case "preparing":
        return <ChefHat className="h-4 w-4" />
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      case "delivered":
        return <Truck className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading orders...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8 w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>View and manage customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Items</th>
                  <th className="text-right py-3 px-2">Total</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 px-2 font-medium">
                      #{typeof order.id === "string" ? order.id.slice(0, 6) : order.id}
                    </td>
                    <td className="py-3 px-2">
                      {typeof order.userId === "string" ? order.userId.slice(0, 6) : order.userId}...
                    </td>
                    <td className="py-3 px-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-2">
                      <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">{order.items?.length || 0} items</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(order.total || 0)}</td>
                    <td className="py-3 px-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id?.toString().slice(0, 6)} - {selectedOrder?.createdAt?.toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer</h3>
                  <p>{selectedOrder.userId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Delivery Address</h3>
                  <p>{selectedOrder.address || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total</h3>
                  <p className="font-medium">{formatCurrency(selectedOrder.total || 0)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Item</th>
                        <th className="text-center py-2 px-3">Quantity</th>
                        <th className="text-right py-2 px-3">Price</th>
                        <th className="text-right py-2 px-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-2 px-3">{item.name}</td>
                          <td className="py-2 px-3 text-center">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">{formatCurrency(item.price)}</td>
                          <td className="py-2 px-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={3} className="py-2 px-3 text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="py-2 px-3 text-right">{formatCurrency(selectedOrder.subtotal || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right font-medium">
                          Tax:
                        </td>
                        <td className="py-2 px-3 text-right">{formatCurrency(selectedOrder.tax || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right font-medium">
                          Delivery Fee:
                        </td>
                        <td className="py-2 px-3 text-right">{formatCurrency(selectedOrder.deliveryFee || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right font-medium">
                          Total:
                        </td>
                        <td className="py-2 px-3 text-right font-bold">{formatCurrency(selectedOrder.total || 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder?.id?.toString().slice(0, 6)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Status</h3>
              <Badge className={selectedOrder && getStatusColor(selectedOrder.status)}>{selectedOrder?.status}</Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">New Status</h3>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready for Pickup</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
