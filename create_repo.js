const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Load token from .env file
let token = '';
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GITHUB_TOKEN\s*=\s*(.*)/);
  if (match && match[1]) {
    token = match[1].trim();
  }
}

if (!token) {
  console.error('Error: GITHUB_TOKEN not found in your root .env file.');
  console.log('Please create a file named .env in the workspace root and add:');
  console.log('GITHUB_TOKEN=your_personal_access_token_here\n');
  process.exit(1);
}

const repoName = 'AlphaChatGPT';
const description = 'Think Faster. Build Smarter. Premium AI Chatbot built with React 19, Vite, and Node.js';

console.log(`Creating GitHub repository "${repoName}"...`);

const data = JSON.stringify({
  name: repoName,
  description: description,
  private: true, // Set to false if you want it public
  auto_init: false
});

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/user/repos',
  method: 'POST',
  headers: {
    'Authorization': `token ${token}`,
    'User-Agent': 'NodeJS-Repo-Automator',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  
  res.on('end', () => {
    const response = JSON.parse(body);
    
    if (res.statusCode === 201) {
      console.log(`Success: Repository created on GitHub!`);
      console.log(`Remote URL: ${response.clone_url}`);
      
      linkAndPush(response.clone_url);
    } else {
      console.error(`Error (${res.statusCode}): ${response.message}`);
      if (response.errors) {
        console.error(response.errors);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.write(data);
req.end();

// 2. Link local Git repository and push
function linkAndPush(cloneUrl) {
  try {
    console.log('Linking local repository to GitHub remote...');
    
    // Add remote origin (remove old one first if exists)
    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch (e) {}
    
    execSync(`git remote add origin ${cloneUrl}`);
    console.log('Remote origin linked.');
    
    console.log('Pushing local commits to main branch...');
    execSync('git push -u origin main', { stdio: 'inherit' });
    
    console.log('\n=============================================');
    console.log('🎉 Automation Completed Successfully! 🎉');
    console.log(`Repository is live at: ${cloneUrl.replace('.git', '')}`);
    console.log('=============================================');
  } catch (error) {
    console.error('Git execution failed:', error.message);
  }
}
