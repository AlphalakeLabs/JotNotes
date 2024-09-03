document.addEventListener('DOMContentLoaded', () => {
    let notesData = JSON.parse(localStorage.getItem('notesData')) || {};  // Load notes from localStorage or initialize an empty object
    let currentPageTitle = null;  // Track the current page

    const addPageButton = document.getElementById('addPageButton');
    const pagesContainer = document.getElementById('pagesContainer');
    const noteTextarea = document.getElementById('note');

    function showTextarea() {
        noteTextarea.classList.remove('hidden');
        noteTextarea.classList.add('visible');
    }

    function hideTextarea() {
        noteTextarea.classList.remove('visible');
        noteTextarea.classList.add('hidden');
    }

    function saveNotesToLocalStorage() {
        try {
            const notesDataStr = JSON.stringify(notesData);
            if (notesDataStr.length < 5000000) {  // Check if data is under 5MB
                localStorage.setItem('notesData', notesDataStr);
            } else {
                alert('Note data is too large to save. Consider reducing the size.');
            }
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Local storage quota exceeded. Please clear some data.');
            }
        }
    }
    
    function loadPages() {
        pagesContainer.innerHTML = '';
        for (const pageTitle in notesData) {
            createPageButton(pageTitle);
        }
    }

    function createPageButton(pageTitle) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('page-button');
        pageButton.textContent = pageTitle;
        pageButton.draggable = true; // **Newly added: Make the page buttons draggable**

        // **Newly added: Add dragstart event listener**
        pageButton.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', pageTitle);
            e.target.classList.add('dragging');
        });

        // **Newly added: Add dragend event listener**
        pageButton.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });

        pageButton.addEventListener('click', () => {
            saveCurrentNote(); // Save the current note before switching
            loadNoteFromMemory(pageTitle);
            showTextarea();  // Show the textarea when a note is selected
        });

        pagesContainer.appendChild(pageButton);
    }

    // **Newly added: Handle dragover event and reorder the page buttons**
    pagesContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(pagesContainer, e.clientY);
        const draggingElement = document.querySelector('.dragging');
        if (afterElement == null) {
            pagesContainer.appendChild(draggingElement);
        } else {
            pagesContainer.insertBefore(draggingElement, afterElement);
        }
    });

    // **Newly added: Determine the element to insert the dragged element after**
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.page-button:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    addPageButton.addEventListener('click', () => {
        const title = prompt('Enter a title for the new page:');
        if (title) {
            saveCurrentNote(); // Save the current note before creating a new page
            notesData[title] = '';  // Create a new empty page in memory
            saveNotesToLocalStorage(); // Save notes to localStorage
            createPageButton(title);
            noteTextarea.value = ''; // Clear the textarea for the new page
            currentPageTitle = title;  // Set the new page as the current page
            showTextarea(); // Show the textarea for the new page
        }
    });

    function saveNoteToMemory(pageTitle, noteContent) {
        if (pageTitle) {
            notesData[pageTitle] = noteContent;
            saveNotesToLocalStorage(); // Save notes to localStorage
        }
    }

    function loadNoteFromMemory(pageTitle) {
        if (pageTitle in notesData) {
            noteTextarea.value = notesData[pageTitle];
            currentPageTitle = pageTitle; // Set the loaded page as the current page
        } else {
            noteTextarea.value = ''; // Clear the textarea if no content is found
        }
    }

    function saveCurrentNote() {
        if (currentPageTitle) {
            saveNoteToMemory(currentPageTitle, noteTextarea.value);
        }
    }

    noteTextarea.addEventListener('input', () => {
        saveCurrentNote(); // Save the note as the user types
    });

    const themeToggleButton = document.getElementById('theme-toggle');
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.querySelector('.sidebar').classList.toggle('dark-theme');
        document.querySelector('.content').classList.toggle('dark-theme');
        document.querySelector('textarea').classList.toggle('dark-theme');
        document.querySelector('.sidebar-right').classList.toggle('dark-theme');
        document.querySelector('.sidebar2').classList.toggle('dark-theme');
        document.getElementById('addPageButton').classList.toggle('dark-theme');
        document.getElementById('pagesContainer').classList.toggle('dark-theme');
    
        // Apply dark-theme to all page-button elements
        const pageButtons = document.querySelectorAll('.page-button');
        pageButtons.forEach(button => {
            button.classList.toggle('dark-theme');
        });
    });

    // Initialize by loading existing pages
    loadPages();

    document.getElementById('clearButton').addEventListener('click', () => {
        noteTextarea.value = '';
    });
    document.getElementById('clearButtonMobile').addEventListener('click', () => {
        noteTextarea.value = '';
    });

    // Print note
    document.getElementById('printButton').addEventListener('click', () => {
        window.print();
    });
    document.getElementById('printButtonMobile').addEventListener('click', () => {
        window.print();
    });

    // Download as PDF
    document.getElementById('downloadButton').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const text = noteTextarea.value;
        
        // Define margins and page size
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;
        const pageHeight = doc.internal.pageSize.getHeight() - 2 * margin;
        
        // Split the text into lines that fit within the page width
        const lines = doc.splitTextToSize(text, pageWidth);
        
        let y = margin; // Initial vertical position
        
        // Add text to the PDF, handling pagination
        lines.forEach((line, index) => {
            if (y + 10 > pageHeight) { // Check if adding a line would exceed the page height
                doc.addPage();
                y = margin; // Reset vertical position for new page
            }
            doc.text(line, margin, y);
            y += 10; // Increment vertical position for next line
        });
    
        doc.save('note.pdf');
    });
    
    document.getElementById('downloadButtonMobile').addEventListener('click', () => {
        const doc = new jsPDF();
        doc.text(noteTextarea.value, 10, 10);
        doc.save('note.pdf');
    });

    // Delete note
    document.getElementById('deleteButton').addEventListener('click', () => {
        if (currentPageTitle && confirm('Are you sure you want to delete this note?')) {
            delete notesData[currentPageTitle]; // Remove note from memory
            saveNotesToLocalStorage(); // Save updated notes to localStorage
            currentPageTitle = null; // Clear current page title
            hideTextarea(); // Hide textarea if no page is selected
            noteTextarea.value = ''; // Clear textarea
            loadPages(); // Reload pages to reflect changes
        }
    });
    document.getElementById('deleteButtonMobile').addEventListener('click', () => {
        if (currentPageTitle && confirm('Are you sure you want to delete this note?')) {
            delete notesData[currentPageTitle]; // Remove note from memory
            saveNotesToLocalStorage(); // Save updated notes to localStorage
            currentPageTitle = null; // Clear current page title
            hideTextarea(); // Hide textarea if no page is selected
            noteTextarea.value = ''; // Clear textarea
            loadPages(); // Reload pages to reflect changes
        }
    });

    const shareButtons = {
        whatsapp: document.getElementById('whatsapp'),
        reddit: document.getElementById('reddit'),
        copy: document.getElementById('copy'),
        messenger: document.getElementById('messenger'),
        email: document.getElementById('email'),
        sms: document.getElementById('sms'),
        twitter: document.getElementById('twitter'),
        telegram: document.getElementById('telegram')
    };

    function shareToApp(baseURL) {
        const text = encodeURIComponent(noteTextarea.value.trim());
        window.open(baseURL + text, '_blank');
    }
    
    shareButtons.whatsapp.addEventListener('click', () => shareToApp('https://wa.me/?text='));
    shareButtons.reddit.addEventListener('click', () => shareToApp('https://www.reddit.com/submit?url=&title='));
    shareButtons.copy.addEventListener('click', () => {
        navigator.clipboard.writeText(noteTextarea.value.trim()).then(() => {
            alert('Text copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy text: ' + err);
        });
    });
    shareButtons.messenger.addEventListener('click', () => shareToApp('https://www.messenger.com/t/?text='));
    shareButtons.email.addEventListener('click', () => shareToApp('mailto:?subject=Note&body='));
    shareButtons.sms.addEventListener('click', () => shareToApp('sms:?body='));
    shareButtons.twitter.addEventListener('click', () => shareToApp('https://twitter.com/intent/tweet?text='));
    shareButtons.telegram.addEventListener('click', () => shareToApp('https://t.me/share/url?url=&text='));

    const introMessage = document.getElementById('introMessage');
    const note = document.getElementById('note');

    function showTextarea() {
        introMessage.classList.add('hidden');
        noteTextarea.classList.remove('hidden');
        noteTextarea.classList.add('visible');
    }

    function hideTextarea() {
        noteTextarea.classList.remove('visible');
        noteTextarea.classList.add('hidden');
    }

    // Function calls and event listeners
    document.querySelectorAll('.page-button').forEach(button => {
        button.addEventListener('click', showTextarea);
    });

    // Initialize pages and textarea
    loadPages();

});
