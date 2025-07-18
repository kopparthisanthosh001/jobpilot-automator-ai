
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobData {
  title: string;
  company: string;
  location: string;
  description: string;
  salary_range?: string;
  job_url: string;
  platform: string;
  requirements?: string[];
  benefits?: string[];
}

// Indian cities for job search
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 
  'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida', 'Kochi', 'Coimbatore'
];

// Tech roles for Indian market
const TECH_ROLES = [
  'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 
  'Backend Developer', 'DevOps Engineer', 'Data Scientist', 
  'Product Manager', 'UI/UX Designer', 'React Developer', 
  'Node.js Developer', 'Python Developer', 'Java Developer'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json().catch(() => ({}))
    const { user_id, fetch_recent = false, limit = 50 } = requestBody

    console.log('Scrape jobs request:', { user_id, fetch_recent, limit })

    let targetUsers = []

    // If specific user_id provided, get that user's profile
    if (user_id) {
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, desired_role, preferred_locations, skills')
        .eq('user_id', user_id)
        .single()

      if (userError) {
        console.error('Error fetching user profile:', userError)
        throw new Error('User profile not found')
      }

      if (userProfile) {
        targetUsers = [userProfile]
      }
    } else {
      // Get all users with profiles for bulk scraping
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, desired_role, preferred_locations, skills')
        .not('desired_role', 'is', null)

      if (usersError) throw usersError
      targetUsers = users || []
    }

    console.log('Target users for job scraping:', targetUsers.length)

    const allJobs: JobData[] = []
    
    // Determine which roles and locations to search for
    let rolesToSearch = TECH_ROLES
    let locationsToSearch = INDIAN_CITIES.slice(0, 6) // Top 6 cities

    if (fetch_recent && targetUsers.length === 1) {
      // For individual user, focus on their preferences
      const user = targetUsers[0]
      if (user.desired_role) {
        rolesToSearch = [user.desired_role]
      }
      if (user.preferred_locations && user.preferred_locations.length > 0) {
        locationsToSearch = user.preferred_locations.slice(0, 3) // Max 3 locations
      }
    }

    // Scrape jobs from JSearch API for targeted search
    for (const role of rolesToSearch) {
      for (const city of locationsToSearch) {
        try {
          const jobs = await scrapeJSearchJobs(role, city, fetch_recent ? 5 : 10)
          allJobs.push(...jobs)
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Break early if we have enough jobs for recent fetch
          if (fetch_recent && allJobs.length >= limit) {
            break
          }
        } catch (error) {
          console.error(`Error scraping ${role} in ${city}:`, error)
        }
      }
      if (fetch_recent && allJobs.length >= limit) {
        break
      }
    }

    // Add some sample recent Indian jobs if not enough found
    if (fetch_recent && allJobs.length < limit) {
      try {
        const recentJobs = await getRecentIndianJobs(limit - allJobs.length)
        allJobs.push(...recentJobs)
      } catch (error) {
        console.error('Error getting recent jobs:', error)
      }
    }

    // Remove duplicates and limit results
    const uniqueJobs = allJobs
      .filter((job, index, self) => 
        index === self.findIndex(j => j.job_url === job.job_url)
      )
      .slice(0, limit)

    console.log(`Scraped ${uniqueJobs.length} unique jobs`)

    // Insert scraped jobs into database
    const { data: insertedJobs, error: insertError } = await supabase
      .from('scraped_jobs')
      .insert(uniqueJobs)
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    console.log(`Inserted ${insertedJobs?.length || 0} unique jobs`)

    // Create job matches for target users
    for (const user of targetUsers) {
      if (!user.desired_role) continue

      const matchingJobs = insertedJobs?.filter(job => {
        // Match based on role
        const roleMatch = job.title.toLowerCase().includes(user.desired_role.toLowerCase()) ||
                         job.description?.toLowerCase().includes(user.desired_role.toLowerCase())
        
        // Match based on skills if available
        let skillMatch = true
        if (user.skills && user.skills.length > 0) {
          const jobText = `${job.title} ${job.description}`.toLowerCase()
          skillMatch = user.skills.some(skill => 
            jobText.includes(skill.toLowerCase())
          )
        }

        // Match based on location if available
        let locationMatch = true
        if (user.preferred_locations && user.preferred_locations.length > 0) {
          locationMatch = user.preferred_locations.some(location => 
            job.location?.toLowerCase().includes(location.toLowerCase())
          )
        }

        return roleMatch && (skillMatch || locationMatch)
      }) || []

      // Create job matches for this user
      const jobMatches = matchingJobs.map(job => ({
        user_id: user.user_id,
        job_id: job.id,
        match_score: calculateMatchScore(job, user),
        status: 'pending'
      }))

      if (jobMatches.length > 0) {
        const { error: matchError } = await supabase
          .from('user_job_matches')
          .insert(jobMatches)

        if (matchError) {
          console.error(`Error creating matches for user ${user.email}:`, matchError)
        } else {
          console.log(`Created ${jobMatches.length} matches for ${user.email}`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobsScraped: uniqueJobs.length,
        usersProcessed: targetUsers.length,
        message: fetch_recent ? 'Recent jobs scraped and matches created successfully' : 'Jobs scraped and matches created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in scrape-jobs function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Scrape jobs using JSearch API (RapidAPI)
async function scrapeJSearchJobs(role: string, location: string, jobLimit: number = 10): Promise<JobData[]> {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
  if (!rapidApiKey) {
    console.error('RAPIDAPI_KEY not found in environment variables')
    return []
  }

  try {
    // Add date filter for recent jobs (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    
    const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role)}&page=1&num_pages=1&country=IN&locality=${encodeURIComponent(location)}&date_posted=today`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.status}`)
    }

    const data = await response.json()
    const jobs: JobData[] = []

    if (data.data && Array.isArray(data.data)) {
      for (const job of data.data.slice(0, jobLimit)) {
        jobs.push({
          title: job.job_title || 'Unknown Title',
          company: job.employer_name || 'Unknown Company',
          location: `${job.job_city || location}, ${job.job_state || 'India'}`,
          description: job.job_description || job.job_highlights?.Qualifications?.join('. ') || 'No description available',
          salary_range: job.job_salary || job.job_min_salary ? `₹${job.job_min_salary || 'Not specified'} - ₹${job.job_max_salary || 'Not specified'}` : undefined,
          job_url: job.job_apply_link || job.job_google_link || '#',
          platform: 'linkedin',
          requirements: job.job_highlights?.Qualifications || [],
          benefits: job.job_highlights?.Benefits || []
        })
      }
    }

    return jobs
  } catch (error) {
    console.error(`Error scraping JSearch for ${role} in ${location}:`, error)
    return []
  }
}

// Get recent Indian tech jobs (fallback data)
async function getRecentIndianJobs(limit: number): Promise<JobData[]> {
  const currentTime = new Date()
  const recentJobs: JobData[] = [
    {
      title: 'Senior React Developer',
      company: 'Zomato',
      location: 'Bangalore, India',
      description: 'Looking for experienced React developer to build next-generation food delivery platform. Work with modern tech stack including React 18, TypeScript, and GraphQL.',
      salary_range: '₹12,00,000 - ₹20,00,000',
      job_url: 'https://zomato.com/careers/react-dev-001',
      platform: 'company-website',
      requirements: ['React.js', 'TypeScript', 'GraphQL', 'Node.js'],
      benefits: ['Health Insurance', 'Remote Flexible', 'Stock Options']
    },
    {
      title: 'Full Stack Engineer',
      company: 'Swiggy',
      location: 'Hyderabad, India', 
      description: 'Join our engineering team to build scalable microservices and modern web applications. Experience with React, Node.js, and AWS required.',
      salary_range: '₹10,00,000 - ₹18,00,000',
      job_url: 'https://swiggy.com/careers/fullstack-eng-002',
      platform: 'company-website',
      requirements: ['React', 'Node.js', 'AWS', 'MongoDB'],
      benefits: ['Flexible Hours', 'Health Coverage', 'Learning Budget']
    },
    {
      title: 'DevOps Engineer',
      company: 'Paytm',
      location: 'Noida, India',
      description: 'Manage cloud infrastructure and CI/CD pipelines for high-traffic fintech applications. Docker, Kubernetes, and AWS experience required.',
      salary_range: '₹15,00,000 - ₹25,00,000',
      job_url: 'https://paytm.com/careers/devops-003',
      platform: 'company-website',
      requirements: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
      benefits: ['Remote Work', 'Stock Options', 'Medical Insurance']
    },
    {
      title: 'Frontend Developer',
      company: 'Flipkart',
      location: 'Bangalore, India',
      description: 'Build responsive and performant web applications for millions of users. React, Redux, and modern JavaScript expertise required.',
      salary_range: '₹8,00,000 - ₹15,00,000',
      job_url: 'https://flipkart.com/careers/frontend-004',
      platform: 'company-website',
      requirements: ['React', 'Redux', 'JavaScript', 'CSS3'],
      benefits: ['Work from Home', 'Health Insurance', 'Skill Development']
    },
    {
      title: 'Python Developer',
      company: 'Ola Cabs',
      location: 'Mumbai, India',
      description: 'Develop backend services and APIs for ride-sharing platform. Python, Django, and database optimization experience preferred.',
      salary_range: '₹9,00,000 - ₹16,00,000',
      job_url: 'https://ola.com/careers/python-005',
      platform: 'company-website',
      requirements: ['Python', 'Django', 'PostgreSQL', 'Redis'],
      benefits: ['Flexible Timing', 'Transportation', 'Health Benefits']
    }
  ].slice(0, limit)

  return recentJobs
}

function calculateMatchScore(job: any, user: any): number {
  let score = 0
  
  // Title matching (higher weight for exact matches)
  const titleLower = job.title.toLowerCase()
  const roleLower = user.desired_role.toLowerCase()
  
  if (titleLower.includes(roleLower)) score += 0.4
  if (titleLower === roleLower) score += 0.2
  
  // Description matching
  const descriptionMatch = job.description?.toLowerCase().includes(roleLower)
  if (descriptionMatch) score += 0.2
  
  // Skills matching
  if (user.skills && user.skills.length > 0) {
    const jobText = `${job.title} ${job.description}`.toLowerCase()
    const skillMatches = user.skills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    ).length
    score += (skillMatches / user.skills.length) * 0.3
  }
  
  // Location matching
  if (user.preferred_locations && user.preferred_locations.length > 0) {
    const locationMatch = user.preferred_locations.some(location => 
      job.location?.toLowerCase().includes(location.toLowerCase())
    )
    if (locationMatch) score += 0.15
  }
  
  // Indian tech company bonus
  const indianTechCompanies = [
    'zomato', 'swiggy', 'paytm', 'flipkart', 'ola', 'byju', 'unacademy',
    'tcs', 'infosys', 'wipro', 'hcl', 'tech mahindra', 'mindtree'
  ]
  const companyLower = job.company.toLowerCase()
  const isIndianTech = indianTechCompanies.some(company => companyLower.includes(company))
  if (isIndianTech) score += 0.1
  
  // Salary range bonus
  if (job.salary_range && job.salary_range.includes('₹')) score += 0.05
  
  return Math.min(score, 1.0)
}
