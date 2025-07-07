"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Wand2, Code, Layers, FileText, Rocket } from "lucide-react"
import Link from "next/link"

export default function ROSpherePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ROSphere
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simplify ROS 2 development with our comprehensive suite of visual tools and generators
          </p>
          <Badge variant="secondary" className="text-sm">
            Phase 1 - Foundation Tools
          </Badge>
        </div>

        {/* Main Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Project Wizard */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/rosphere/wizard">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Wand2 className="h-6 w-6 text-blue-600" />
                  <CardTitle>Project Wizard</CardTitle>
                </div>
                <CardDescription>
                  Create ROS 2 workspaces and packages with guided setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Workspace creation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Package templates</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Auto-generated files</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Launch Composer */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/rosphere/composer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Layers className="h-6 w-6 text-purple-600" />
                  <CardTitle>Launch Composer</CardTitle>
                </div>
                <CardDescription>
                  Visual drag-and-drop interface for building launch files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Drag & drop nodes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Visual connections</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>QoS configuration</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Code Generator */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/rosphere/generator">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Code className="h-6 w-6 text-green-600" />
                  <CardTitle>Code Generator</CardTitle>
                </div>
                <CardDescription>
                  Generate boilerplate code for common ROS 2 patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>C++ & Python templates</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Node patterns</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Service & Action templates</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Documentation */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/rosphere/docs">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-orange-600" />
                  <CardTitle>Documentation</CardTitle>
                </div>
                <CardDescription>
                  Setup guides and best practices for ROS 2 development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Installation guides</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Best practices</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Troubleshooting</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Quick Start */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Rocket className="h-6 w-6 text-blue-600" />
                <CardTitle>Quick Start</CardTitle>
              </div>
              <CardDescription>
                Get up and running with ROS 2 in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/rosphere/wizard">
                  Create Your First Project
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* CLI Tools */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/rosphere/cli">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-gray-600" />
                  <CardTitle>CLI Tools</CardTitle>
                </div>
                <CardDescription>
                  Command-line tools for automated project generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>rosphere-cli</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Docker integration</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Batch operations</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-center mb-8">Platform Features</h2>
          <Tabs defaultValue="wizard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wizard">Project Wizard</TabsTrigger>
              <TabsTrigger value="composer">Launch Composer</TabsTrigger>
              <TabsTrigger value="generator">Code Generator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wizard" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Graphical Project Wizard</CardTitle>
                  <CardDescription>
                    Streamline your ROS 2 project setup with our intuitive wizard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Workspace Creation</h4>
                      <p className="text-sm text-muted-foreground">
                        Set up ROS 2 workspaces with proper structure and build configuration
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Package Templates</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose from pre-built templates for different node types and architectures
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">File Generation</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate CMakeLists.txt, package.xml, and launch files
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Validation</h4>
                      <p className="text-sm text-muted-foreground">
                        Built-in validation ensures your project structure follows ROS 2 conventions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="composer" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Intelligent Launch Composer</CardTitle>
                  <CardDescription>
                    Build complex launch configurations with drag-and-drop simplicity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Visual Interface</h4>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop nodes, parameters, and configurations to build launch files
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Node Connections</h4>
                      <p className="text-sm text-muted-foreground">
                        Visualize topic and service connections between your nodes
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">QoS Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure Quality of Service settings with intuitive controls
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Export Options</h4>
                      <p className="text-sm text-muted-foreground">
                        Export to standard ROS 2 launch file formats (Python, XML, YAML)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="generator" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>ROS 2 Boilerplate Generator</CardTitle>
                  <CardDescription>
                    Generate production-ready code for common ROS 2 patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Multi-Language Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate code in C++ and Python with best practices built-in
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Node Templates</h4>
                      <p className="text-sm text-muted-foreground">
                        Publishers, subscribers, services, actions, and more
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Custom Patterns</h4>
                      <p className="text-sm text-muted-foreground">
                        Create and save your own templates for reusable patterns
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">CLI Integration</h4>
                      <p className="text-sm text-muted-foreground">
                        Use from command line for automated workflows and CI/CD
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}