const fetch = require('node-fetch');

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admintest@msruas.ac.in',
  password: 'AdminTest123@'
};

const BASE_URL = 'http://localhost:5000';
let sessionCookie = '';

// Test utilities
const log = (message, data = '') => {
  console.log(`✓ ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logError = (message, error) => {
  console.error(`✗ ${message}:`, error.message || error);
};

const makeRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(sessionCookie && { 'Cookie': sessionCookie })
    },
    credentials: 'include'
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // Extract session cookie from login response
  if (endpoint === '/api/auth/login' && response.ok) {
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0]; // Extract just the session cookie
    }
  }

  return response;
};

// Test functions
async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login...');
  
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });

    if (response.ok) {
      const data = await response.json();
      log('Admin login successful', { user: data.user.email, role: data.user.role });
      return true;
    } else {
      const error = await response.json();
      logError('Admin login failed', error);
      return false;
    }
  } catch (error) {
    logError('Admin login request failed', error);
    return false;
  }
}

async function testAdminAuth() {
  console.log('\n👤 Testing Admin Authentication...');
  
  try {
    const response = await makeRequest('/api/auth/me');
    
    if (response.ok) {
      const data = await response.json();
      log('Admin authentication verified', { 
        email: data.user.email, 
        role: data.user.role,
        isAdmin: data.user.role === 'admin'
      });
      return data.user.role === 'admin';
    } else {
      const error = await response.json();
      logError('Admin authentication failed', error);
      return false;
    }
  } catch (error) {
    logError('Admin auth request failed', error);
    return false;
  }
}

async function testAdminStats() {
  console.log('\n📊 Testing Admin Stats API...');
  
  try {
    const response = await makeRequest('/api/admin/stats');
    
    if (response.ok) {
      const data = await response.json();
      log('Admin stats retrieved successfully', data.stats);
      
      // Verify stats structure
      const requiredFields = ['totalStudents', 'totalJobs', 'totalApplications', 'activeJobs', 'placedStudents', 'pendingApplications'];
      const hasAllFields = requiredFields.every(field => typeof data.stats[field] === 'number');
      
      if (hasAllFields) {
        log('Stats structure is valid');
        return true;
      } else {
        logError('Stats structure is invalid', 'Missing required fields');
        return false;
      }
    } else {
      const error = await response.json();
      logError('Admin stats request failed', error);
      return false;
    }
  } catch (error) {
    logError('Admin stats request failed', error);
    return false;
  }
}

async function testAdminActivities() {
  console.log('\n📋 Testing Admin Activities API...');
  
  try {
    const response = await makeRequest('/api/admin/activities');
    
    if (response.ok) {
      const data = await response.json();
      log('Admin activities retrieved successfully', { 
        count: data.activities.length,
        sample: data.activities.slice(0, 2)
      });
      return true;
    } else {
      const error = await response.json();
      logError('Admin activities request failed', error);
      return false;
    }
  } catch (error) {
    logError('Admin activities request failed', error);
    return false;
  }
}

async function testJobCreation() {
  console.log('\n💼 Testing Job Creation...');
  
  const testJob = {
    title: 'Test Software Engineer Position',
    company: 'Test Company Inc.',
    description: 'This is a test job posting for verification purposes.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Send as ISO string like frontend
  };

  try {
    const response = await makeRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(testJob)
    });

    if (response.ok) {
      const data = await response.json();
      log('Job created successfully', { 
        id: data.job.id,
        title: data.job.title,
        company: data.job.company
      });
      return data.job.id;
    } else {
      const error = await response.json();
      logError('Job creation failed', error);
      return null;
    }
  } catch (error) {
    logError('Job creation request failed', error);
    return null;
  }
}

async function testJobRetrieval() {
  console.log('\n📋 Testing Job Retrieval...');
  
  try {
    const response = await makeRequest('/api/jobs');
    
    if (response.ok) {
      const data = await response.json();
      log('Jobs retrieved successfully', { 
        count: data.jobs.length,
        sample: data.jobs.slice(0, 2).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          isActive: job.isActive
        }))
      });
      return data.jobs;
    } else {
      const error = await response.json();
      logError('Job retrieval failed', error);
      return [];
    }
  } catch (error) {
    logError('Job retrieval request failed', error);
    return [];
  }
}

async function testJobUpdate(jobId) {
  if (!jobId) {
    console.log('\n⚠️  Skipping job update test - no job ID available');
    return false;
  }

  console.log('\n✏️  Testing Job Update...');
  
  try {
    const updateData = {
      isActive: false
    };

    const response = await makeRequest(`/api/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      const data = await response.json();
      log('Job updated successfully', { 
        id: data.job.id,
        isActive: data.job.isActive
      });
      return true;
    } else {
      const error = await response.json();
      logError('Job update failed', error);
      return false;
    }
  } catch (error) {
    logError('Job update request failed', error);
    return false;
  }
}

