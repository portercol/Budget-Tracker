// Create a global var for db
let db;

// Create a new request for indexedDB
const request = indexedDB.open('budgetTracker', 1);

// After onupgradeneeded, open an objectStore
request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore('transaction', { autoIncrement: true });
};

// Upon onsuccess, run a potential function for checking the database
request.onsuccess = function (event) {
  db = event.target.result;
};

// When/IF error, log the error
request.onerror = function (event) {
  console.log(event.target.error);
};

// Create function for saving records if/when transaction is made and/or fails
function saveRecord(record) {
  // create transaction on the objectStore with readwrite access
  const transaction = db.transaction('transaction', 'readwrite');
  // getting access to the objectStore
  const store = transaction.objectStore('transaction');
  // adding the record to the store
  store.add(record);
};