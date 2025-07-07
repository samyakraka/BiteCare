import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Linkedin, Mail } from "lucide-react"

const teamMembers = [
  {
    name: "Vedant Deore",
    role: "AI Developer",
    bio: "Passionate about creating innovative food tech solutions that enhance the dining experience.",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQGBczx7Az5SFA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1723009716220?e=1757548800&v=beta&t=BVh-tSj18WH0q1x5cxEpl53MpEZyZ3kpA74p5ebXZDA",
    linkedin: "https://www.linkedin.com/in/vedantdeore/",
    github: "https://github.com/vedantdeore",
    email: "vedant@bitecare.com",
  },
  {
    name: "Samyak Raka",
    role: "Backend Developer",
    bio: "Tech enthusiast with expertise in building scalable applications and AI-powered solutions.",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQHca2m6F2mP4g/profile-displayphoto-shrink_400_400/B4DZXI.qKKG8Ag-/0/1742833624815?e=1757548800&v=beta&t=arWNXIUZtvogXEdAxlmKhGD5nzXvS1vUovPhQQOOkkw",
    linkedin: "https://www.linkedin.com/in/samyakraka/",
    github: "https://github.com/samyakraka",
    email: "samyak@bitecare.com",
  },
  {
    name: "Ritesh Sakhare",
    role: "Developer",
    bio: "Product strategist focused on creating intuitive user experiences and solving customer pain points.",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQGEKYMNsIsKWA/profile-displayphoto-scale_400_400/B4DZexO9FeH4As-/0/1751025178602?e=1757548800&v=beta&t=14qugWTE1AzKwgmRVuOZ0fu9SsZ6RgwLxIqvIsrC5Qk",
    linkedin: "https://www.linkedin.com/in/ritesh-sakhare-559342258/",
    github: "https://github.com/riteshsakhare",
    email: "ritesh.s@bitecare.com",
  },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About BiteCare</h1>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg mb-6">
            At BiteCare, we're on a mission to revolutionize the restaurant ordering experience through innovative
            technology and personalized service. We believe that everyone deserves access to delicious, quality food
            with a seamless ordering process.
          </p>
          <p className="text-lg mb-6">
            Our AI-powered platform helps customers discover dishes tailored to their preferences, dietary requirements,
            and taste profiles, while providing restaurants with valuable insights to better serve their customers.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-lg mb-6">
            BiteCare was founded in 2023 by a group of food enthusiasts and tech innovators who saw an opportunity to
            enhance the restaurant ordering experience. What started as a simple idea to improve food ordering has
            evolved into a comprehensive platform that connects diners with their perfect meals.
          </p>
          <p className="text-lg mb-6">
            Today, we're proud to serve thousands of customers and partner with restaurants across the country, helping
            to create memorable dining experiences through technology.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground mb-4">{member.bio}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                        <span className="sr-only">LinkedIn</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={member.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`mailto:${member.email}`}>
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Email</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p>We constantly push the boundaries of what's possible in food tech to create better experiences.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Quality</h3>
                <p>We're committed to excellence in every aspect of our service and the food we help deliver.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p>We believe in building strong relationships with customers, restaurants, and communities.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Join Us on Our Journey</h2>
          <p className="text-lg mb-6">We're just getting started, and we'd love for you to be part of our story.</p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/menu">Explore Our Menu</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