async function testApplicationStats() {
  console.log('\n📊 Testing Application Stats API...');
  
  try {
    const response = await makeRequest('/api/admin/applications/stats');
    
    if (response.ok) {
      const data = await response.json();
      log('Application stats retrieved successfully', data.stats);
      return true;
    } else {
      const error = await response.json();
      logError('Application stats request failed', error);
      return false;
    }
  } catch (error) {
    logError('Application stats request failed', error);
    return false;
  }
}

async function testStudentsAPI() {
  console.log('\n👥 Testing Students API...');
  
  try {
    const response = await makeRequest('/api/admin/students');
    
    if (response.ok) {
      const data = await response.json();
      log('Students data retrieved successfully', { 
        count: data.students.length,
        sample: data.students.slice(0, 2).map(student => ({
          id: student.id,
          firstName: student.firstName,
          branch: student.branch,
          collegeEmail: student.collegeEmail
        }))
      });
      return true;
    } else {
      const error = await response.json();
      logError('Students API request failed', error);
      return false;
    }
  } catch (error) {
    logError('Students API request failed', error);
    return false;
  }
}

async function testJobDeletion(jobId) {
  if (!jobId) {
    console.log('\n⚠️  Skipping job deletion test - no job ID available');
    return false;
  }

  console.log('\n🗑️  Testing Job Deletion...');
  
  try {
    const response = await makeRequest(`/api/jobs/${jobId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const data = await response.json();
      log('Job deleted successfully', data);
      return true;
    } else {
      const error = await response.json();
      logError('Job deletion failed', error);
      return false;
    }
  } catch (error) {
    logError('Job deletion request failed', error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting CampusConnect Admin API Tests...');
  console.log('='.repeat(50));

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Admin Authentication', fn: testAdminAuth },
    { name: 'Admin Stats API', fn: testAdminStats },
    { name: 'Admin Activities API', fn: testAdminActivities },
    { name: 'Application Stats API', fn: testApplicationStats },
    { name: 'Students API', fn: testStudentsAPI },
    { name: 'Job Creation', fn: testJobCreation },
    { name: 'Job Retrieval', fn: testJobRetrieval }
  ];

  let createdJobId = null;

  for (const test of tests) {
    results.total++;
    try {
      let result;
      if (test.name === 'Job Creation') {
        result = await test.fn();
        createdJobId = result;
        result = !!result;
      } else {
        result = await test.fn();
      }

      if (result) {
        results.passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        results.failed++;
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      results.failed++;
      console.log(`❌ ${test.name} - ERROR:`, error.message);
    }
  }

  // Test job update and deletion if we have a job ID
  if (createdJobId) {
    results.total += 2;
    
    const updateResult = await testJobUpdate(createdJobId);
    if (updateResult) {
      results.passed++;
      console.log(`✅ Job Update - PASSED`);
    } else {
      results.failed++;
      console.log(`❌ Job Update - FAILED`);
    }

    const deleteResult = await testJobDeletion(createdJobId);
    if (deleteResult) {
      results.passed++;
      console.log(`✅ Job Deletion - PASSED`);
    } else {
      results.failed++;
      console.log(`❌ Job Deletion - FAILED`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Admin functionality is working perfectly!');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed. Please check the errors above.`);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
