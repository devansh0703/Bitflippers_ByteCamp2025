"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Trophy, User } from "lucide-react"

export default function LeaderboardPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    setCurrentUser(JSON.parse(storedUser))

    fetch("http://localhost:8000/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError("Error fetching leaderboard")
        setIsLoading(false)
      })
  }, [router])

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Find current user's rank
  const currentUserRank = users.findIndex((user) => user.id === currentUser?.id) + 1

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Community Leaderboard</h1>
          <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl">
            Recognizing Mumbai's most active citizens in creating a sustainable future
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {users.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full ${index === 0 ? "border-yellow-300 bg-yellow-50/50" : ""}`}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`relative mb-4 ${index === 0 ? "mt-[-30px]" : ""}`}>
                    {index === 0 && (
                      <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2">
                        <Trophy className="h-10 w-10 text-yellow-500" />
                      </div>
                    )}
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full 
                      ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                          : index === 1
                            ? "bg-gray-100 text-gray-700 border-2 border-gray-300"
                            : "bg-amber-100 text-amber-700 border-2 border-amber-300"
                      }`}
                    >
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="absolute bottom-0 right-0">
                      {index === 0 ? (
                        <Badge className="bg-yellow-500">1st</Badge>
                      ) : index === 1 ? (
                        <Badge className="bg-gray-400">2nd</Badge>
                      ) : (
                        <Badge className="bg-amber-500">3rd</Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{user.username}</h3>
                  <p className="text-3xl font-bold mt-2">{user.points} pts</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      {Math.floor(user.points / 10)} Solutions
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                      {Math.floor(user.points / 5)} Reports
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
            <CardDescription>All participants ranked by contribution points</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Time</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 items-center gap-4 p-4 font-medium border-b bg-muted/50">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-7">User</div>
                    <div className="col-span-2 text-center">Points</div>
                    <div className="col-span-2 text-center">Level</div>
                  </div>

                  {users.map((user, index) => (
                    <div
                      key={user.id}
                      className={`grid grid-cols-12 items-center gap-4 p-4 border-b ${
                        currentUser?.id === user.id ? "bg-primary/5" : ""
                      } ${index % 2 === 1 ? "bg-muted/20" : ""}`}
                    >
                      <div className="col-span-1 text-center font-medium">{index + 1}</div>
                      <div className="col-span-7 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.floor(user.points / 10)} solutions • {Math.floor(user.points / 5)} reports
                          </div>
                        </div>
                        {currentUser?.id === user.id && (
                          <Badge variant="outline" className="ml-2">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-2 text-center font-bold">{user.points}</div>
                      <div className="col-span-2 text-center">
                        <Badge variant={user.points >= 100 ? "default" : user.points >= 50 ? "outline" : "secondary"}>
                          {user.points >= 100 ? "Champion" : user.points >= 50 ? "Contributor" : "Newcomer"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="month" className="mt-6">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 items-center gap-4 p-4 font-medium border-b bg-muted/50">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-7">User</div>
                    <div className="col-span-2 text-center">Points</div>
                    <div className="col-span-2 text-center">Level</div>
                  </div>

                  {/* This would be filtered for monthly data in a real app */}
                  {users.map((user, index) => (
                    <div
                      key={user.id}
                      className={`grid grid-cols-12 items-center gap-4 p-4 border-b ${
                        currentUser?.id === user.id ? "bg-primary/5" : ""
                      } ${index % 2 === 1 ? "bg-muted/20" : ""}`}
                    >
                      <div className="col-span-1 text-center font-medium">{index + 1}</div>
                      <div className="col-span-7 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.floor(user.points / 12)} solutions • {Math.floor(user.points / 6)} reports
                          </div>
                        </div>
                        {currentUser?.id === user.id && (
                          <Badge variant="outline" className="ml-2">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-2 text-center font-bold">{Math.floor(user.points * 0.7)}</div>
                      <div className="col-span-2 text-center">
                        <Badge variant={user.points >= 100 ? "default" : user.points >= 50 ? "outline" : "secondary"}>
                          {user.points >= 100 ? "Champion" : user.points >= 50 ? "Contributor" : "Newcomer"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="week" className="mt-6">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 items-center gap-4 p-4 font-medium border-b bg-muted/50">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-7">User</div>
                    <div className="col-span-2 text-center">Points</div>
                    <div className="col-span-2 text-center">Level</div>
                  </div>

                  {/* This would be filtered for weekly data in a real app */}
                  {users.map((user, index) => (
                    <div
                      key={user.id}
                      className={`grid grid-cols-12 items-center gap-4 p-4 border-b ${
                        currentUser?.id === user.id ? "bg-primary/5" : ""
                      } ${index % 2 === 1 ? "bg-muted/20" : ""}`}
                    >
                      <div className="col-span-1 text-center font-medium">{index + 1}</div>
                      <div className="col-span-7 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.floor(user.points / 15)} solutions • {Math.floor(user.points / 8)} reports
                          </div>
                        </div>
                        {currentUser?.id === user.id && (
                          <Badge variant="outline" className="ml-2">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-2 text-center font-bold">{Math.floor(user.points * 0.3)}</div>
                      <div className="col-span-2 text-center">
                        <Badge variant={user.points >= 100 ? "default" : user.points >= 50 ? "outline" : "secondary"}>
                          {user.points >= 100 ? "Champion" : user.points >= 50 ? "Contributor" : "Newcomer"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {currentUserRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">Your Current Ranking</h3>
                      <p className="text-sm text-muted-foreground">Keep contributing to climb the leaderboard!</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">#{currentUserRank}</div>
                    <div className="text-sm text-muted-foreground">of {users.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

