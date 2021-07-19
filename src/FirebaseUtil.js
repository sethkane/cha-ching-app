import React from 'react';
import firebaseConfig from './firebaseConfig';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';

let db;
let storage;
let firebaseApp;
let firebaseAppAuth;
let providers = { googleProvider: new firebase.auth.GoogleAuthProvider()};

// providers.googleProvider.setCustomParameters({
//   hd: 'hurrikane.com',
// });



const getDb = () => {
	return db;
};

const getStorage = () => {
	return storage;
};

const getFirebaseApp = () => {
	return firebaseApp;
};

const getFirebaseAppAuth = () => {
	return firebaseAppAuth;
};



const init = () => {
	// console.log('Init');
	if (firebase.apps.length) return;
		// console.log('Execute');


		firebaseApp = firebase.initializeApp(firebaseConfig);
		firebaseAppAuth = firebaseApp.auth();
		// console.log(firebaseApp)
		// console.log(firebaseAppAuth)


		db = firebase.firestore();
		storage = firebase.storage();
		// console.log(db)
		// console.log(storage)
};


export default {init, getDb, getStorage, getFirebaseApp, getFirebaseAppAuth, providers} ;