"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Droplet, Zap, ArrowRight, Users, FileCheck, Award } from "lucide-react"

export default function HomePage() {
  const [stats, setStats] = useState({
    users: 1250,
    submissions: 3780,
    resolved: 2145,
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
                  Smart Circular Cities
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Empowering Mumbai's citizens to address waste management, flood control, and energy poverty through
                  community participation.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/submissions">Report an Issue</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              className="mx-auto lg:mr-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Mumbai cityscape"
                  fill
                  className="object-cover"
                  priority
                />
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
              <Users className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold">{stats.users.toLocaleString()}</h3>
              <p className="text-muted-foreground">Active Citizens</p>
            </motion.div>
            <motion.div
              className="stats-card bg-card shadow-sm rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <FileCheck className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold">{stats.submissions.toLocaleString()}</h3>
              <p className="text-muted-foreground">Issues Reported</p>
            </motion.div>
            <motion.div
              className="stats-card bg-card shadow-sm rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Award className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold">{stats.resolved.toLocaleString()}</h3>
              <p className="text-muted-foreground">Problems Solved</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Issues Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Challenges</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Mumbai faces critical sustainability challenges that require innovative community-driven solutions.
            </p>
          </div>

          <Tabs defaultValue="waste" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="waste">Waste Crisis</TabsTrigger>
              <TabsTrigger value="flood">Flood Vulnerability</TabsTrigger>
              <TabsTrigger value="energy">Energy Poverty</TabsTrigger>
            </TabsList>
            <TabsContent value="waste" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                    <div className="space-y-4">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Critical Issue
                      </div>
                      <h3 className="text-2xl font-bold">Waste Management Crisis</h3>
                      <p className="text-muted-foreground">
                        Mumbai generates over 7,000 tons of waste daily, with limited segregation and recycling
                        infrastructure. Improper waste disposal leads to environmental degradation, health hazards, and
                        clogged waterways that worsen flooding.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-red-500" />
                          <span>Overflowing landfills reaching critical capacity</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-amber-500" />
                          <span>Limited waste segregation at source</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                          <span>Growing potential for circular economy solutions</span>
                        </li>
                      </ul>
                      <Button asChild>
                        <Link href="/submissions">
                          Report Waste Issues
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=300&width=500"
                        alt="Waste management in Mumbai"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="flood" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                    <div className="space-y-4">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                        <Droplet className="mr-1 h-3 w-3" />
                        Urgent Challenge
                      </div>
                      <h3 className="text-2xl font-bold">Flood Vulnerability</h3>
                      <p className="text-muted-foreground">
                        Mumbai's low-lying areas face severe flooding during monsoons, exacerbated by clogged drainage
                        systems, encroachment on natural waterways, and rising sea levels due to climate change.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-red-500" />
                          <span>Critical infrastructure frequently submerged</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-amber-500" />
                          <span>Inadequate drainage maintenance</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                          <span>Community-based early warning systems showing promise</span>
                        </li>
                      </ul>
                      <Button asChild>
                        <Link href="/submissions">
                          Report Flood Issues
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=300&width=500"
                        alt="Flooding in Mumbai"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="energy" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                    <div className="space-y-4">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Zap className="mr-1 h-3 w-3" />
                        Growing Concern
                      </div>
                      <h3 className="text-2xl font-bold">Energy Poverty</h3>
                      <p className="text-muted-foreground">
                        Despite being India's financial capital, many Mumbai communities face energy insecurity with
                        unreliable access to clean, affordable power. This impacts education, health services, and
                        economic opportunities.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-red-500" />
                          <span>Informal settlements with limited grid access</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-amber-500" />
                          <span>High energy costs for low-income households</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                          <span>Emerging distributed renewable energy solutions</span>
                        </li>
                      </ul>
                      <Button asChild>
                        <Link href="/submissions">
                          Report Energy Issues
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=300&width=500"
                        alt="Energy solutions in Mumbai"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Join our community-driven platform to report issues, propose solutions, and make Mumbai more sustainable.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-12">
            <motion.div
              className="flex flex-col items-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold">Report Issues</h3>
              <p className="text-muted-foreground">
                Document waste, flooding, or energy problems in your neighborhood with photos and location data.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold">Propose Solutions</h3>
              <p className="text-muted-foreground">
                Contribute ideas and practical solutions to address reported problems in your community.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold">Earn Recognition</h3>
              <p className="text-muted-foreground">
                Get points and climb the leaderboard as your contributions make a real impact on Mumbai's
                sustainability.
              </p>
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/login">Join the Movement</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Make a Difference?
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Join thousands of Mumbai citizens who are working together to create a more sustainable, resilient city.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/leaderboard">View Impact</Link>
                </Button>
              </div>
            </div>
            <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=300&width=500"
                alt="Community action in Mumbai"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

