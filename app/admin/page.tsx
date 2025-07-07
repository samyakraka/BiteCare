"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { formatCurrency } from "@/lib/admin-utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, ShoppingBag, DollarSign, TrendingUp, Loader2 } from "lucide-react"

// Import the MenuDataStatus component
import MenuDataStatus from "./dashboard/menu-status"

// Sample data for when Firebase data isn't available
const sampleData = {
  totalUsers: 42,
  totalOrders: 156,
  totalRevenue: 3245.75,
  averageOrderValue: 20.81,
  recentOrders: [
    {
      id: "order1",
      userId: "user123",
      createdAt: new Date(),
      status: "delivered",
      total: 32.99,
    },
    {
      id: "order2",
      userId: "user456",
      createdAt: new Date(Date.now() - 86400000),
      status: "preparing",
      total: 45.5,
    },
    {
      id: "order3",
      userId: "user789",
      createdAt: new Date(Date.now() - 172800000),
      status: "received",
      total: 28.75,
    },
  ],
  categoryData: [
    { name: "pizzas", value: 45 },
    { name: "pastas", value: 30 },
    { name: "salads", value: 15 },
    { name: "desserts", value: 20 },
    { name: "drinks", value: 25 },
  ],
  revenueData: [
    { name: "Mon", revenue: 450 },
    { name: "Tue", revenue: 380 },
    { name: "Wed", revenue: 520 },
    { name: "Thu", revenue: 410 },
    { name: "Fri", revenue: 680 },
    { name: "Sat", revenue: 720 },
    { name: "Sun", revenue: 550 },
  ],
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(sampleData)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Try to fetch data from Firebase
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, "users"))
        const totalUsers = usersSnapshot.size || sampleData.totalUsers

        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, "orders"))
        const orders = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }))

        // If no orders found, use sample data
        if (orders.length === 0) {
          setStats(sampleData)
          return
        }

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

        // Calculate average order value
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

        // Get recent orders
        const recentOrdersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5))
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery)
        const recentOrders = recentOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }))

        // Generate category data for pie chart
        const categoryMap = new Map()
        orders.forEach((order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              if (item.category) {
                const currentCount = categoryMap.get(item.category) || 0
                categoryMap.set(item.category, currentCount + item.quantity)
              }
            })
          }
        })

        const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value,
        }))

        // Generate revenue data for bar chart (last 7 days)
        const revenueData = []
        const today = new Date()
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)

          const dayOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt)
            return orderDate.toDateString() === date.toDateString()
          })

          const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)

          revenueData.push({
            name: date.toLocaleDateString("en-US", { weekday: "short" }),
            revenue: dayRevenue,
          })
        }

        setStats({
          totalUsers,
          totalOrders: orders.length,
          totalRevenue,
          averageOrderValue,
          recentOrders: recentOrders.length > 0 ? recentOrders : sampleData.recentOrders,
          categoryData: categoryData.length > 0 ? categoryData : sampleData.categoryData,
          revenueData: revenueData.length > 0 ? revenueData : sampleData.revenueData,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // Use sample data if there's an error
        setStats(sampleData)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Data Status */}
      <MenuDataStatus />

      {/* Charts */}
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue (Last 7 Days)</CardTitle>
              <CardDescription>Daily revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Category</CardTitle>
              <CardDescription>Distribution of orders across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`${value} items`, "Quantity"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest 5 orders placed on the platform</CardDescription>
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
                  <th className="text-right py-3 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 px-2 font-medium">
                      #{typeof order.id === "string" ? order.id.slice(0, 6) : order.id}
                    </td>
                    <td className="py-3 px-2">
                      {typeof order.userId === "string" ? order.userId.slice(0, 6) : order.userId}...
                    </td>
                    <td className="py-3 px-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "received"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "preparing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">{formatCurrency(order.total || 0)}</td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
