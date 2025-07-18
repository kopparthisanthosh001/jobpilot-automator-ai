import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobData {
  title: string;
  company: string;
  location?: string;
  description: string;
  salary_range?: string;
  job_url: string;
  requirements?: string[];
  benefits?: string[];
}

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

    const indeedApiUrl = 'https://api.indeed.com/ads/apisearch'
    const indeedApiKey = Deno.env.get('INDEED_API_KEY')
    
    if (!indeedApiKey) {
      throw new Error('Indeed API key not configured')
    }

    // Common tech roles to scrape for
    const techRoles = [
      'Software Engineer',
      'Frontend Developer', 
      'Backend Developer',
      'Full Stack Developer',
      'Data Scientist',
      'DevOps Engineer',
      'Product Manager',
      'UI/UX Designer'
    ]

    const allJobs: JobData[] = []

    // Scrape jobs for each role
    for (const role of techRoles) {
      try {
        const searchParams = new URLSearchParams({
          publisher: indeedApiKey,
          q: role,
          l: 'Remote',
          sort: 'date',
          radius: '50',
          st: 'jobsite',
          jt: 'fulltime',
          start: '0',
          limit: '25',
          fromage: '7', // Jobs from last 7 days
          format: 'json',
          v: '2'
        })

        const response = await fetch(`${indeedApiUrl}?${searchParams}`)
        const data = await response.json()

        if (data.results) {
          const jobs: JobData[] = data.results.map((job: any) => ({
            title: job.jobtitle,
            company: job.company,
            location: job.formattedLocation || 'Remote',
            description: job.snippet,
            salary_range: job.salary || null,
            job_url: job.url,
            requirements: job.snippet ? [job.snippet] : [],
            benefits: []
          }))

          allJobs.push(...jobs)
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error scraping for role ${role}:`, error)
      }
    }

    console.log(`Scraped ${allJobs.length} jobs total`)

    // Remove duplicates based on job URL
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => j.job_url === job.job_url)
    )

    // Insert scraped jobs into database
    const { data: insertedJobs, error: insertError } = await supabase
      .from('scraped_jobs')
      .insert(
        uniqueJobs.map(job => ({
          ...job,
          platform: 'indeed'
        }))
      )
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
        usersProcessed: users.length
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

function calculateMatchScore(job: any, desiredRole: string): number {
  let score = 0
  
  // Title match (highest weight)
  if (job.title.toLowerCase().includes(desiredRole.toLowerCase())) {
    score += 0.6
  }
  
  // Description match
  if (job.description.toLowerCase().includes(desiredRole.toLowerCase())) {
    score += 0.3
  }
  
  // Company quality bonus (simple heuristic)
  const topCompanies = ['google', 'microsoft', 'amazon', 'apple', 'facebook', 'meta', 'netflix']
  if (topCompanies.some(company => job.company.toLowerCase().includes(company))) {
    score += 0.1
  }
  
  return Math.min(score, 1.0) // Cap at 1.0
}