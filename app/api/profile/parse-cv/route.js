import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    console.log('=== CV UPLOAD START ===');
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.id ? `User ID: ${session.user.id}` : 'No session');
    
    if (!session?.user?.id) {
      console.log('ERROR: Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('cv');

    if (!file) {
      console.log('ERROR: No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', file.name, file.type, file.size);

    // Get file content based on file type
    const buffer = await file.arrayBuffer();
    const fileType = file.type;
    let text = '';

    if (fileType === 'application/pdf') {
      // For PDF files
      try {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(Buffer.from(buffer));
        text = pdfData.text;
      } catch (error) {
        console.error('PDF parsing error:', error);
        text = Buffer.from(buffer).toString('utf-8');
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'application/msword') {
      // For DOCX files
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
        text = result.value;
      } catch (error) {
        console.error('DOCX parsing error:', error);
        text = Buffer.from(buffer).toString('utf-8');
      }
    } else {
      // Plain text
      text = Buffer.from(buffer).toString('utf-8');
    }

    console.log('Parsed text length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));

    // Simple text parsing (Phase 1 - basic implementation)
    const parsed = parseCV(text);
    
    console.log('Parsed data:', JSON.stringify(parsed, null, 2));

    // Save parsed data to profile
    console.log('Saving to database for user:', session.user.id);
    const savedProfile = await saveToProfile(session.user.id, parsed);
    
    console.log('Saved profile:', savedProfile ? `ID: ${savedProfile.id}` : 'Failed to save');
    console.log('=== CV UPLOAD SUCCESS ===');

    return NextResponse.json({
      success: true,
      message: 'CV parsed successfully',
      data: parsed,
      profile: savedProfile,
    });
  } catch (error) {
    console.error('=== CV UPLOAD ERROR ===');
    console.error('Error parsing CV:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Failed to parse CV', details: error.message },
      { status: 500 }
    );
  }
}

// Simple CV parsing function
function parseCV(text) {
  const parsed = {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    headline: '',
    summary: '',
    skills: [],
  };

  // Extract email
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) {
    parsed.email = emailMatch[0];
  }

  // Extract phone (multiple formats)
  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    parsed.phone = phoneMatch[0];
  }

  // Extract name (usually first non-empty line)
  const lines = text.split('\n').filter(line => line.trim() && line.trim().length > 2);
  if (lines.length > 0) {
    // Skip lines that look like emails or phones
    const nameLine = lines.find(line => 
      !line.match(/[\w\.-]+@[\w\.-]+\.\w+/) && 
      !line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)
    );
    if (nameLine) {
      parsed.fullName = nameLine.trim().substring(0, 100);
    }
  }

  // Extract location
  const locationMatch = text.match(/(?:location|address|city)[\s:]*([^\n,]+(?:,\s*[A-Z]{2})?)/i);
  if (locationMatch) {
    parsed.location = locationMatch[1].trim();
  } else {
    // Look for city, state patterns
    const cityStateMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}(?:\s+\d{5})?)/);
    if (cityStateMatch) {
      parsed.location = cityStateMatch[0];
    }
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin:)\s*([^\s\n]+)/i);
  if (linkedinMatch) {
    parsed.linkedin = linkedinMatch[0].includes('http') ? linkedinMatch[0] : `https://linkedin.com/in/${linkedinMatch[1]}`;
  }

  // Extract GitHub
  const githubMatch = text.match(/(?:github\.com\/|github:)\s*([^\s\n]+)/i);
  if (githubMatch) {
    parsed.github = githubMatch[0].includes('http') ? githubMatch[0] : `https://github.com/${githubMatch[1]}`;
  }

  // Extract website/portfolio
  const websiteMatch = text.match(/(?:website|portfolio)[\s:]*((https?:\/\/[^\s\n]+)|([a-z0-9-]+\.[a-z]{2,}))/i);
  if (websiteMatch) {
    parsed.website = websiteMatch[1];
  }

  // Extract skills (look for common skill section patterns)
  const skillKeywords = /(?:skills?|technical\s+skills?|technologies?|expertise)[\s:]*([^\n]+(?:\n(?!(?:education|experience|work|projects?))[^\n]+)*)/i;
  const skillMatch = text.match(skillKeywords);
  if (skillMatch) {
    const skillsText = skillMatch[1];
    const skillsList = skillsText
      .split(/[,;•|\n]/)
      .map(s => s.trim())
      .filter(s => s && s.length > 2 && s.length < 50 && !s.match(/^\d+$/));
    
    parsed.skills = skillsList.slice(0, 30); // Limit to 30 skills
  }

  // Extract summary/objective
  const summaryKeywords = /(?:summary|objective|profile|about\s+me)[\s:]*([^\n]+(?:\n(?!(?:education|experience|work|projects?|skills?))[^\n]+)*)/i;
  const summaryMatch = text.match(summaryKeywords);
  if (summaryMatch) {
    let summary = summaryMatch[1].trim();
    // Limit summary to 500 characters
    summary = summary.substring(0, 500);
    parsed.summary = summary;
  }

  return parsed;
}

