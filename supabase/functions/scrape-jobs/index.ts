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

    // Get all users with profiles to scrape for
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, desired_role')
      .not('desired_role', 'is', null)

    if (usersError) throw usersError

    console.log('Found users:', users?.length || 0)

    const allJobs: JobData[] = []
    
    // Scrape jobs from JSearch API for Indian market
    for (const role of TECH_ROLES) {
      for (const city of INDIAN_CITIES.slice(0, 6)) { // Focus on top 6 cities
        try {
          const jobs = await scrapeJSearchJobs(role, city)
          allJobs.push(...jobs)
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`Error scraping ${role} in ${city}:`, error)
        }
      }
    }

    // Also add some sample Naukri-style jobs
    try {
      const naukriJobs = await scrapeNaukriJobs()
      allJobs.push(...naukriJobs)
    } catch (error) {
      console.error('Error scraping Naukri:', error)
    }

    // Remove duplicates based on job URL
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => j.job_url === job.job_url)
    )

    console.log(`Scraped ${uniqueJobs.length} unique jobs`)

    // Insert scraped jobs into database
    const { data: insertedJobs, error: insertError } = await supabase
      .from('scraped_jobs')
      .insert(uniqueJobs)
      .select()

    if (insertError) throw insertError

    console.log(`Inserted ${insertedJobs?.length || 0} unique jobs`)

    // Match jobs to users based on their desired role
    for (const user of users) {
      if (!user.desired_role) continue

      const matchingJobs = insertedJobs?.filter(job => 
        job.title.toLowerCase().includes(user.desired_role.toLowerCase()) ||
        job.description.toLowerCase().includes(user.desired_role.toLowerCase())
      ) || []

      // Create job matches for this user
      const jobMatches = matchingJobs.map(job => ({
        user_id: user.user_id,
        job_id: job.id,
        match_score: calculateMatchScore(job, user.desired_role),
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
        usersProcessed: users.length,
        message: 'Indian jobs scraped and matches created successfully'
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
async function scrapeJSearchJobs(role: string, location: string): Promise<JobData[]> {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
  if (!rapidApiKey) {
    console.error('RAPIDAPI_KEY not found in environment variables')
    return []
  }

  try {
    const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role)}&page=1&num_pages=1&country=IN&locality=${encodeURIComponent(location)}`, {
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
      for (const job of data.data.slice(0, 10)) { // Limit to 10 jobs per search
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

// Scrape jobs from Naukri.com (sample data for now)
async function scrapeNaukriJobs(): Promise<JobData[]> {
  // Sample Indian tech jobs that would typically be found on Naukri
  const sampleJobs: JobData[] = [
    {
      title: 'Senior Software Engineer',
      company: 'Tata Consultancy Services',
      location: 'Bangalore, India',
      description: 'Looking for experienced software engineer with React.js and Node.js expertise. Work on cutting-edge projects for global clients.',
      salary_range: '₹8,00,000 - ₹15,00,000',
      job_url: 'https://naukri.com/sample-job-1',
      platform: 'naukri',
      requirements: ['React.js', 'Node.js', '3+ years experience', 'JavaScript'],
      benefits: ['Health Insurance', 'Work from Home', 'Performance Bonus']
    },
    {
      title: 'Full Stack Developer',
      company: 'Infosys Limited',
      location: 'Hyderabad, India',
      description: 'Full stack developer role with modern tech stack. Join our digital transformation team.',
      salary_range: '₹6,00,000 - ₹12,00,000',
      job_url: 'https://naukri.com/sample-job-2',
      platform: 'naukri',
      requirements: ['JavaScript', 'React', 'MongoDB', 'Express.js'],
      benefits: ['Flexible Hours', 'Learning Budget', 'Health Insurance']
    },
    {
      title: 'DevOps Engineer',
      company: 'Wipro Technologies',
      location: 'Pune, India',
      description: 'DevOps engineer to manage cloud infrastructure and CI/CD pipelines. AWS experience preferred.',
      salary_range: '₹10,00,000 - ₹18,00,000',
      job_url: 'https://naukri.com/sample-job-3',
      platform: 'naukri',
      requirements: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
      benefits: ['Remote Work', 'Performance Bonus', 'Stock Options']
    },
    {
      title: 'Frontend Developer',
      company: 'HCL Technologies',
      location: 'Chennai, India',
      description: 'Frontend developer with React expertise. Work on enterprise applications for Fortune 500 clients.',
      salary_range: '₹5,00,000 - ₹9,00,000',
      job_url: 'https://naukri.com/sample-job-4',
      platform: 'naukri',
      requirements: ['React', 'TypeScript', 'CSS3', 'HTML5'],
      benefits: ['Health Insurance', 'Skill Development', 'Flexible Timing']
    },
    {
      title: 'Data Scientist',
      company: 'Tech Mahindra',
      location: 'Mumbai, India',
      description: 'Data scientist role to build ML models and analytics solutions. Python and R experience required.',
      salary_range: '₹12,00,000 - ₹20,00,000',
      job_url: 'https://naukri.com/sample-job-5',
      platform: 'naukri',
      requirements: ['Python', 'R', 'Machine Learning', 'SQL'],
      benefits: ['Remote Friendly', 'Research Budget', 'Conference Attendance']
    }
  ]

  return sampleJobs
}

function calculateMatchScore(job: any, desiredRole: string): number {
  let score = 0
  
  // Title matching (higher weight for exact matches)
  const titleLower = job.title.toLowerCase()
  const roleLower = desiredRole.toLowerCase()
  
  if (titleLower.includes(roleLower)) score += 0.5
  if (titleLower === roleLower) score += 0.2 // Bonus for exact match
  
  // Description matching
  const descriptionMatch = job.description.toLowerCase().includes(roleLower)
  if (descriptionMatch) score += 0.2
  
  // Indian tech company bonus
  const indianTechCompanies = [
    'tcs', 'infosys', 'wipro', 'hcl', 'tech mahindra', 'mindtree', 
    'zoho', 'freshworks', 'byju', 'paytm', 'flipkart', 'swiggy', 'zomato'
  ]
  const globalTechCompanies = ['google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix']
  
  const companyLower = job.company.toLowerCase()
  const isIndianTech = indianTechCompanies.some(company => companyLower.includes(company))
  const isGlobalTech = globalTechCompanies.some(company => companyLower.includes(company))
  
  if (isGlobalTech) score += 0.15
  if (isIndianTech) score += 0.1
  
  // Location bonus for major tech hubs
  const majorTechHubs = ['bangalore', 'hyderabad', 'pune', 'gurgaon', 'mumbai']
  const locationMatch = majorTechHubs.some(city => 
    job.location.toLowerCase().includes(city)
  )
  if (locationMatch) score += 0.05
  
  // Salary range bonus (prefer jobs with disclosed salary)
  if (job.salary_range && job.salary_range.includes('₹')) score += 0.05
  
  // Tech skills matching
  const techSkills = ['react', 'node', 'javascript', 'python', 'java', 'aws', 'docker']
  const combinedText = `${job.title} ${job.description}`.toLowerCase()
  const skillMatches = techSkills.filter(skill => combinedText.includes(skill)).length
  score += (skillMatches / techSkills.length) * 0.1
  
  return Math.min(score, 1.0) // Cap at 1.0
}