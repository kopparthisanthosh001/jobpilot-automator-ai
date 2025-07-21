
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
  scraped_at?: string;
}

const INDIAN_CITIES = ['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Pune']

const ROLE_SYNONYMS: Record<string, string[]> = {
  'product manager': ['product owner', 'pm', 'product lead', 'business analyst'],
  'software engineer': ['developer', 'programmer', 'software developer', 'engineer'],
  'frontend developer': ['ui developer', 'react developer', 'angular developer'],
  'backend developer': ['api developer', 'node developer', 'server-side engineer'],
  'data scientist': ['data analyst', 'ml engineer', 'ai engineer'],
  'devops engineer': ['sre', 'cloud engineer', 'platform engineer'],
  'ui/ux designer': ['designer', 'product designer'],
  'business analyst': ['functional analyst', 'systems analyst']
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const requestBody = await req.json().catch(() => ({}))
    const { user_id, fetch_recent = false, limit = 50 } = requestBody

    console.log('Scrape jobs request:', { user_id, fetch_recent, limit })

    const targetUsers = user_id
      ? [(await supabase.from('profiles').select('user_id, full_name, email, desired_role, preferred_locations, skills, experience_level').eq('user_id', user_id).single()).data]
      : (await supabase.from('profiles').select('user_id, full_name, email, desired_role, preferred_locations, skills, experience_level').not('desired_role', 'is', null)).data

    if (!targetUsers || targetUsers.length === 0) {
      throw new Error('No users found with profiles')
    }

    console.log('Target users for job scraping:', targetUsers.length)

    const allJobs: JobData[] = []

    for (const user of targetUsers) {
      if (!user.desired_role) continue
      
      // Get synonyms for the desired role
      const synonyms = ROLE_SYNONYMS[user.desired_role.toLowerCase()] || []
      let roles = [user.desired_role, ...synonyms]
      
      // Use ONLY user's preferred locations - no default cities
      const locations = user.preferred_locations || []
      
      if (locations.length === 0) {
        console.log(`No preferred locations for user ${user.email}, skipping job scraping`)
        continue
      }

      console.log(`Searching for ${user.email}: roles=${roles.join(',')}, locations=${locations.join(',')}`)

      for (const role of roles) {
        for (const city of locations) {
          try {
            const jobs = await scrapeLinkedInNaukriJobs(role, city, fetch_recent ? 5 : 10, user.experience_level)
            
            // Filter jobs to only include those from today and exact location match
            const todayJobs = jobs.filter(job => {
              // Check if job is from today
              const jobDate = new Date(job.scraped_at || new Date())
              const today = new Date()
              const isToday = jobDate.toDateString() === today.toDateString()
              
              // Check if job location exactly matches user's preferred city
              const isFromUserLocation = job.location.toLowerCase().includes(city.toLowerCase())
              
              return isToday && isFromUserLocation
            })
            
            allJobs.push(...todayJobs)
            console.log(`Found ${jobs.length} jobs for ${role} in ${city}, ${todayJobs.length} posted today`)
            
            // Add delay to avoid rate limiting
            await delay(1000 + Math.random() * 300)
            
            if (fetch_recent && allJobs.length >= limit) break
          } catch (error) {
            console.error(`Error scraping ${role} in ${city}:`, error)
          }
        }
        if (fetch_recent && allJobs.length >= limit) break
      }
    }

    // Remove duplicates and limit results
    const uniqueJobs = allJobs.filter((job, index, self) => index === self.findIndex(j => j.job_url === job.job_url)).slice(0, limit)
    console.log(`Scraped ${uniqueJobs.length} unique jobs`)

    // Insert scraped jobs into database
    const { data: insertedJobs, error: insertError } = await supabase.from('scraped_jobs').insert(uniqueJobs).select()

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    console.log(`Inserted ${insertedJobs?.length || 0} unique jobs`)

    // Create job matches for target users
    let totalMatches = 0
    for (const user of targetUsers) {
      if (!user.desired_role) continue

      console.log(`Creating matches for user: ${user.email}, role: ${user.desired_role}`)

      const matches = insertedJobs?.filter(job => isJobMatch(job, user)).map(job => ({
        user_id: user.user_id,
        job_id: job.id,
        match_score: calculateMatchScore(job, user),
        status: 'pending',
        date_posted: job.created_at || new Date().toISOString()
      })) || []

      if (matches.length > 0) {
        const { error: matchError } = await supabase.from('user_job_matches').insert(matches)
        if (!matchError) {
          console.log(`Created ${matches.length} matches for ${user.email}`)
          totalMatches += matches.length
        }
      } else if (insertedJobs && insertedJobs.length > 0) {
        // Create fallback match
        const { error: fallbackError } = await supabase.from('user_job_matches').insert([{
          user_id: user.user_id,
          job_id: insertedJobs[0].id,
          match_score: 0.3,
          status: 'pending',
          date_posted: insertedJobs[0].created_at || new Date().toISOString()
        }])
        
        if (!fallbackError) {
          console.log(`Created fallback match for ${user.email}`)
          totalMatches += 1
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      jobsScraped: uniqueJobs.length,
      usersProcessed: targetUsers.length,
      matchesCreated: totalMatches,
      message: fetch_recent ? `Recent jobs scraped successfully. Created ${totalMatches} job matches.` : `Jobs scraped successfully. Created ${totalMatches} job matches.`
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })

  } catch (error) {
    console.error('Error in scrape-jobs function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isJobMatch(job: any, user: any): boolean {
  console.log(`Checking match for job: ${job.title} vs user role: ${user.desired_role}`)
  
  const roleMatch = isRoleMatch(job.title, job.description, user.desired_role)
  
  // Skills matching (more lenient)
  let skillMatch = true
  if (user.skills && user.skills.length > 0) {
    skillMatch = user.skills.some(skill => 
      `${job.title} ${job.description}`.toLowerCase().includes(skill.toLowerCase())
    )
  }

  // Location matching (more lenient)
  let locationMatch = true
  if (user.preferred_locations && user.preferred_locations.length > 0) {
    locationMatch = user.preferred_locations.some(loc => 
      job.location?.toLowerCase().includes(loc.toLowerCase())
    )
  }

  // Experience matching
  let expMatch = true
  if (user.experience_level) {
    expMatch = `${job.description}`.toLowerCase().includes(user.experience_level.toLowerCase())
  }

  // More flexible matching: role match OR (skill match AND location match) AND experience match
  const isMatch = (roleMatch || (skillMatch && locationMatch)) && expMatch
  
  console.log(`Match result: roleMatch=${roleMatch}, skillMatch=${skillMatch}, locationMatch=${locationMatch}, expMatch=${expMatch}, finalMatch=${isMatch}`)
  
  return isMatch
}

function isRoleMatch(jobTitle: string, jobDesc: string, desiredRole: string): boolean {
  const text = `${jobTitle} ${jobDesc}`.toLowerCase()
  const role = desiredRole.toLowerCase()
  
  // Direct match
  if (text.includes(role)) return true
  
  // Check synonyms
  const synonyms = ROLE_SYNONYMS[role] || []
  if (synonyms.some(s => text.includes(s.toLowerCase()))) return true
  
  // Partial word matching for common terms
  const roleWords = role.split(' ')
  const matchingWords = roleWords.filter(word => text.includes(word))
  
  // If more than 50% of role words match, consider it a match
  return matchingWords.length >= Math.ceil(roleWords.length / 2)
}

function calculateMatchScore(job: any, user: any): number {
  let score = 0
  
  // Enhanced title matching (higher weight for semantic matches)
  const title = job.title.toLowerCase()
  const role = user.desired_role.toLowerCase()
  
  // Exact match gets highest score
  if (title === role) {
    score += 0.5
  } else if (title.includes(role)) {
    score += 0.4
  } else if (isRoleMatch(job.title, job.description, user.desired_role)) {
    score += 0.35
  }
  
  // Description matching
  if (job.description?.toLowerCase().includes(role)) {
    score += 0.15
  }
  
  // Skills matching (more generous scoring)
  if (user.skills && user.skills.length > 0) {
    const jobText = `${job.title} ${job.description}`.toLowerCase()
    const matches = user.skills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    ).length
    score += Math.min((matches / user.skills.length) * 0.25, 0.25)
  }
  
  // Location matching
  if (user.preferred_locations && user.preferred_locations.length > 0) {
    const locationMatch = user.preferred_locations.some(loc => 
      job.location?.toLowerCase().includes(loc.toLowerCase())
    )
    if (locationMatch) score += 0.1
  }
  
  // Platform bonus for LinkedIn and Naukri (higher priority)
  if (['linkedin', 'naukri'].includes(job.platform)) {
    score += 0.15
  }
  
  // Salary range bonus
  if (job.salary_range?.includes('₹')) score += 0.05
  
  // Ensure minimum score for any job to show some matches
  return Math.max(score, 0.2)
}

async function scrapeLinkedInNaukriJobs(role: string, location: string, limit: number, experience?: string): Promise<JobData[]> {
  const apiKey = Deno.env.get('RAPIDAPI_KEY')
  if (!apiKey) {
    console.log('RAPIDAPI_KEY not found, returning empty results')
    return []
  }

  const jobs: JobData[] = []

  const headers = {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
  }

  // Search for jobs posted TODAY only - strict date filtering
  const endpoints = [
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role)}&country=IN&locality=${encodeURIComponent(location)}&employment_types=FULLTIME&date_posted=today`,
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role + ' site:naukri.com')}&country=IN&locality=${encodeURIComponent(location)}&employment_types=FULLTIME&date_posted=today`
  ]

  let totalProcessedJobs = 0
  const today = new Date().toDateString()

  for (const url of endpoints) {
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        // Progressive delay for retries
        if (retryCount > 0) {
          await delay(2000 + (retryCount * 1000))
        }
        
        const res = await fetch(url, { method: 'GET', headers })
        
        // Handle rate limiting specifically
        if (res.status === 429) {
          console.error(`Rate limited on ${url}, retry ${retryCount + 1}/${maxRetries}`)
          retryCount++
          await delay(5000) // Wait 5 seconds for rate limit
          continue
        }
        
        // Handle forbidden access
        if (res.status === 403) {
          console.error(`Access forbidden on ${url}, skipping endpoint`)
          break // Skip this endpoint entirely
        }
        
        if (!res.ok) {
          console.error(`Failed to fetch from ${url}: ${res.status}`)
          retryCount++
          continue
        }
        
        const json = await res.json()
        const jobData = json.data || []
        
        let todayJobsCount = 0
        
        for (const job of jobData.slice(0, Math.ceil(limit / 2))) {
          const desc = job.job_description || job.job_highlights?.Qualifications?.join('. ') || 'No description available'
          
          // Strict date filtering - ONLY jobs posted today
          const jobPostedDate = job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toDateString() : today
          if (jobPostedDate !== today) {
            continue // Skip jobs not posted today
          }
          
          // Strict location filtering - only exact city matches
          const jobLocation = `${job.job_city || ''} ${job.job_state || ''}`.toLowerCase()
          if (!jobLocation.includes(location.toLowerCase())) {
            continue
          }
          
          // Strict role filtering - job title must contain the role
          const jobTitle = job.job_title?.toLowerCase() || ''
          const roleWords = role.toLowerCase().split(' ')
          const hasRoleMatch = roleWords.some(word => jobTitle.includes(word)) || 
                             jobTitle.includes(role.toLowerCase())
          
          if (!hasRoleMatch) {
            continue
          }
          
          // Filter by experience level if specified
          if (experience && !desc.toLowerCase().includes(experience.toLowerCase())) {
            continue
          }
          
          jobs.push({
            title: job.job_title || 'Unknown Title',
            company: job.employer_name || 'Unknown Company',
            location: `${job.job_city || location}, ${job.job_state || 'India'}`,
            description: desc,
            salary_range: job.job_salary || (job.job_min_salary ? `₹${job.job_min_salary} - ₹${job.job_max_salary}` : undefined),
            job_url: job.job_apply_link || job.job_google_link || '#',
            platform: url.includes('naukri') ? 'naukri' : 'linkedin',
            requirements: job.job_highlights?.Qualifications || [],
            benefits: job.job_highlights?.Benefits || [],
            scraped_at: new Date().toISOString()
          })
          
          todayJobsCount++
          totalProcessedJobs++
        }
        
        console.log(`Found ${jobData.length} jobs for ${role} in ${location}, ${todayJobsCount} posted today`)
        
        // Break out of retry loop on success
        break
        
      } catch (error) {
        console.error(`Error fetching from ${url} (attempt ${retryCount + 1}):`, error)
        retryCount++
        
        if (retryCount >= maxRetries) {
          console.error(`Max retries reached for ${url}`)
        }
      }
    }
    
    // Add delay between different endpoints
    await delay(1000)
  }

  console.log(`Scraped ${jobs.length} jobs for ${role} in ${location}`)
  return jobs
}
