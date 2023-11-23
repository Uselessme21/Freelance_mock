let data = []; 

const itemsPerPage = 4; 
let currentPage = 1;
let token=localStorage.getItem('reqtoken')
if(!token){
    window.location.href='./login.html'
}
document.addEventListener('DOMContentLoaded', () => {


    fetch('https://nervous-calf-earrings.cyclic.app/freelancers')
        .then(response => response.json())
        .then(initialData => {
            data = initialData;
            const freelancersContainer = document.getElementById('freelancersContainer');
            const paginationContainer = document.getElementById('paginationContainer');
            const sortSelect = document.getElementById('sortSelect');
            const filterSelect = document.getElementById('filterSelect');
            const searchInput = document.getElementById('searchInput');

            // Calculate the total number of pages
            const totalPages = Math.ceil(data.length / itemsPerPage);

            // Display the freelancers for the initial page
            displayFreelancers(data.slice(0, itemsPerPage));

            // Create pagination buttons
            createPaginationButtons(totalPages);

            // Create options for sort and filter
            createSortOptions();
            createFilterOptions();

            // Function to display freelancers for a specific page
            function displayFreelancers(freelancers) {
                freelancersContainer.innerHTML = '';

                freelancers.forEach(freelancer => {
                    const card = createFreelancerCard(freelancer);
                    freelancersContainer.appendChild(card);
                });
            }

            // Function to create pagination buttons
            function createPaginationButtons(totalPages) {
                paginationContainer.innerHTML = '';

                for (let i = 1; i <= totalPages; i++) {
                    const button = document.createElement('button');
                    button.textContent = i;
                    button.addEventListener('click', () => {
                        currentPage = i;
                        const start = (currentPage - 1) * itemsPerPage;
                        const end = start + itemsPerPage;
                        displayFreelancers(applyFiltersAndSort(data.slice(start, end)));
                    });

                    paginationContainer.appendChild(button);
                }
            }

            // Function to create a freelancer card
            function createFreelancerCard(freelancer) {
                
                const card = document.createElement('div');
                card.classList.add('freelancer-card');

                // Add profile picture
                const profilePicture = document.createElement('img');
                profilePicture.src = freelancer.profile_picture;
                profilePicture.alt = `${freelancer.name}'s Profile Picture`;
                card.appendChild(profilePicture);

                // Add other freelancer informations
                card.innerHTML += `
                    <h3>${freelancer.name}</h3>
                    <p>Email: ${freelancer.email}</p>
                    <p>Profession: ${freelancer.profession}</p>
                    <p>Skills: ${freelancer.skills.join(', ')}</p>
                    <p>Hourly Rate: $${freelancer.hourly_rate}</p>
                    <p>Status: ${freelancer.isBooked ? 'Booked' : 'Available'}</p>
                    <button onclick="hireFreelancer(${freelancer.id})" ${freelancer.isBooked ? 'disabled' : ''}>Hire</button>
                    <button onclick="deleteFreelancer(${freelancer.id})">Delete</button>
                    <button onclick="editFreelancer(${freelancer.id})">Edit</button>
                `;
                return card;
            }

            // Function to apply filters and sort 
            function applyFiltersAndSort(freelancersData) {
                const filterSelect = document.getElementById('filterSelect');
                const sortSelect = document.getElementById('sortSelect');
                const searchInput = document.getElementById('searchInput');
            
                const selectedFilter = filterSelect.value;
                const selectedSort = sortSelect.value;
                const searchString = searchInput.value.toLowerCase();
            
                // Apply filters
                let filteredData = freelancersData;
                if (selectedFilter !== 'all') {
                    filteredData = filteredData.filter(freelancer => freelancer.profession === selectedFilter);
                }
            
                // Apply search
                filteredData = filteredData.filter(freelancer =>
                    freelancer.name.toLowerCase().includes(searchString)
                );
            
                // Sort data based on selected criteria
                if (selectedSort === 'hourlyRateAsc') {
                    filteredData.sort((a, b) => a.hourly_rate - b.hourly_rate);
                } else if (selectedSort === 'hourlyRateDesc') {
                    filteredData.sort((a, b) => b.hourly_rate - a.hourly_rate);
                }
            
                
                freelancersData = filteredData;
                currentPage = 1; 
             

                return freelancersData;
            }

            
            function createSortOptions() {
                const sortOptions = ['hourlyRateAsc','hourlyRateDesc'];
                sortOptions.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = `${option}`;
                    sortSelect.appendChild(optionElement);
                });

                sortSelect.addEventListener('change', () => {
                    const start = (currentPage - 1) * itemsPerPage;
                    const end = start + itemsPerPage;
                    displayFreelancers(applyFiltersAndSort(data.slice(start, end)));
                });
            }

            // Function to create options for filtering
            function createFilterOptions() {
                const filterOptions = ['all', 'Student', 'Web Developer', 'Graphic Designer', 'Frontend Developer', 'Backend Developer'];
                filterOptions.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option === 'all' ? 'All Professions' : option;
                    filterSelect.appendChild(optionElement);
                });

                filterSelect.addEventListener('change', () => {
                    const start = (currentPage - 1) * itemsPerPage;
                    const end = start + itemsPerPage;
                    displayFreelancers(applyFiltersAndSort(data.slice(start, end)));
                });
            }

            // Function to handle search on input change
            searchInput.addEventListener('input', () => {
                const start = (currentPage - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                displayFreelancers(applyFiltersAndSort(data.slice(start, end)));
            });
        })
        .catch(error => console.error('Error fetching freelancers:', error));
});

