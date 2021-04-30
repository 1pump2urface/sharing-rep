import * as firebase from 'firebase'
require ("@firebase/firestore")
  // Your web app's Firebase configuration
    // Your web app's Firebase configuration
    var firebaseConfig = {
      apiKey: "AIzaSyCy3TpPZIPGOkutC9JF13530McAZTNNCM4",
      authDomain: "library-wireless.firebaseapp.com",
      projectId: "library-wireless",
      storageBucket: "library-wireless.appspot.com",
      messagingSenderId: "6573865988",
      appId: "1:6573865988:web:cfbd693d7b330894374951"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();