"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Trash2,
  Droplet,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"

export default function ModeratorDashboard() {
  const [pendingSubmissions, setPendingSubmissions] = useState([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [selectedType, setSelectedType] = useState("waste")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const router = useRouter()
  const [userRole, setUserRole] = useState("user")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    const user = JSON.parse(storedUser)
    if (user.role !== "moderator") {
      router.push("/dashboard")
      return
    }
    setUserRole(user.role)

    // Fetch pending submissions for the selected type
    fetchSubmissions()
  }, [router, selectedType])

  const fetchSubmissions = () => {
    setIsLoading(true)
    fetch(`http://localhost:8000/moderator/submissions?submission_type=${selectedType}`)
      .then((res) => res.json())
      .then((data) => {
        setPendingSubmissions(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError("Error fetching pending submissions")
        setIsLoading(false)
      })
  }

  const handleApprove = async (submissionId) => {
    setError("")
    setMessage("")
    try {
      const res = await fetch("http://localhost:8000/moderator/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moderator_id: JSON.parse(localStorage.getItem("user")).id,
          submission_id: submissionId,
          decision: "approved",
          remarks: "Looks good",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError("Approval failed: " + (data.detail || "Unknown error"))
        return
      }

      setMessage("Submission approved successfully.")
      fetchSubmissions()

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null)
      }
    } catch (err) {
      console.error(err)
      setError("Error approving submission.")
    }
  }

  const handleResolve = async (submissionId) => {
    setError("")
    setMessage("")
    try {
      const res = await fetch(
        `http://localhost:8000/moderator/resolve?submission_id=${submissionId}&moderator_id=${JSON.parse(localStorage.getItem("user")).id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      )

      if (!res.ok) {
        const data = await res.json()
        setError("Resolve failed: " + (data.detail || "Unknown error"))
        return
      }

      setMessage("Submission resolved successfully.")
      fetchSubmissions()

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null)
      }
    } catch (err) {
      console.error(err)
      setError("Error resolving submission.")
    }
  }

  const handleReject = async (submissionId) => {
    setError("")
    setMessage("")
    try {
      const res = await fetch("http://localhost:8000/moderator/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moderator_id: JSON.parse(localStorage.getItem("user")).id,
          submission_id: submissionId,
          decision: "rejected",
          remarks: "Does not meet guidelines",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError("Rejection failed: " + (data.detail || "Unknown error"))
        return
      }

      setMessage("Submission rejected successfully.")
      fetchSubmissions()

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null)
      }
    } catch (err) {
      console.error(err)
      setError("Error rejecting submission.")
    }
  }

  const getSubmissionIcon = (type) => {
    switch (type) {
      case "waste":
        return <Trash2 className="h-5 w-5 text-amber-500" />
      case "power":
        return <Droplet className="h-5 w-5 text-blue-500" />
      case "tree":
        return <Zap className="h-5 w-5 text-yellow-500" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  const getSubmissionTypeLabel = (type) => {
    switch (type) {
      case "waste":
        return "Waste Management"
      case "power":
        return "Flood Control"
      case "tree":
        return "Energy Solutions"
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Moderator Dashboard</h1>
          <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl">
            Review and manage community submissions for Mumbai's sustainability
          </p>
        </div>

        {message && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Submissions List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Pending Submissions</CardTitle>
                <CardDescription>Review and moderate community reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label htmlFor="submissionType">Filter by Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waste">Waste Management</SelectItem>
                      <SelectItem value="power">Flood Control</SelectItem>
                      <SelectItem value="tree">Energy Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pendingSubmissions.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">
                      No pending submissions for {getSubmissionTypeLabel(selectedType)}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                          selectedSubmission?.id === sub.id ? "bg-primary/5 border-primary/20" : ""
                        }`}
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getSubmissionIcon(sub.submission_type)}
                            <span className="font-medium">ID: {sub.id}</span>
                          </div>
                          <Badge
                            variant={
                              sub.status === "pending" ? "outline" : sub.status === "approved" ? "default" : "secondary"
                            }
                          >
                            {sub.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm truncate">{sub.description}</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {sub.location}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submission Details */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSubmissionIcon(selectedSubmission.submission_type)}
                      <CardTitle>Submission #{selectedSubmission.id}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        selectedSubmission.status === "pending"
                          ? "outline"
                          : selectedSubmission.status === "approved"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {selectedSubmission.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    {getSubmissionTypeLabel(selectedSubmission.submission_type)} issue reported on{" "}
                    {new Date(selectedSubmission.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
                    <Image
                      src={selectedSubmission.image_url || "/placeholder.svg?height=300&width=600"}
                      alt={selectedSubmission.description}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Description</h3>
                    <p>{selectedSubmission.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedSubmission.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(selectedSubmission.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">Location Details</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Latitude</p>
                          <p className="font-mono">{selectedSubmission.latitude}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Longitude</p>
                          <p className="font-mono">{selectedSubmission.longitude}</p>
                        </div>
                      </div>
                    </div>

                    {selectedSubmission.genai_analysis && (
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <h4 className="font-medium text-blue-700 mb-2">AI Analysis</h4>
                        <p className="text-blue-700">
                          {selectedSubmission.genai_analysis.result || "No analysis available"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="default"
                    className="w-full sm:w-auto"
                    onClick={() => handleApprove(selectedSubmission.id)}
                    disabled={selectedSubmission.status !== "pending"}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleReject(selectedSubmission.id)}
                    disabled={selectedSubmission.status !== "pending"}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => handleResolve(selectedSubmission.id)}
                    disabled={selectedSubmission.status !== "approved"}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto ml-auto"
                    onClick={() => router.push(`/submissions/${selectedSubmission.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Public Page
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-muted/50 p-6 mb-4">
                    <ShieldCheck className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Submission Selected</h3>
                  <p className="text-muted-foreground mb-6">Select a submission from the list to review its details</p>
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Approve valid submissions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Reject inappropriate content</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Mark issues as resolved when fixed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

