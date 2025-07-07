"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, FileText, MapPin, Trash2, Droplet, Zap, Award, ArrowRight, Clock } from "lucide-react"

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(storedUser))

    // Fetch approved submissions
    fetch("http://localhost:8000/submissions?status=approved")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setIsLoading(false)
      })
  }, [router])

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Group submissions by type
  const wasteSubmissions = submissions.filter((sub) => sub.submission_type === "waste")
  const floodSubmissions = submissions.filter((sub) => sub.submission_type === "power")
  const energySubmissions = submissions.filter((sub) => sub.submission_type === "tree")

  // Get recent submissions (last 5)
  const recentSubmissions = [...submissions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  return (
    <div className="container py-12">
      <div className="grid gap-6">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2 items-center">
                <div>
                  <h1 className="text-3xl font-bold">Welcome, {user.username}</h1>
                  <p className="text-muted-foreground mt-2">Thank you for contributing to a more sustainable Mumbai.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                  <Card className="w-full sm:w-auto">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Award className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Your Points</p>
                        <p className="text-2xl font-bold">{user.points || 0}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Button asChild>
                    <Link href="/submissions">Report New Issue</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Waste Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-amber-500" />
                    <span className="text-2xl font-bold">{wasteSubmissions.length}</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                    Waste Management
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Flood Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{floodSubmissions.length}</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                    Flood Control
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Energy Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="text-2xl font-bold">{energySubmissions.length}</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                    Energy Solutions
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-7">
          {/* Recent Submissions */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest approved issues reported by the community</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSubmissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No approved submissions found.</p>
                ) : (
                  <div className="space-y-4">
                    {recentSubmissions.map((sub) => (
                      <Link key={sub.id} href={`/submissions/${sub.id}`}>
                        <div className="submission-card flex items-start p-4 rounded-lg border hover:bg-muted/50">
                          <div className="mr-4">
                            {sub.submission_type === "waste" && <Trash2 className="h-8 w-8 text-amber-500" />}
                            {sub.submission_type === "power" && <Droplet className="h-8 w-8 text-blue-500" />}
                            {sub.submission_type === "tree" && <Zap className="h-8 w-8 text-yellow-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="text-xs">
                                {sub.submission_type.toUpperCase()}
                              </Badge>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(sub.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <h4 className="font-medium text-sm truncate">{sub.description}</h4>
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {sub.location}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/submissions">
                    View All Submissions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Activity & Leaderboard */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>Track your impact and community standing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Contribution Level</div>
                      <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/10">
                        {user.points >= 100 ? "Champion" : user.points >= 50 ? "Contributor" : "Newcomer"}
                      </Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(user.points || 0, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 points</span>
                      <span>100 points</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/submissions">
                          <FileText className="h-4 w-4 mr-2" />
                          New Report
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/leaderboard">
                          <BarChart className="h-4 w-4 mr-2" />
                          Leaderboard
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Top Contributors</h4>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              {i}
                            </div>
                            <span className="font-medium">User{i}</span>
                          </div>
                          <span className="text-sm">{100 - i * 15} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/leaderboard">
                    View Full Leaderboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

