// Function to retrieve assigned complaints for a police user
async function getAssignedComplaints(userId) {
  try {
    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }

    // API endpoint URL
    const apiUrl = `https://blockevid3-0-bc.onrender.com/api/complaints/assigned?user_id=${userId}`;
    
    // Make API call
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    
    return data;
    
  } catch (error) {
    console.error('Error fetching assigned complaints:', error);
    throw error;
  }
}

// Alternative version with more detailed response handling
async function getAssignedComplaintsDetailed(userId) {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required',
        data: null
      };
    }

    const apiUrl = `https://blockevid3-0-bc.onrender.com/api/complaints/assigned?user_id=${userId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        complaints: data.data || data,
        count: data.count || (data.data ? data.data.length : 0),
        message: 'Complaints retrieved successfully'
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch complaints',
        data: null
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error.message}`,
      data: null
    };
  }
}

// Usage examples:

// Basic usage
async function example1() {
  try {
    const userId = '6897883a458399a5c1f2350c';
    const result = await getAssignedComplaints(userId);
    console.log('Assigned complaints:', result);
  } catch (error) {
    console.error('Failed to get complaints:', error.message);
  }
}

// Detailed usage with error handling
async function example2() {
  const userId = '6897883a458399a5c1f2350c';
  const result = await getAssignedComplaintsDetailed(userId);
  
  if (result.success) {
    console.log(`Found ${result.count} assigned complaints:`);
    result.complaints.forEach((complaint, index) => {
      console.log(`${index + 1}. ${complaint.title} - Status: ${complaint.status}`);
    });
  } else {
    console.log('Error:', result.message);
  }
}

// Function to display complaints in HTML (for web applications)
async function displayAssignedComplaints(userId, containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error('Container element not found');
    return;
  }
  
  // Show loading state
  container.innerHTML = '<p>Loading assigned complaints...</p>';
  
  try {
    const result = await getAssignedComplaintsDetailed(userId);
    
    if (result.success && result.complaints.length > 0) {
      let html = `<h3>Assigned Complaints (${result.count})</h3><ul>`;
      
      result.complaints.forEach(complaint => {
        html += `
          <li>
            <strong>${complaint.title}</strong><br>
            <small>ID: ${complaint.complaintId}</small><br>
            <small>Type: ${complaint.type}</small><br>
            <small>Location: ${complaint.location}</small><br>
            <small>Date: ${complaint.date}</small><br>
            <small>Status: ${complaint.status}</small><br>
            <p>${complaint.description}</p>
            <hr>
          </li>
        `;
      });
      
      html += '</ul>';
      container.innerHTML = html;
    } else if (result.success && result.complaints.length === 0) {
      container.innerHTML = '<p>No assigned complaints found.</p>';
    } else {
      container.innerHTML = `<p>Error: ${result.message}</p>`;
    }
  } catch (error) {
    container.innerHTML = `<p>Error loading complaints: ${error.message}</p>`;
  }
}

// Export functions for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getAssignedComplaints,
    getAssignedComplaintsDetailed,
    displayAssignedComplaints
  };
}