// Function to hire a freelancer
window.hireFreelancer = function (freelancerId) {
    const freelancerIndex = data.findIndex(f => f.id === freelancerId);
    if (freelancerIndex !== -1) {
        data[freelancerIndex].isBooked = true;
        updateFreelancerStatus(freelancerId, true);
        displayFreelancers(applyFiltersAndSort(data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)));
    }
};

// Function to delete a freelancer
window.deleteFreelancer = function (freelancerId) {
    const confirmed = confirm('Are you sure you want to delete this freelancer?');
    if (confirmed) {
        const freelancerIndex = data.findIndex(f => f.id === freelancerId);
        if (freelancerIndex !== -1) {
            data.splice(freelancerIndex, 1);
            deleteFreelancerEntry(freelancerId);
            displayFreelancers(applyFiltersAndSort(data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)));
        }
    }
};

// Function to edit a freelancer
window.editFreelancer = function (freelancerId) {
    const freelancerIndex = data.findIndex(f => f.id === freelancerId);
    if (freelancerIndex !== -1) {
        const updatedFreelancer = promptFreelancerInfo(data[freelancerIndex]);
        if (updatedFreelancer) {
            data[freelancerIndex] = updatedFreelancer;
            updateFreelancerEntry(freelancerId, updatedFreelancer);
            displayFreelancers(applyFiltersAndSort(data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)));
        }
    }
};

// Helper function to prompt the admin for updated freelancer information
function promptFreelancerInfo(freelancer) {
    const updatedFreelancer = { ...freelancer };

    // Prompt for updated information
    updatedFreelancer.profession = prompt('Enter updated profession:', freelancer.profession) || freelancer.profession;
    updatedFreelancer.skills = prompt('Enter updated skills (comma-separated):', freelancer.skills.join(', ')).split(',').map(skill => skill.trim()) || freelancer.skills;
    updatedFreelancer.hourly_rate = parseFloat(prompt('Enter updated hourly rate:', freelancer.hourly_rate)) || freelancer.hourly_rate;

    return updatedFreelancer;
}

// Helper function to update the freelancer's booking status in the JSON server
function updateFreelancerStatus(freelancerId, isBooked) {
    fetch(`https://nervous-calf-earrings.cyclic.app/freelancers/${freelancerId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBooked }),
    })
    .then(response => response.json())
    .then(updatedData => console.log('Booking status updated:', updatedData))
    .catch(error => console.error('Error updating booking status:', error));
}

// Helper function to delete the freelancer entry from the JSON server
function deleteFreelancerEntry(freelancerId) {
    fetch(`https://nervous-calf-earrings.cyclic.app/freelancers/${freelancerId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(deletedData => console.log('Freelancer deleted:', deletedData))
    .catch(error => console.error('Error deleting freelancer:', error));
}

// Helper function to update the freelancer's information in the JSON server
function updateFreelancerEntry(freelancerId, updatedFreelancer) {
    fetch(`https://nervous-calf-earrings.cyclic.app/freelancers/${freelancerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFreelancer),
    })
    .then(response => response.json())
    .then(updatedData => console.log('Freelancer updated:', updatedData))
    .catch(error => console.error('Error updating freelancer:', error));
}
