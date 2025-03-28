// app.js
class JobSearchApp {
    constructor() {
        this.jobTitleInput = document.getElementById('jobTitleInput');
        this.locationInput = document.getElementById('locationInput');
        this.experienceSelect = document.getElementById('experienceSelect');
        this.searchButton = document.getElementById('searchButton');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.paginationContainer = document.getElementById('paginationContainer');
        this.prevButton = document.getElementById('prevButton');
        this.nextButton = document.getElementById('nextButton');
        this.pageInfo = document.getElementById('pageInfo');
        this.jobDetailModal = document.getElementById('jobDetailModal');
        this.jobDetailContent = document.getElementById('jobDetailContent');
        this.closeModalButton = document.querySelector('.close-button');

        this.currentPage = 1;
        this.totalPages = 1;

        this.initEventListeners();
    }

    initEventListeners() {
        this.searchButton.addEventListener('click', () => this.searchJobs());
        this.prevButton.addEventListener('click', () => this.changePage(-1));
        this.nextButton.addEventListener('click', () => this.changePage(1));
        this.closeModalButton.addEventListener('click', () => this.closeJobDetailModal());
    }

    showLoadingSpinner() {
        this.loadingSpinner.classList.remove('hidden');
        this.resultsContainer.innerHTML = '';
    }

    hideLoadingSpinner() {
        this.loadingSpinner.classList.add('hidden');
    }

    async searchJobs() {
        const jobTitle = this.jobTitleInput.value.trim();
        const location = this.locationInput.value.trim();
        const experience = this.experienceSelect.value;

        if (!jobTitle) {
            alert('Please enter a job title');
            return;
        }

        this.showLoadingSpinner();

        try {
            const response = await this.fetchJobs(jobTitle, location, experience);
            
            if (response.data && response.data.length > 0) {
                this.displayJobs(response.data);
            } else {
                this.resultsContainer.innerHTML = `<p>No jobs found. Try a different search.</p>`;
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            this.resultsContainer.innerHTML = `<p>Error fetching jobs: ${error.message}</p>`;
        } finally {
            this.hideLoadingSpinner();
        }
    }

    async fetchJobs(jobTitle, location, experience) {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': config.API_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };

        // Construct query with optional location
        let query = jobTitle;
        if (location) {
            query += ` in ${location}`;
        }

        const url = new URL(config.JOBS_BASE_URL);
        url.searchParams.set('query', query);
        url.searchParams.set('page', '1');
        url.searchParams.set('num_pages', '10');

        const response = await fetch(url.toString(), options);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }

        return await response.json();
    }

    displayJobs(jobs) {
        this.resultsContainer.innerHTML = jobs.map(job => `
            <div class="job-card" data-job-id="${job.job_id}">
                <h3>${this.sanitizeHTML(job.job_title)}</h3>
                <p><strong>Company:</strong> ${this.sanitizeHTML(job.employer_name || 'Not specified')}</p>
                <p><strong>Location:</strong> ${this.sanitizeHTML(job.job_city || 'Not specified')}, ${this.sanitizeHTML(job.job_state || '')}</p>
                <p><strong>Salary:</strong> ${this.sanitizeHTML(job.salary_range || 'Not specified')}</p>
            </div>
        `).join('');

        // Add click event to job cards
        document.querySelectorAll('.job-card').forEach(card => {
            card.addEventListener('click', () => this.showJobDetails(card.dataset.jobId));
        });
    }

    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    async showJobDetails(jobId) {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': config.API_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(`https://jsearch.p.rapidapi.com/job-details?job_id=${jobId}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jobDetails = await response.json();
            
            if (!jobDetails.data || jobDetails.data.length === 0) {
                throw new Error('No job details found');
            }

            const job = jobDetails.data[0];

            this.jobDetailContent.innerHTML = `
                <h2>${this.sanitizeHTML(job.job_title)}</h2>
                <p><strong>Company:</strong> ${this.sanitizeHTML(job.employer_name || 'Not specified')}</p>
                <p><strong>Location:</strong> ${this.sanitizeHTML(job.job_city || 'Not specified')}, ${this.sanitizeHTML(job.job_state || '')}</p>
                <p><strong>Job Type:</strong> ${this.sanitizeHTML(job.job_employment_type || 'Not specified')}</p>
                <div><strong>Job Description:</strong> ${this.sanitizeText(job.job_description)}</div>
                <div class="job-apply">
                    ${job.job_apply_link 
                        ? `<a href="${job.job_apply_link}" target="_blank" class="apply-button">Apply Now</a>` 
                        : '<p>No direct application link available</p>'}
                </div>
            `;

            this.jobDetailModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching job details:', error);
            this.jobDetailContent.innerHTML = `<p>Unable to load job details: ${error.message}</p>`;
        }
    }

    sanitizeText(str) {
        // Basic HTML sanitization for description
        if (!str) return 'No description available';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    closeJobDetailModal() {
        this.jobDetailModal.classList.add('hidden');
    }

    changePage(direction) {
        // Placeholder for future pagination implementation
        console.log(`Changing page: ${direction}`);
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new JobSearchApp();
});s