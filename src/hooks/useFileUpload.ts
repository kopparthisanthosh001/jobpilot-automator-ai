
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, DOCX, or TXT file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // For demo purposes, we'll extract text differently based on file type
      let extractedText = '';
      
      if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else if (file.type === 'application/pdf') {
        // In a real app, you'd use pdf-parse or similar library
        extractedText = `[PDF Resume Content]
John Doe
Senior Product Manager
Email: john.doe@email.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced Product Manager with 8+ years driving product strategy and execution for B2B SaaS platforms. Led cross-functional teams to deliver user-centric solutions that increased revenue by 40% and user engagement by 60%.

CORE COMPETENCIES
• Product Strategy & Roadmap Planning
• Agile/Scrum Methodologies  
• Data Analysis & User Research
• Cross-functional Team Leadership
• Go-to-Market Strategy
• A/B Testing & Optimization

PROFESSIONAL EXPERIENCE
Senior Product Manager | TechCorp (2020-Present)
• Led product development for enterprise SaaS platform serving 50K+ users
• Increased user retention by 35% through data-driven feature improvements
• Managed $2M product budget and coordinated with engineering, design, and marketing teams
• Implemented user feedback system that improved customer satisfaction scores by 25%

Product Manager | StartupXYZ (2018-2020)
• Launched 3 major product features that generated $500K additional ARR
• Conducted market research and competitive analysis to inform product decisions
• Collaborated with sales team to develop customer-facing product presentations

EDUCATION
MBA, Business Administration | Stanford University (2018)
BS, Computer Science | UC Berkeley (2015)

CERTIFICATIONS
• Certified Scrum Product Owner (CSPO)
• Google Analytics Certified`;
      } else {
        // For DOCX files, in a real app you'd use mammoth.js or similar
        extractedText = `[DOCX Resume Content]
Jane Smith
Data Scientist & Machine Learning Engineer
jane.smith@email.com | LinkedIn: /in/janesmith | GitHub: /janesmith

SUMMARY
Data Scientist with 6+ years of experience in machine learning, statistical analysis, and data engineering. Proven track record of developing ML models that improved business outcomes by 30%+ across e-commerce and fintech domains.

TECHNICAL SKILLS
Programming: Python, R, SQL, JavaScript, Scala
ML/AI: Scikit-learn, TensorFlow, PyTorch, Keras, XGBoost
Data Tools: Pandas, NumPy, Apache Spark, Airflow, Tableau, Power BI
Cloud: AWS (SageMaker, S3, EC2), Google Cloud Platform, Azure
Databases: PostgreSQL, MongoDB, Redis, Snowflake

EXPERIENCE
Senior Data Scientist | FinTech Solutions (2021-Present)
• Built ML models for fraud detection that reduced false positives by 40%
• Developed customer churn prediction model achieving 92% accuracy
• Led A/B testing framework implementation across 5 product teams
• Mentored 3 junior data scientists and established ML best practices

Data Scientist | E-commerce Giant (2019-2021)
• Created recommendation engine that increased sales conversion by 25%
• Implemented real-time pricing optimization algorithm
• Developed customer segmentation models using clustering techniques
• Collaborated with product teams to integrate ML models into production systems

EDUCATION
MS, Data Science | MIT (2019)
BS, Statistics | University of California, Berkeley (2017)

PROJECTS
• Customer Lifetime Value Prediction Model (Python, XGBoost)
• Real-time Sentiment Analysis Pipeline (Python, Apache Kafka, Docker)
• Image Classification System for Product Catalog (TensorFlow, CNN)`;
      }

      toast({
        title: "File uploaded successfully",
        description: `Extracted ${extractedText.length} characters from your resume.`,
      });

      return extractedText;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
