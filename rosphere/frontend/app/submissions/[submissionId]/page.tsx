"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  Trash2,
  Droplet,
  Zap,
  ImageIcon,
  ThumbsUp,
} from "lucide-react"

export default function SubmissionDetailsPage() {
  const { submissionId } = useParams()
  const [submission, setSubmission] = useState(null)
  const [solutions, setSolutions] = useState([])
  const [error, setError] = useState("")
  const [solutionDescription, setSolutionDescription] = useState("")
  const [solutionImageUrl, setSolutionImageUrl] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [userRole, setUserRole] = useState("user")
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    setUserRole(userData.role || "user")

    const fetchSubmissionDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8000/submissions/${submissionId}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.detail || "Submission not found")
          setIsLoading(false)
          return
        }
        const data = await res.json()
        setSubmission(data)

        // Fetch solutions (child submissions)
        const solutionsRes = await fetch(`http://localhost:8000/submissions?parent_id=${submissionId}`)
        if (solutionsRes.ok) {
          const solutionsData = await solutionsRes.json()
          setSolutions(solutionsData)
        }

        setIsLoading(false)
      } catch (err) {
        console.error(err)
        setError("Error fetching submission details")
        setIsLoading(false)
      }
    }

    if (submissionId) {
      fetchSubmissionDetails()
    }
  }, [submissionId, router])

  const handleSubmitSolution = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsSubmitting(true)

    try {
      const payload = {
        user_id: user.id,
        submission_type: submission.submission_type,
        location: submission.location,
        latitude: submission.latitude,
        longitude: submission.longitude,
        description: solutionDescription,
        image_url: solutionImageUrl,
        parent_submission_id: submission.id,
      }

      const res = await fetch("http://localhost:8000/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || "Error submitting solution")
        setIsSubmitting(false)
        return
      }

      const data = await res.json()
      setMessage("Solution submitted successfully!")
      setSolutionDescription("")
      setSolutionImageUrl("")

      // Add the new solution to the list
      setSolutions([...solutions, data.submission])
      setIsSubmitting(false)

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      console.error(err)
      setError("An error occurred while submitting the solution")
      setIsSubmitting(false)
    }
  }

  const getSubmissionIcon = (type) => {
    switch (type) {
      case "waste":
        return <Trash2 className="h-6 w-6 text-amber-500" />
      case "power":
        return <Droplet className="h-6 w-6 text-blue-500" />
      case "tree":
        return <Zap className="h-6 w-6 text-yellow-500" />
      default:
        return <MapPin className="h-6 w-6" />
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
          <p className="text-muted-foreground">Loading submission details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!submission) return null

  return (
    <div className="container py-12">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Submission Details */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSubmissionIcon(submission.submission_type)}
                    <CardTitle>{getSubmissionTypeLabel(submission.submission_type)} Issue</CardTitle>
                  </div>
                  <Badge variant={submission.status === "approved" ? "outline" : "secondary"}>
                    {submission.status.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>Reported on {new Date(submission.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {message && (
                  <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
                  <Image
                    src={submission.image_url || "/placeholder.svg?height=300&width=600"}
                    alt={submission.description}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Description</h3>
                  <p>{submission.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{submission.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(submission.created_at).toLocaleString()}</span>
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
                        <p className="font-mono">{submission.latitude}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Longitude</p>
                        <p className="font-mono">{submission.longitude}</p>
                      </div>
                    </div>
                  </div>

                  {userRole === "moderator" && submission.genai_analysis && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h4 className="font-medium text-blue-700 mb-2">AI Analysis</h4>
                      <p className="text-blue-700">{submission.genai_analysis.result || "No analysis available"}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Proposed Solutions</h3>

                  {solutions.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-muted/30">
                      <p className="text-muted-foreground">No solutions proposed yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Be the first to suggest a solution!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {solutions.map((solution) => (
                        <Card key={solution.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">Solution #{solution.id}</h4>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(solution.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p>{solution.description}</p>
                                {solution.image_url && (
                                  <div className="relative w-full h-[200px] overflow-hidden rounded-lg">
                                    <Image
                                      src={solution.image_url || "/placeholder.svg"}
                                      alt="Solution image"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    Helpful
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Solution Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Submit a Solution</CardTitle>
              <CardDescription>Help solve this issue by proposing a practical solution</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSolution} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="solutionDescription">Solution Description</Label>
                  <Textarea
                    id="solutionDescription"
                    value={solutionDescription}
                    onChange={(e) => setSolutionDescription(e.target.value)}
                    placeholder="Describe your solution in detail..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solutionImageUrl">Solution Image URL</Label>
                  <div className="flex">
                    <Input
                      id="solutionImageUrl"
                      value={solutionImageUrl}
                      onChange={(e) => setSolutionImageUrl(e.target.value)}
                      placeholder="https://example.com/solution_image.jpg"
                      required
                      className="rounded-r-none"
                    />
                    <Button type="button" variant="outline" className="rounded-l-none border-l-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Provide a URL to an image that shows your solution</p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Solution"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

