"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, MapPin, Trash2, Droplet, Zap, Clock, ImageIcon } from "lucide-react"

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    user_id: 1, // default; update this with the logged-in user's id
    submission_type: "waste",
    location: "",
    latitude: 19.076, // Default to Mumbai coordinates
    longitude: 72.8777,
    description: "",
    image_url: "",
  })
  const router = useRouter()

  // Check login
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    // Optionally update formData.user_id from the logged-in user's id:
    const user = JSON.parse(storedUser)
    setFormData((prev) => ({ ...prev, user_id: user.id }))

    // Fetch approved original submissions
    fetch("http://localhost:8000/submissions?status=approved")
      .then((res) => res.json())
      .then((data) => {
        const originals = data.filter((item) => !item.parent_submission_id)
        setSubmissions(originals)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError("Error fetching submissions")
        setIsLoading(false)
      })
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsSubmitting(true)

    try {
      const payload = { ...formData, parent_submission_id: null }
      const res = await fetch("http://localhost:8000/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || "Error creating submission")
        setIsSubmitting(false)
        return
      }

      const data = await res.json()
      setMessage("Submission created successfully!")
      setSubmissions([...submissions, data.submission])
      setFormData({
        user_id: formData.user_id,
        submission_type: "waste",
        location: "",
        latitude: 19.076,
        longitude: 72.8777,
        description: "",
        image_url: "",
      })
      setIsSubmitting(false)

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      console.error(err)
      setError("An error occurred while creating the submission")
      setIsSubmitting(false)
    }
  }

  // Group submissions by type
  const wasteSubmissions = submissions.filter((sub) => sub.submission_type === "waste")
  const floodSubmissions = submissions.filter((sub) => sub.submission_type === "power")
  const energySubmissions = submissions.filter((sub) => sub.submission_type === "tree")

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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Submissions List */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Community Submissions</CardTitle>
                <CardDescription>Browse issues reported by Mumbai citizens</CardDescription>
              </CardHeader>
              <CardContent>
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

                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="waste">Waste</TabsTrigger>
                    <TabsTrigger value="flood">Flood</TabsTrigger>
                    <TabsTrigger value="energy">Energy</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-6">
                    {submissions.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No approved submissions found.</p>
                    ) : (
                      <div className="space-y-4">
                        {submissions.map((sub) => (
                          <Link key={sub.id} href={`/submissions/${sub.id}`}>
                            <div className="submission-card flex items-start p-4 rounded-lg border hover:bg-muted/50">
                              <div className="mr-4">{getSubmissionIcon(sub.submission_type)}</div>
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
                  </TabsContent>

                  <TabsContent value="waste" className="mt-6">
                    {wasteSubmissions.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No waste management submissions found.</p>
                    ) : (
                      <div className="space-y-4">
                        {wasteSubmissions.map((sub) => (
                          <Link key={sub.id} href={`/submissions/${sub.id}`}>
                            <div className="submission-card flex items-start p-4 rounded-lg border hover:bg-muted/50">
                              <div className="mr-4">{getSubmissionIcon(sub.submission_type)}</div>
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
                  </TabsContent>

                  <TabsContent value="flood" className="mt-6">
                    {floodSubmissions.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No flood control submissions found.</p>
                    ) : (
                      <div className="space-y-4">
                        {floodSubmissions.map((sub) => (
                          <Link key={sub.id} href={`/submissions/${sub.id}`}>
                            <div className="submission-card flex items-start p-4 rounded-lg border hover:bg-muted/50">
                              <div className="mr-4">{getSubmissionIcon(sub.submission_type)}</div>
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
                  </TabsContent>

                  <TabsContent value="energy" className="mt-6">
                    {energySubmissions.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No energy solution submissions found.</p>
                    ) : (
                      <div className="space-y-4">
                        {energySubmissions.map((sub) => (
                          <Link key={sub.id} href={`/submissions/${sub.id}`}>
                            <div className="submission-card flex items-start p-4 rounded-lg border hover:bg-muted/50">
                              <div className="mr-4">{getSubmissionIcon(sub.submission_type)}</div>
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Submission Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Report New Issue</CardTitle>
              <CardDescription>Help improve Mumbai by reporting sustainability issues</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="submission_type">Issue Type</Label>
                  <Select
                    value={formData.submission_type}
                    onValueChange={(value) => handleSelectChange("submission_type", value)}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location (e.g., Bandra, Mumbai)"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      step="0.000001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      step="0.000001"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the issue in detail"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <div className="flex">
                    <Input
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      required
                      className="rounded-r-none"
                    />
                    <Button type="button" variant="outline" className="rounded-l-none border-l-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Provide a URL to an image that shows the issue</p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

