let db;
let budgetVersion;

const request = indexedDB.open("BudgetDb", budgetVersion || 21);

request.onupgradeneeded = (event) => {
  console.log('Upgrade needed in IndexDb');

  const { oldVersion } = event;
  const newVersion = event.newVersion || db.version;
  
  console.log(`DB updated from version ${oldVersion} to ${newVersion}`);

  db = event.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', {autoIncremenet: true });
  }
};


request.onerror = event => {
  console.log(`Whoops! ${event.target.errorCode}`);
};

const checkDatabase = () => {
  console.log ('check db invoked');

let transaction = db.transaction(['BudgetStore'], "readwrite");

const store = transaction.objectStore('BudgetStore');

const getAll = store.getAll();

getAll.onsuccess = () => {
  if (getAll.result.length > 0) {
    fetch('/api/transaction/bulk', {
      method: 'POST',
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: 'application/json, text/plain, */*', 'Content-Type' : 'application/json',
      }
    })
    .then((response) => response.json())
    .then((res) => {
      if (res.length !== 0) {
        transaction = db.transaction(['BudgetStore'], 'readwrite');

        const currentStore = transaction.objectStore('BudgetStore');

        currentStore.clear();
        console.log('Clearing Store!');
      }
    })
  }
}



}

request.onsuccess = (event) => {
  console.log('success');
  db = event.target.result;

  if (navigator.onLine) {
    console.log('Backend Online');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('save record invoked');

  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  const store = transaction.objectStore('BudgetStore');

  store.add(record);
};

window.addEventListener('online', checkDatabase);