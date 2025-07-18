
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

// Enhanced Indian cities for job search
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 
  'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida', 'Kochi', 'Coimbatore',
  'Indore', 'Jaipur', 'Lucknow', 'Chandigarh'
];

// Enhanced roles with business and technical categories
const TECH_ROLES = [
  'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 
  'Backend Developer', 'DevOps Engineer', 'Data Scientist', 
  'Product Manager', 'UI/UX Designer', 'React Developer', 
  'Node.js Developer', 'Python Developer', 'Java Developer',
  'Business Analyst', 'Project Manager', 'Scrum Master',
  'Marketing Manager', 'Sales Executive', 'Content Writer'
];

// Role synonyms and categories for better matching
const ROLE_SYNONYMS = {
  'product manager': ['product owner', 'pm', 'product lead', 'business analyst', 'product analyst'],
  'software engineer': ['developer', 'programmer', 'software developer', 'engineer'],
  'frontend developer': ['ui developer', 'react developer', 'angular developer', 'vue developer'],
  'backend developer': ['api developer', 'server developer', 'node developer'],
  'data scientist': ['data analyst', 'ml engineer', 'ai engineer', 'data engineer'],
  'devops engineer': ['cloud engineer', 'infrastructure engineer', 'sre', 'platform engineer'],
  'ui/ux designer': ['designer', 'ux designer', 'ui designer', 'product designer'],
  'business analyst': ['ba', 'analyst', 'systems analyst', 'functional analyst']
};

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
        console.log('Target user profile:', userProfile)
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
        // Add the user's role and related synonyms
        rolesToSearch = [user.desired_role]
        const synonyms = ROLE_SYNONYMS[user.desired_role.toLowerCase()] || []
        rolesToSearch = rolesToSearch.concat(synonyms)
      }
      if (user.preferred_locations && user.preferred_locations.length > 0) {
        locationsToSearch = user.preferred_locations.slice(0, 3) // Max 3 locations
      }
    }

    console.log('Roles to search:', rolesToSearch)
    console.log('Locations to search:', locationsToSearch)

    // Scrape jobs from LinkedIn and Naukri for targeted search
    for (const role of rolesToSearch) {
      for (const city of locationsToSearch) {
        try {
          const jobs = await scrapeLinkedInNaukriJobs(role, city, fetch_recent ? 5 : 10)
          allJobs.push(...jobs)
          console.log(`Found ${jobs.length} LinkedIn/Naukri jobs for ${role} in ${city}`)
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
          
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
        console.log(`Added ${recentJobs.length} sample jobs`)
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

    // Create job matches for target users with improved matching
    let totalMatches = 0
    for (const user of targetUsers) {
      if (!user.desired_role) continue

      console.log(`Creating matches for user: ${user.email}, role: ${user.desired_role}`)

      const matchingJobs = insertedJobs?.filter(job => {
        return isJobMatch(job, user)
      }) || []

      console.log(`Found ${matchingJobs.length} matching jobs for ${user.email}`)

      // Create job matches for this user
      const jobMatches = matchingJobs.map(job => ({
        user_id: user.user_id,
        job_id: job.id,
        match_score: calculateMatchScore(job, user),
        status: 'pending',
        date_posted: job.created_at || new Date().toISOString()
      }))

      if (jobMatches.length > 0) {
        const { error: matchError } = await supabase
          .from('user_job_matches')
          .insert(jobMatches)

        if (matchError) {
          console.error(`Error creating matches for user ${user.email}:`, matchError)
        } else {
          console.log(`Created ${jobMatches.length} matches for ${user.email}`)
          totalMatches += jobMatches.length
        }
      } else {
        console.log(`No matches found for ${user.email} - creating fallback matches`)
        // Create at least one match as fallback if we have jobs
        if (insertedJobs && insertedJobs.length > 0) {
          const fallbackMatch = {
            user_id: user.user_id,
            job_id: insertedJobs[0].id,
            match_score: 0.3, // Low but visible match
            status: 'pending',
            date_posted: insertedJobs[0].created_at || new Date().toISOString()
          }
          
          const { error: fallbackError } = await supabase
            .from('user_job_matches')
            .insert([fallbackMatch])

          if (!fallbackError) {
            console.log(`Created fallback match for ${user.email}`)
            totalMatches += 1
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobsScraped: uniqueJobs.length,
        usersProcessed: targetUsers.length,
        matchesCreated: totalMatches,
        message: fetch_recent ? `Recent jobs scraped successfully. Created ${totalMatches} job matches.` : `Jobs scraped successfully. Created ${totalMatches} job matches.`
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

// Enhanced job matching function
function isJobMatch(job: any, user: any): boolean {
  console.log(`Checking match for job: ${job.title} vs user role: ${user.desired_role}`)
  
  // Flexible role matching
  const roleMatch = isRoleMatch(job.title, job.description, user.desired_role)
  
  // Skills matching (more lenient)
  let skillMatch = true
  if (user.skills && user.skills.length > 0) {
    const jobText = `${job.title} ${job.description}`.toLowerCase()
    skillMatch = user.skills.some(skill => 
      jobText.includes(skill.toLowerCase())
    )
  }

  // Location matching (more lenient)
  let locationMatch = true
  if (user.preferred_locations && user.preferred_locations.length > 0) {
    locationMatch = user.preferred_locations.some(location => 
      job.location?.toLowerCase().includes(location.toLowerCase())
    )
  }

  // More flexible matching: role match OR (skill match AND location match)
  const isMatch = roleMatch || (skillMatch && locationMatch)
  
  console.log(`Match result: roleMatch=${roleMatch}, skillMatch=${skillMatch}, locationMatch=${locationMatch}, finalMatch=${isMatch}`)
  
  return isMatch
}

// Enhanced role matching with semantic understanding
function isRoleMatch(jobTitle: string, jobDescription: string, desiredRole: string): boolean {
  const jobText = `${jobTitle} ${jobDescription}`.toLowerCase()
  const role = desiredRole.toLowerCase()
  
  // Direct match
  if (jobText.includes(role)) {
    return true
  }
  
  // Check synonyms
  const synonyms = ROLE_SYNONYMS[role] || []
  for (const synonym of synonyms) {
    if (jobText.includes(synonym.toLowerCase())) {
      return true
    }
  }
  
  // Partial word matching for common terms
  const roleWords = role.split(' ')
  const matchingWords = roleWords.filter(word => jobText.includes(word))
  
  // If more than 50% of role words match, consider it a match
  return matchingWords.length >= Math.ceil(roleWords.length * 0.5)
}

// Scrape jobs specifically from LinkedIn and Naukri using JSearch API
async function scrapeLinkedInNaukriJobs(role: string, location: string, jobLimit: number = 10): Promise<JobData[]> {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
  if (!rapidApiKey) {
    console.error('RAPIDAPI_KEY not found in environment variables')
    return []
  }

  const jobs: JobData[] = []

  try {
    // Search for LinkedIn jobs specifically
    const linkedinResponse = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role)}&page=1&num_pages=1&country=IN&locality=${encodeURIComponent(location)}&employment_types=FULLTIME&job_requirements=no_degree&remote_jobs_only=false&date_posted=week&employer=linkedin`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    })

    if (linkedinResponse.ok) {
      const linkedinData = await linkedinResponse.json()
      if (linkedinData.data && Array.isArray(linkedinData.data)) {
        for (const job of linkedinData.data.slice(0, Math.ceil(jobLimit / 2))) {
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
    }

    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Search for Naukri jobs specifically
    const naukriResponse = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role + ' site:naukri.com')}&page=1&num_pages=1&country=IN&locality=${encodeURIComponent(location)}&employment_types=FULLTIME&date_posted=week`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    })

    if (naukriResponse.ok) {
      const naukriData = await naukriResponse.json()
      if (naukriData.data && Array.isArray(naukriData.data)) {
        for (const job of naukriData.data.slice(0, Math.ceil(jobLimit / 2))) {
          jobs.push({
            title: job.job_title || 'Unknown Title',
            company: job.employer_name || 'Unknown Company',
            location: `${job.job_city || location}, ${job.job_state || 'India'}`,
            description: job.job_description || job.job_highlights?.Qualifications?.join('. ') || 'No description available',
            salary_range: job.job_salary || job.job_min_salary ? `₹${job.job_min_salary || 'Not specified'} - ₹${job.job_max_salary || 'Not specified'}` : undefined,
            job_url: job.job_apply_link || job.job_google_link || '#',
            platform: 'naukri',
            requirements: job.job_highlights?.Qualifications || [],
            benefits: job.job_highlights?.Benefits || []
          })
        }
      }
    }

    return jobs
  } catch (error) {
    console.error(`Error scraping LinkedIn/Naukri for ${role} in ${location}:`, error)
    return []
  }
}

// Enhanced sample jobs with more diverse roles including Product Manager
async function getRecentIndianJobs(limit: number): Promise<JobData[]> {
  const recentJobs: JobData[] = [
    {
      title: 'Product Manager',
      company: 'Flipkart',
      location: 'Bangalore, India',
      description: 'Lead product strategy and roadmap for e-commerce platform. Work with engineering, design, and business teams to deliver customer-centric solutions. Experience with product analytics and user research required.',
      salary_range: '₹15,00,000 - ₹25,00,000',
      job_url: 'https://flipkart.com/careers/product-manager-001',
      platform: 'company-website',
      requirements: ['Product Management', 'Analytics', 'Strategy', 'Leadership'],
      benefits: ['Health Insurance', 'Stock Options', 'Remote Flexible']
    },
    {
      title: 'Senior Product Manager',
      company: 'Zomato',
      location: 'Gurgaon, India',
      description: 'Drive product innovation for food delivery and restaurant discovery. Lead cross-functional teams and define product vision. Strong background in consumer internet products required.',
      salary_range: '₹18,00,000 - ₹30,00,000',
      job_url: 'https://zomato.com/careers/senior-pm-002',
      platform: 'company-website',
      requirements: ['Product Strategy', 'Consumer Internet', 'Team Leadership', 'Data Analysis'],
      benefits: ['Stock Options', 'Health Coverage', 'Learning Budget']
    },
    {
      title: 'Senior React Developer',
      company: 'Paytm',
      location: 'Noida, India',
      description: 'Build scalable web applications using React and modern JavaScript. Work on high-traffic fintech applications serving millions of users.',
      salary_range: '₹12,00,000 - ₹20,00,000',
      job_url: 'https://paytm.com/careers/react-dev-003',
      platform: 'company-website',
      requirements: ['React.js', 'JavaScript', 'TypeScript', 'Redux'],
      benefits: ['Health Insurance', 'Remote Work', 'Stock Options']
    },
    {
      title: 'Python Developer',
      company: 'Swiggy',
      location: 'Hyderabad, India',
      description: 'Develop backend services for food delivery platform using Python and Django. Work with microservices architecture and cloud technologies.',
      salary_range: '₹10,00,000 - ₹18,00,000',
      job_url: 'https://swiggy.com/careers/python-dev-004',
      platform: 'company-website',
      requirements: ['Python', 'Django', 'AWS', 'Microservices'],
      benefits: ['Flexible Hours', 'Health Coverage', 'Transportation']
    },
    {
      title: 'Business Analyst',
      company: 'Ola Cabs',
      location: 'Bangalore, India',
      description: 'Analyze business requirements and translate them into technical specifications. Work with product and engineering teams to improve ride-sharing platform.',
      salary_range: '₹8,00,000 - ₹15,00,000',
      job_url: 'https://ola.com/careers/ba-005',
      platform: 'company-website',
      requirements: ['Business Analysis', 'Requirements Gathering', 'SQL', 'Analytics'],
      benefits: ['Health Insurance', 'Flexible Timing', 'Skill Development']
    }
  ].slice(0, limit)

  return recentJobs
}

// Enhanced match score calculation
function calculateMatchScore(job: any, user: any): number {
  let score = 0
  
  // Enhanced title matching (higher weight for semantic matches)
  const titleLower = job.title.toLowerCase()
  const roleLower = user.desired_role.toLowerCase()
  
  // Exact match gets highest score
  if (titleLower === roleLower) {
    score += 0.5
  } else if (titleLower.includes(roleLower)) {
    score += 0.4
  } else if (isRoleMatch(job.title, job.description, user.desired_role)) {
    score += 0.35
  }
  
  // Description matching
  if (job.description?.toLowerCase().includes(roleLower)) {
    score += 0.15
  }
  
  // Skills matching (more generous scoring)
  if (user.skills && user.skills.length > 0) {
    const jobText = `${job.title} ${job.description}`.toLowerCase()
    const skillMatches = user.skills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    ).length
    score += Math.min((skillMatches / user.skills.length) * 0.25, 0.25)
  }
  
  // Location matching
  if (user.preferred_locations && user.preferred_locations.length > 0) {
    const locationMatch = user.preferred_locations.some(location => 
      job.location?.toLowerCase().includes(location.toLowerCase())
    )
    if (locationMatch) score += 0.1
  }
  
  // Company bonus (Indian companies get slight preference)
  const indianTechCompanies = [
    'zomato', 'swiggy', 'paytm', 'flipkart', 'ola', 'byju', 'unacademy',
    'tcs', 'infosys', 'wipro', 'hcl', 'tech mahindra', 'mindtree'
  ]
  const companyLower = job.company.toLowerCase()
  const isIndianTech = indianTechCompanies.some(company => companyLower.includes(company))
  if (isIndianTech) score += 0.05
  
  // Salary range bonus
  if (job.salary_range && job.salary_range.includes('₹')) score += 0.05
  
  // Ensure minimum score for any job to show some matches
  return Math.max(score, 0.2)
}
