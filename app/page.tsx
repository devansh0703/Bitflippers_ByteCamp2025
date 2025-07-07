"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FolderOpen, 
  Activity, 
  Settings, 
  Code, 
  FileText, 
  ArrowRight, 
  Play,
  Monitor,
  Cpu,
  MemoryStick
} from "lucide-react"

export default function HomePage() {
  const [stats, setStats] = useState({
    projects: 12,
    activeNodes: 8,
    topics: 24,
  })

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 hero-pattern">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              className="flex flex-col justify-center space-y-4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  ROSphere
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Complete ROS 2 Operations & Development Sphere. Streamline your ROS 2 workflow with 
                  intuitive project management, visual launch composition, and real-time monitoring.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/projects">Create Project</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/monitoring">Monitor System</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              className="mx-auto lg:mr-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center">
                    <Settings className="w-12 h-12 text-primary-foreground animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700">ROS 2 Development Made Easy</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <motion.div
              className="stats-card bg-card shadow-sm rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FolderOpen className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold">{stats.projects}</h3>
              <p className="text-muted-foreground">Active Projects</p>
            </motion.div>
            <motion.div
              className="stats-card bg-card shadow-sm rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Activity className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold">{stats.activeNodes}</h3>
              <p className="text-muted-foreground">Running Nodes</p>
            </motion.div>
            <motion.div
              className="stats-card bg-card shadow-sm rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Monitor className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold">{stats.topics}</h3>
              <p className="text-muted-foreground">Active Topics</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Core Features</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Everything you need for efficient ROS 2 development in one integrated platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Project Wizard
                </CardTitle>
                <CardDescription>
                  Create ROS 2 workspaces with guided setup and automatic boilerplate generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/projects">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Launch Composer
                </CardTitle>
                <CardDescription>
                  Visual drag-and-drop interface for creating and managing ROS 2 launch files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/launch-composer">
                    Compose Launch Files
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Real-time Monitor
                </CardTitle>
                <CardDescription>
                  Live monitoring of nodes, topics, services, and system performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/monitoring">
                    View Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Code Generator
                </CardTitle>
                <CardDescription>
                  Generate publisher, subscriber, service, and action templates in Python or C++.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/code-generator">
                    Generate Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Centralized Logs
                </CardTitle>
                <CardDescription>
                  Aggregate and search through logs from all your ROS 2 nodes in one place.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/logs">
                    View Logs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  CLI Tools
                </CardTitle>
                <CardDescription>
                  Command-line interface for project creation, monitoring, and code generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="w-full justify-center">
                  rosphere --help
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* System Status Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">System Status</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Monitor your ROS 2 ecosystem at a glance with real-time metrics and health indicators.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-green-500" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CPU Usage</span>
                  <Badge variant="outline">42.3%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Memory Usage</span>
                  <Badge variant="outline">67.8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network I/O</span>
                  <Badge variant="outline">2.1 MB/s</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  ROS 2 Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Nodes</span>
                  <Badge variant="default">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Message Rate</span>
                  <Badge variant="default">156 Hz</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Services</span>
                  <Badge variant="default">12</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Accelerate Your ROS 2 Development?
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Join developers who are building the future of robotics with ROSphere's integrated development environment.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/projects">Start Building</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/monitoring">Explore Dashboard</Link>
                </Button>
              </div>
            </div>
            <div className="relative w-full h-[300px] overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="flex gap-4 justify-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Code className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Integrated ROS 2 Workflow</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

