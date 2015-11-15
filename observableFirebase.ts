// Angular 2 Toolkit - Firebase Observables
// Copyright 2015 Oasis Digital - http://oasisdigital.com
//     written by Kyle Cordes - http://kylecordes.com
// November 2015

// This is a first draft at two different translations of a Firebase query
// to an Observable. One is suitable for "leaf" objects, these are watched
// as a unit and replaced with each update. The other is suitable for Firebase
// "arrays", it understands the conventions use their to make an observable
// that yields an array with each change.

// TODO Further polish this, publish as a reusable library.

import {Observable} from 'angular2/angular2';

export function observableFirebaseObject(ref: FirebaseQuery): Observable<any> {
  return Observable.create(function(observer: any) {
    function value(snapshot: any) {
      observer.next(snapshot.val());
    }
    ref.on('value', value);
    return function() {
      ref.off('value', value);
    }
  });
}

export function observableFirebaseArray(ref: FirebaseQuery): Observable<any[]> {

  return Observable.create(function(observer: any) {
    var arr: any[] = [];
    const keyFieldName = "$$fbKey";

    function child_added(snapshot: any, prevChildKey: any) {
      let child = snapshot.val();
      child[keyFieldName] = snapshot.key();
      arr = arr.slice();
      let prevEntry = arr.find((y) => y[keyFieldName] === prevChildKey);
      arr.splice(arr.indexOf(prevEntry) + 1, 0, child);
      observer.next(arr);
    }

    function child_changed(snapshot: any) {
      let key = snapshot.key();
      let child = snapshot.val();
      // TODO consider new array with new object in it
      var x = arr.find((y) => y[keyFieldName] === key);
      if (x) {
        for (var k in child) x[k] = child[k];
      }
      observer.next(arr);
    }

    function child_removed(snapshot: any) {
      let key = snapshot.key();
      let child = snapshot.val();
      arr = arr.slice();
      var x = arr.find((y) => y[keyFieldName] === key);
      if (x) {
        arr.splice(arr.indexOf(x), 1);
      }
      observer.next(arr);
    }

    function child_moved(snapshot: any, prevChildKey: any) {
      let key = snapshot.key();
      let child = snapshot.val();
      child[keyFieldName] = key;
      arr = arr.slice();
      // Remove from old slot
      var x = arr.find((y) => y[keyFieldName] === key);
      if (x) {
        arr.splice(arr.indexOf(x), 1);
      }
      // Add in new slot
      var prevEntry = arr.find((y) => y[keyFieldName] === prevChildKey);
      if (prevEntry) {
        arr.splice(arr.indexOf(prevEntry) + 1, 0, child);
      } else {
        arr.splice(0, 0, child);
      }
      observer.next(arr);
    }

    // Start out empty until/unless data arrives from Firebase
    observer.next(arr);

    ref.on('child_added', child_added);
    ref.on('child_changed', child_changed);
    ref.on('child_removed', child_removed);
    ref.on('child_moved', child_moved);

    return function() {
      ref.off('child_added', child_added);
      ref.off('child_changed', child_changed);
      ref.off('child_removed', child_removed);
      ref.off('child_moved', child_moved);
    }
  });
}
