# https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.2/d3.min.js

const canvas = document.querySelector('#builder-page');

const sections = [
  {
    name: 'Header',
    id: 1
  }, 
  {
    name: 'Homepage', 
    id: 2
  }
];

const components = [
  {
    name: 'Site Logo',
    id: 3,
    section: 1,
  },
  {
    name: 'Quick Links',
    id: 4,
    section: 2
  }
];

const elements = [
  {
    name: 'Header Logo',
    id: 5,
    component: 3,
    section: 1
  },
  {
    name: 'Link 1',
    id: 6,
    component: 4,
    section: 2
  },
  {
    name: 'Link 2',
    id: 7,
    component: 4,
    section: 2
  }
];

const fields = [
  {
    type: 'ImageUpload',
    id: 8,
    element: 5,
    component: 3,
    section: 1
  },
  {
    type: 'Text',
    id: 9,
    element: 6,
    component: 4,
    section: 2
  },
  {
    type: 'Text',
    id: 10,
    element: 7,
    component: 4,
    section: 2
  }
];

// function buildNodes3() {
//   let template = [];
//   sections.map((section) => {
//     template.push(`
//       <div class="paper section">
//         <div class="paper-titlebar">${section.name}</div>
//         <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="500" data-parent="${section.id}">
//           <g>
//             ${components.map((component) => {
//               if (component.section === section.id) {
//                 return `
//                   <g>
//                     <rect id="comp_${component.id}" class="component sec_${section.id}" x="0" y="0" width="125" height="100"></rect>
//                     <text y="25" x="15">${component.name}</text>
//                   </g>
//                 `;
//               }
//             })}
//             ${elements.map((element, i) => {
//               if (element.section === section.id) {
//                 console.log(i, element.name);
//                 return `
//                   <g>
//                     <rect class="element" x="${i * 100}" y="130" width="125" height="100"></rect>
//                     <text y="155" x="15">${element.name}</text>
//                   </g>
//                 `;
//               }
//             })}
//           </g>
//         </svg>
//         ${fields.map((field) => {
//           if (field.section === section.id) {
//             return `
//               <div class="field">
//                 ${field.type}
//               </div>
//             `;
//           }
//         })}
//       </div>
//     `);
//   });
//   return template.join('').replace(/,/g, '');
// }

// function buildNodes4() {
//   let template = [];
//   sections.map((section, i) => {
//     template.push(`
//       <div sortable style="left: ${i * 100}px" class="paper section">
//         <div class="paper-titlebar">${section.name}</div>
//         ${components.map((component, i) => {
//           if (component.section === section.id) {
//             return `
//               <div class="component">
//                 ${component.name}
//                 <span>C</span>
//               </div>
//             `;
//           }
//         })}
//         ${elements.map((element, i) => {
//           if (element.section === section.id) {
//             return `
//               <div style="top: 11em; left: ${41 + ((i === 0 ? 0 : i - 1) * 10)}%" class="element">
//                 ${element.name}
//                 <span>E</span>
//               </div>
//             `;
//           }
//         })}
//         ${fields.map((field, i) => {
//           if (field.section === section.id) {
//             return `
//               <div style="top: 18.5em; left: ${36 + ((i === 0 ? 0 : i - 1) * 10)}%" class="field">
//                 ${field.type}
//                 <span>F</span>
//               </div>
//             `;
//           }
//         })}
//       </div>
//     `);
//   });
//   return template.join('').replace(/,/g, '');
// }

// canvas.innerHTML = buildNodes4();

// add page li
const menu = document.querySelector('#side-nav .menu');

// li
const li = document.createElement('LI');
li.className = 'menu-ghost';

// icon
const menuIcon = document.createElement('I');
menuIcon.className = 'zmdi zmdi-plus-circle'
li.appendChild(menuIcon);

// span
const menuSpan = document.createElement('SPAN');
menuSpan.setAttribute('contenteditable', true);
const spanText = document.createTextNode('Add a section');
menuSpan.appendChild(spanText);
li.appendChild(menuSpan);

// append li
menu.appendChild(li);

// span focus styles
const pageInput = document.querySelector('.menu-ghost span');

pageInput.addEventListener('focus', () => {
  const parent = document.querySelector('.menu-ghost');
  
  if (!parent.classList.contains('menu-error')) {
    parent.style.border = '1px dashed #40a5ed';
    parent.style.background = '#e7f4fd';
  }
});

pageInput.addEventListener('blur', (e) => {
  const parent = document.querySelector('.menu-ghost');
  parent.style = '';
  
  if (!e.target.innerText) {
    e.target.innerText = 'Add a section';
  }
});
