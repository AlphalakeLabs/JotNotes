document.addEventListener('DOMContentLoaded', (event) => {
    const note = document.getElementById('note');
    const clearButton = document.getElementById('clearButton');
    const printButton = document.getElementById('printButton');
    const downloadButton = document.getElementById('downloadButton');
    const themeToggleButton = document.getElementById('theme-toggle');

    // Load the saved note from localStorage
    if (localStorage.getItem('note')) {
        note.value = localStorage.getItem('note');
    }

    // Auto-save the note to localStorage as the user types
    note.addEventListener('input', () => {
        localStorage.setItem('note', note.value);
    });

    // Clear the note and remove it from localStorage
    clearButton.addEventListener('click', (event) => {
        event.preventDefault();
        note.value = '';
        localStorage.removeItem('note');
        alert('Note cleared!');
    });

    // Print the note area only
    printButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.print();
    });

    // Download the note as PDF
    downloadButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(note.value, 10, 10);
        doc.save('note.pdf');
    });

    // Toggle dark theme
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.querySelector('.sidebar').classList.toggle('dark-theme');
        document.querySelector('.content').classList.toggle('dark-theme');
        document.querySelector('textarea').classList.toggle('dark-theme');
    });
});
