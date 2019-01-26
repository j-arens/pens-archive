// https://monterail.com/blog/2016/how-to-build-a-reactive-engine-in-javascript-part-1-observable-objects
// https://monterail.com/blog/2017/computed-properties-javascript-dependency-tracking

/**
* Observable factory
*/
function Observable(obj) {
  if (typeof obj !== 'object') {
    console.error('Only objects can be made observable.');
    return;
  }
  
  this.__store = {};
  
  /**
  * Register a handler with an observable property
  */
  this.addObserver = (prop, handler) => {
    if (!this.__store[prop]) this.__store[prop] = [];
    this.__store[prop].push(handler);
  }
  
  /**
  * Remove a registered handler
  */
  this.removeObserver = (prop, handler) => {
    if (!this.__store[prop]) return;
    const index = this.__store[prop].findIndex(handler => handler === handler);
    this.__store[prop].splice(index, 1);
  }
  
  /**
  * Run handlers when an observed property is changed
  */
  const emitChange = (prop) => {
    if (!this.__store[prop] || this.__store[prop].length < 1) return;
    this.__store[prop].forEach(handler => handler());
  }
  
  /**
  * Decorate object properties with setters
  */
  const decorate = (obj, prop) => {
    let val = obj[prop];
    Object.defineProperty(obj, prop, {
      get () {
        return val;
      },
      set (newVal) {
        val = newVal;
        emitChange.call(obj, prop);
      }
    });
  }
  
  /**
  * Turn a plain object into an object with observable properties
  */
  const makeObservable = (obj) => {
    Object.keys(obj).forEach(key => decorate(obj, key));
    return obj;
  }
  
  return Object.assign(makeObservable(obj), this);
}

// const btn = document.querySelector('.namespace__neat');
// const btnState = new Observable({clicks: 0});

// const displayClicks = () => {
//   btn.firstElementChild.textContent = btnState.clicks;
// }

// btnState.addObserver('clicks', () => {
//   displayClicks();
// });

// btn.addEventListener('click', () => {
//   btnState.clicks = btnState.clicks + 1;
//   btnState.removeObserver('clicks', displayClicks);
// });
