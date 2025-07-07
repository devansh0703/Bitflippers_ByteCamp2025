"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Wand2, CheckCircle, Package, Folder, Code, FileText } from "lucide-react"
import Link from "next/link"

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric characters and underscores allowed"),
  description: z.string().optional(),
  rosDistro: z.enum(["humble", "iron", "jazzy"]),
  buildTool: z.enum(["colcon", "ament_cmake", "ament_python"]),
  path: z.string().min(1, "Path is required"),
})

const packageSchema = z.object({
  name: z.string().min(1, "Package name is required").regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric characters and underscores allowed"),
  description: z.string().optional(),
  maintainer: z.string().min(1, "Maintainer name is required"),
  email: z.string().email("Valid email required"),
  license: z.string().min(1, "License is required"),
  language: z.enum(["cpp", "python", "both"]),
  packageType: z.enum(["executable", "library", "metapackage"]),
  dependencies: z.array(z.string()).optional(),
  nodeTypes: z.array(z.string()).optional(),
})

type WorkspaceForm = z.infer<typeof workspaceSchema>
type PackageForm = z.infer<typeof packageSchema>

export default function ProjectWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [workspaceData, setWorkspaceData] = useState<WorkspaceForm | null>(null)
  const [packageData, setPackageData] = useState<PackageForm | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])

  const workspaceForm = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      rosDistro: "humble",
      buildTool: "colcon",
      path: "/home/user/ros2_ws",
    },
  })

  const packageForm = useForm<PackageForm>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      maintainer: "",
      email: "",
      license: "MIT",
      language: "cpp",
      packageType: "executable",
      dependencies: [],
      nodeTypes: [],
    },
  })

  const nodeTypeOptions = [
    { id: "publisher", label: "Publisher Node" },
    { id: "subscriber", label: "Subscriber Node" },
    { id: "service_server", label: "Service Server" },
    { id: "service_client", label: "Service Client" },
    { id: "action_server", label: "Action Server" },
    { id: "action_client", label: "Action Client" },
    { id: "timer_node", label: "Timer Node" },
    { id: "lifecycle_node", label: "Lifecycle Node" },
  ]

  const dependencyOptions = [
    "rclcpp",
    "rclpy",
    "std_msgs",
    "sensor_msgs",
    "geometry_msgs",
    "nav_msgs",
    "tf2_ros",
    "tf2_geometry_msgs",
    "moveit_ros_planning_interface",
    "gazebo_ros",
  ]

  const onWorkspaceSubmit = (data: WorkspaceForm) => {
    setWorkspaceData(data)
    setCurrentStep(2)
  }

  const onPackageSubmit = (data: PackageForm) => {
    setPackageData(data)
    setCurrentStep(3)
  }

  const generateProject = async () => {
    if (!workspaceData || !packageData) return

    setIsGenerating(true)
    setGenerationProgress(0)

    const projectData = {
      workspace: workspaceData,
      package: packageData,
    }

    try {
      // Simulate file generation progress
      const files = [
        `${workspaceData.path}/src/${packageData.name}/package.xml`,
        `${workspaceData.path}/src/${packageData.name}/CMakeLists.txt`,
        `${workspaceData.path}/src/${packageData.name}/setup.py`,
        `${workspaceData.path}/src/${packageData.name}/src/`,
        `${workspaceData.path}/src/${packageData.name}/include/`,
        `${workspaceData.path}/src/${packageData.name}/launch/`,
      ]

      for (let i = 0; i < files.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setGenerationProgress(((i + 1) / files.length) * 100)
        setGeneratedFiles(prev => [...prev, files[i]])
      }

      // Call the backend API
      const response = await fetch("http://localhost:8000/rosphere/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        setCurrentStep(4)
      } else {
        throw new Error("Failed to generate project")
      }
    } catch (error) {
      console.error("Project generation failed:", error)
      alert("Project generation failed. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setWorkspaceData(null)
    setPackageData(null)
    setGenerationProgress(0)
    setGeneratedFiles([])
    workspaceForm.reset()
    packageForm.reset()
  }

  const stepTitles = [
    "Workspace Setup",
    "Package Configuration",
    "Review & Generate",
    "Complete"
  ]

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/rosphere">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to ROSphere
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">ROS 2 Project Wizard</h1>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            {stepTitles.map((title, index) => (
              <span
                key={title}
                className={index + 1 <= currentStep ? "text-blue-600" : "text-muted-foreground"}
              >
                {title}
              </span>
            ))}
          </div>
          <Progress value={(currentStep / stepTitles.length) * 100} className="h-2" />
        </div>

        {/* Step 1: Workspace Setup */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="h-5 w-5" />
                <span>Workspace Configuration</span>
              </CardTitle>
              <CardDescription>
                Set up your ROS 2 workspace with the basic configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...workspaceForm}>
                <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={workspaceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workspace Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="my_ros2_workspace" {...field} />
                          </FormControl>
                          <FormDescription>
                            Name for your ROS 2 workspace
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={workspaceForm.control}
                      name="path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workspace Path *</FormLabel>
                          <FormControl>
                            <Input placeholder="/home/user/ros2_ws" {...field} />
                          </FormControl>
                          <FormDescription>
                            Full path where the workspace will be created
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={workspaceForm.control}
                      name="rosDistro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ROS 2 Distribution *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ROS 2 distribution" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="humble">Humble Hawksbill (LTS)</SelectItem>
                              <SelectItem value="iron">Iron Irwini</SelectItem>
                              <SelectItem value="jazzy">Jazzy Jalisco</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={workspaceForm.control}
                      name="buildTool"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Build Tool *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select build tool" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="colcon">Colcon (Recommended)</SelectItem>
                              <SelectItem value="ament_cmake">Ament CMake</SelectItem>
                              <SelectItem value="ament_python">Ament Python</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={workspaceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of your ROS 2 workspace..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description for your workspace
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">
                      Next: Package Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Package Configuration */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Package Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure your first ROS 2 package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...packageForm}>
                <form onSubmit={packageForm.handleSubmit(onPackageSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={packageForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="my_robot_package" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={packageForm.control}
                      name="packageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="executable">Executable Package</SelectItem>
                              <SelectItem value="library">Library Package</SelectItem>
                              <SelectItem value="metapackage">Meta Package</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={packageForm.control}
                      name="maintainer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintainer Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={packageForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={packageForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Programming Language *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cpp">C++</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="both">Both C++ and Python</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={packageForm.control}
                      name="license"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MIT">MIT</SelectItem>
                              <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                              <SelectItem value="BSD-3-Clause">BSD 3-Clause</SelectItem>
                              <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={packageForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of your package..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Node Types Selection */}
                  <div className="space-y-3">
                    <FormLabel>Node Types to Generate</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {nodeTypeOptions.map((nodeType) => (
                        <FormField
                          key={nodeType.id}
                          control={packageForm.control}
                          name="nodeTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={nodeType.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(nodeType.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), nodeType.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== nodeType.id)
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {nodeType.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit">
                      Next: Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Generate */}
        {currentStep === 3 && workspaceData && packageData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Review Configuration</span>
              </CardTitle>
              <CardDescription>
                Review your settings before generating the project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="workspace" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="workspace">Workspace</TabsTrigger>
                  <TabsTrigger value="package">Package</TabsTrigger>
                </TabsList>
                
                <TabsContent value="workspace" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {workspaceData.name}
                    </div>
                    <div>
                      <strong>Path:</strong> {workspaceData.path}
                    </div>
                    <div>
                      <strong>ROS Distribution:</strong> {workspaceData.rosDistro}
                    </div>
                    <div>
                      <strong>Build Tool:</strong> {workspaceData.buildTool}
                    </div>
                    {workspaceData.description && (
                      <div className="col-span-2">
                        <strong>Description:</strong> {workspaceData.description}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="package" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {packageData.name}
                    </div>
                    <div>
                      <strong>Type:</strong> {packageData.packageType}
                    </div>
                    <div>
                      <strong>Language:</strong> {packageData.language}
                    </div>
                    <div>
                      <strong>License:</strong> {packageData.license}
                    </div>
                    <div>
                      <strong>Maintainer:</strong> {packageData.maintainer}
                    </div>
                    <div>
                      <strong>Email:</strong> {packageData.email}
                    </div>
                    {packageData.nodeTypes && packageData.nodeTypes.length > 0 && (
                      <div className="col-span-2">
                        <strong>Node Types:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {packageData.nodeTypes.map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {nodeTypeOptions.find(opt => opt.id === type)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {isGenerating && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">Generating project files...</p>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <div className="space-y-1">
                    {generatedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  disabled={isGenerating}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={generateProject}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Project"}
                  <Code className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Project Generated Successfully!</span>
              </CardTitle>
              <CardDescription>
                Your ROS 2 project has been created and is ready for development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Generated Files:</h3>
                <div className="grid grid-cols-1 gap-2 font-mono text-sm bg-muted p-4 rounded">
                  {generatedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Navigate to your workspace: <code className="bg-muted px-1 rounded">cd {workspaceData?.path}</code></li>
                  <li>Source ROS 2: <code className="bg-muted px-1 rounded">source /opt/ros/{workspaceData?.rosDistro}/setup.bash</code></li>
                  <li>Build your workspace: <code className="bg-muted px-1 rounded">colcon build</code></li>
                  <li>Source your workspace: <code className="bg-muted px-1 rounded">source install/setup.bash</code></li>
                  <li>Run your nodes or start development!</li>
                </ol>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={resetWizard}
                >
                  Create Another Project
                </Button>
                <div className="space-x-2">
                  <Button asChild variant="outline">
                    <Link href="/rosphere/composer">
                      Launch Composer
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/rosphere">
                      Back to ROSphere
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}