// Save parsed data to database
async function saveToProfile(userId, data) {
  console.log('saveToProfile called with userId:', userId);
  console.log('Data to save:', data);
  
  // Check if profile exists
  let profile = await prisma.profile.findUnique({
    where: { userId },
  });

  console.log('Existing profile:', profile ? `Found ID: ${profile.id}` : 'Not found');

  const profileData = {
    fullName: data.fullName || undefined,
    phone: data.phone || undefined,
    location: data.location || undefined,
    linkedin: data.linkedin || undefined,
    github: data.github || undefined,
    website: data.website || undefined,
    headline: data.headline || undefined,
    summary: data.summary || undefined,
  };

  // Remove undefined values
  Object.keys(profileData).forEach(key => 
    profileData[key] === undefined && delete profileData[key]
  );

  console.log('Profile data after cleanup:', profileData);

  if (profile) {
    // Update existing profile (only update if new value exists)
    const updateData = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key] && (!profile[key] || profile[key].trim() === '')) {
        updateData[key] = profileData[key];
      }
    });

    console.log('Update data:', updateData);

    if (Object.keys(updateData).length > 0) {
      console.log('Updating profile...');
      profile = await prisma.profile.update({
        where: { userId },
        data: updateData,
      });
      console.log('Profile updated:', profile.id);
    } else {
      console.log('No updates needed - all fields already filled');
    }
  } else {
    // Create new profile
    console.log('Creating new profile...');
    profile = await prisma.profile.create({
      data: {
        userId,
        fullName: data.fullName || 'Unknown',
        ...profileData,
      },
    });
    console.log('Profile created:', profile.id);
  }

  // Add skills if found
  if (data.skills && data.skills.length > 0) {
    console.log(`Processing ${data.skills.length} skills...`);
    // Get existing skills to avoid duplicates
    const existingSkills = await prisma.skill.findMany({
      where: { profileId: profile.id },
    });
    
    console.log(`Found ${existingSkills.length} existing skills`);
    const existingSkillNames = existingSkills.map(s => s.name.toLowerCase());

    let skillsAdded = 0;
    for (let i = 0; i < Math.min(data.skills.length, 30); i++) {
      const skillName = data.skills[i];
      
      // Skip if skill already exists
      if (existingSkillNames.includes(skillName.toLowerCase())) {
        console.log(`Skill already exists: ${skillName}`);
        continue;
      }

      try {
        await prisma.skill.create({
          data: {
            profileId: profile.id,
            name: skillName,
            category: 'Technical',
            level: 3,
            order: existingSkills.length + i,
          },
        });
        skillsAdded++;
        console.log(`Added skill: ${skillName}`);
      } catch (error) {
        // Skip if error (e.g., duplicate)
        console.log('Error creating skill:', skillName, error.message);
      }
    }
    console.log(`Total skills added: ${skillsAdded}`);
  }

  console.log('saveToProfile completed successfully');
  return profile;
}
