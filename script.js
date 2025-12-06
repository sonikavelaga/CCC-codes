let queue = [];
let printedCount = 0;
const MAX_SIZE = 10;

function updateDisplay() {
    const display = document.getElementById('queueDisplay');
    const sizeSpan = document.getElementById('queueSize');
    
    display.innerHTML = queue.length === 0 
        ? '<p style="color:#999; font-style:italic;">No jobs in queue</p>'
        : queue.map(job => 
            `<div class="job ${job.priority}">${job.id} (${job.pages}pg)</div>`
          ).join('');
    
    sizeSpan.textContent = queue.length;
    
    // Update status
    const status = document.getElementById('status');
    if(queue.length === 0) {
        status.textContent = 'EMPTY';
        status.className = 'status-empty';
    } else if(queue.length === MAX_SIZE) {
        status.textContent = 'FULL';
        status.className = 'status-full';
    } else {
        status.textContent = 'Ready';
        status.className = 'status-ready';
    }
}

function addJob() {
    const id = parseInt(document.getElementById('jobId').value);
    const pages = parseInt(document.getElementById('pages').value);
    const priority = document.getElementById('priority').value;
    
    if(queue.length >= MAX_SIZE) {
        alert('Queue FULL! Cannot add more jobs.');
        return;
    }
    
    queue.push({id, pages, priority});
    document.getElementById('status').textContent = `Added Job ${id}`;
    
    // Animate new job
    updateDisplay();
    
    // Clear inputs
    document.getElementById('jobId').value = '';
    document.getElementById('pages').value = '';
}

function printJob() {
    if(queue.length === 0) {
        alert('Queue EMPTY! No jobs to print.');
        return;
    }
    
    const printedJob = queue.shift();
    printedCount++;
    
    document.getElementById('printedCount').textContent = printedCount;
    document.getElementById('status').textContent = `Printed Job ${printedJob.id}`;
    
    updateDisplay();
}

function resetQueue() {
    queue = [];
    printedCount = 0;
    document.getElementById('printedCount').textContent = '0';
    updateDisplay();
}

// Enter key support
document.addEventListener('keypress', function(e) {
    if(e.key === 'Enter') addJob();
});
