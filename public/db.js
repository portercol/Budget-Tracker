// Create a global var for db
let db;

// Create a new request for indexedDB
const request = indexedDB.open('budgetTracker', 1);

// Upon onupgradeneeded, create objectStore
request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore('transaction', { autoIncrement: true });
};

// Upon onsuccess/online, run checkDB function
request.onsuccess = function (event) {
  db = event.target.result;
  if (window.onLine) {
    checkDB();
  }
};

// Upon onerror, log the error
request.onerror = function (event) {
  console.log(event.target.error);
};

// Create function for saving records and adding them to the object store
function saveRecord(record) {
  // create a transaction on the objectStore with readwrite access
  const transaction = db.transaction('transaction', 'readwrite');
  // access the objectStore
  const store = transaction.objectStore('transaction');
  // add record to the store
  store.add(record);
};

// Create function for getting all records, posting them and then clearning them if needed
function checkDB() {
  // create a transaction on the objectStore with readwrite access
  const transaction = db.transaction('transaction', 'readwrite');
  // access the objectStore
  const store = transaction.objectStore('transaction');
  // get all records from the store
  const getAll = store.getAll();

  // If successful, then POST the records
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then(() => {
          //clear indexeddb store after successful POST
          const transaction = db.transaction(['transaction'], 'readwrite');
          // access object store
          const store = transaction.objectStore('transaction');
          // clear all items in object store
          store.clear();
        });
    }
  };
}

// Listen for app when back online
window.addEventListener('online', checkDB);