document.addEventListener('DOMContentLoaded', (event) => {
    const note = document.getElementById('note');
    const clearButton = document.getElementById('clearButton');
    const printButton = document.getElementById('printButton');
    const downloadButton = document.getElementById('downloadButton');
    const deleteButton = document.getElementById('deleteButton');
    const themeToggleButton = document.getElementById('theme-toggle');

    // Mobile buttons
    const clearButtonMobile = document.getElementById('clearButtonMobile');
    const printButtonMobile = document.getElementById('printButtonMobile');
    const downloadButtonMobile = document.getElementById('downloadButtonMobile');
    const deleteButtonMobile = document.getElementById('deleteButtonMobile');

    let db;

    // Initialize IndexedDB
    const request = indexedDB.open('NoteNookDB', 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore('notes', { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadNote();
    };

    request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.errorCode);
    };

    function saveNoteToIndexedDB(noteContent) {
        if (!db) return; // Ensure db is initialized
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        const noteData = { id: 'note', content: noteContent };
        store.put(noteData);
        transaction.oncomplete = () => {
            console.log('Note saved to IndexedDB');
        };
        transaction.onerror = (event) => {
            console.error('IndexedDB save error:', event.target.errorCode);
        };
    }

    function loadNote() {
        if (!db) return; // Ensure db is initialized
        const transaction = db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        const request = store.get('note');
        request.onsuccess = (event) => {
            if (request.result) {
                note.value = request.result.content;
            }
        };
        request.onerror = (event) => {
            console.error('IndexedDB load error:', event.target.errorCode);
        };
    }

    function deleteNoteFromIndexedDB() {
        if (!db) return; // Ensure db is initialized
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        store.delete('note');
        transaction.oncomplete = () => {
            console.log('Note deleted from IndexedDB');
        };
        transaction.onerror = (event) => {
            console.error('IndexedDB delete error:', event.target.errorCode);
        };
    }

    // Load the saved note from localStorage or IndexedDB
    if (localStorage.getItem('note')) {
        note.value = localStorage.getItem('note');
    } else if (db) {
        loadNote();
    }

    // Auto-save the note to localStorage and IndexedDB as the user types
    note.addEventListener('input', () => {
        const noteContent = note.value;
        localStorage.setItem('note', noteContent);
        if (db) {
            saveNoteToIndexedDB(noteContent);
        }
    });

    // Clear the note and remove it from localStorage and IndexedDB
    function clearNote() {
        note.value = '';
        localStorage.removeItem('note');
        if (db) {
            deleteNoteFromIndexedDB();
        }
        alert('Note cleared!');
    }

    clearButton.addEventListener('click', (event) => {
        event.preventDefault();
        clearNote();
    });

    clearButtonMobile.addEventListener('click', (event) => {
        event.preventDefault();
        clearNote();
    });

    // Delete the note after confirmation
    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (confirm('Are you sure you want to delete the note?')) {
            clearNote();
            alert('Note deleted!');
        }
    });

    deleteButtonMobile.addEventListener('click', (event) => {
        event.preventDefault();
        if (confirm('Are you sure you want to delete the note?')) {
            clearNote();
            alert('Note deleted!');
        }
    });

    // Print the note area only
    printButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.print();
    });

    printButtonMobile.addEventListener('click', (event) => {
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

    downloadButtonMobile.addEventListener('click', async (event) => {
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
