document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const noteTextarea = document.getElementById('note');

    // Clear note
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
        const doc = new jsPDF();
        doc.text(noteTextarea.value, 10, 10);
        doc.save('note.pdf');
    });
    document.getElementById('downloadButtonMobile').addEventListener('click', () => {
        const doc = new jsPDF();
        doc.text(noteTextarea.value, 10, 10);
        doc.save('note.pdf');
    });

    // Delete note
    document.getElementById('deleteButton').addEventListener('click', () => {
        noteTextarea.value = '';
    });
    document.getElementById('deleteButtonMobile').addEventListener('click', () => {
        noteTextarea.value = '';
    });

    // Redirect based on screen size
    function redirectBasedOnScreenSize() {
        if (window.innerWidth <= 768) {
            window.location.href = 'indexmobile.html';
        }
    }

    window.onload = redirectBasedOnScreenSize;
    window.onresize = redirectBasedOnScreenSize; // Handle resizing
});

document.addEventListener('DOMContentLoaded', () => {
    const note = document.getElementById('note');

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
        const text = encodeURIComponent(note.value.trim());
        window.open(baseURL + text, '_blank');
    }
    
    shareButtons.whatsapp.addEventListener('click', () => shareToApp('https://wa.me/?text='));
    shareButtons.reddit.addEventListener('click', () => shareToApp('https://www.reddit.com/submit?url=&title='));
    shareButtons.copy.addEventListener('click', () => {
        navigator.clipboard.writeText(note.value.trim()).then(() => {
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

    note.addEventListener('input', () => {
        saveNoteToIndexedDB(note.value);
    });

    document.getElementById('deleteButton').addEventListener('click', () => {
        deleteNoteFromIndexedDB();
    });

    const themeToggleButton = document.getElementById('theme-toggle'); // Define themeToggleButton
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.querySelector('.sidebar').classList.toggle('dark-theme');
        document.querySelector('.content').classList.toggle('dark-theme');
        document.querySelector('textarea').classList.toggle('dark-theme');
        document.querySelector('.sidebar-right').classList.toggle('dark-theme'); // Fixed selector
    });
});
