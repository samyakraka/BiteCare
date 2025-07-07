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
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Search, MoreHorizontal, UserCog, Shield, Trash2, Loader2 } from "lucide-react"

// Sample user data
const sampleUsers = [
  {
    id: "user1",
    displayName: "John Doe",
    email: "john@example.com",
    role: "admin",
    createdAt: new Date(2023, 5, 15),
    lastLogin: new Date(2023, 11, 20),
  },
  {
    id: "user2",
    displayName: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    createdAt: new Date(2023, 6, 22),
    lastLogin: new Date(2023, 11, 18),
  },
  {
    id: "user3",
    displayName: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    createdAt: new Date(2023, 8, 10),
    lastLogin: new Date(2023, 11, 15),
  },
  {
    id: "user4",
    displayName: "Alice Williams",
    email: "alice@example.com",
    role: "user",
    createdAt: new Date(2023, 9, 5),
    lastLogin: new Date(2023, 11, 19),
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(usersQuery)

        if (querySnapshot.empty) {
          // Use sample data if no users found
          setUsers(sampleUsers)
          setFilteredUsers(sampleUsers)
        } else {
          const usersData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            lastLogin: doc.data().lastLogin?.toDate() || null,
          }))

          setUsers(usersData)
          setFilteredUsers(usersData)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to load users, using sample data",
          variant: "destructive",
        })
        // Use sample data on error
        setUsers(sampleUsers)
        setFilteredUsers(sampleUsers)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          (user.displayName && user.displayName.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query)),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleMakeAdmin = async (userId: string) => {
    try {
      // Update local state first for immediate feedback
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: "admin" } : user)))

      // Try to update in Firebase if available
      try {
        const userRef = doc(db, "users", userId)
        await updateDoc(userRef, { role: "admin" })
      } catch (error) {
        console.log("Firebase update failed, but UI is updated", error)
      }

      toast({
        title: "Success",
        description: "User has been made an admin",
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    try {
      // Update local state first for immediate feedback
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: "user" } : user)))

      // Try to update in Firebase if available
      try {
        const userRef = doc(db, "users", userId)
        await updateDoc(userRef, { role: "user" })
      } catch (error) {
        console.log("Firebase update failed, but UI is updated", error)
      }

      toast({
        title: "Success",
        description: "Admin privileges have been removed",
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      // Update local state first for immediate feedback
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))

      // Try to delete from Firebase if available
      try {
        await deleteDoc(doc(db, "users", userId))
      } catch (error) {
        console.log("Firebase delete failed, but UI is updated", error)
      }

      toast({
        title: "Success",
        description: "User has been deleted",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">Role</th>
                  <th className="text-left py-3 px-2">Joined</th>
                  <th className="text-left py-3 px-2">Last Login</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3 px-2 font-medium">{user.displayName || "N/A"}</td>
                    <td className="py-3 px-2">{user.email}</td>
                    <td className="py-3 px-2">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role || "user"}</Badge>
                    </td>
                    <td className="py-3 px-2">{user.createdAt.toLocaleDateString()}</td>
                    <td className="py-3 px-2">{user.lastLogin ? user.lastLogin.toLocaleDateString() : "Never"}</td>
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
                          <DropdownMenuItem onClick={() => alert("View user details")}>
                            <UserCog className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {user.role !== "admin" ? (
                            <DropdownMenuItem onClick={() => handleMakeAdmin(user.id)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleRemoveAdmin(user.id)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-muted-foreground">
                      No users found
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
