
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyDE5Kat012iF0635eIYMswNtsUDsPf0Wgw",
    authDomain: "meditrack-loki.firebaseapp.com",
    projectId: "meditrack-loki",
    storageBucket: "meditrack-loki.firebasestorage.app",
    messagingSenderId: "905360996991",
    appId: "1:905360996991:web:9f85a8c1130813dc251d4a",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/medicine.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});