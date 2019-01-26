// https://cdnjs.cloudflare.com/ajax/libs/masonry/4.1.0/masonry.pkgd.min.js
// https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js

const pageBuilder = (function() {
  
  // modal height data
  let counter = 0;
  let modalHeights = {};
  
  // cache dom
  let $pageBuilder = $('#page-builder');
  let $form = $pageBuilder.find('form');
  let $toggleBtn = $pageBuilder.find('.toggle-btn');
  // add component stuff
  let $addCompBtn = $pageBuilder.find('.add-comp-btn');
  let $sectionTitleInput = $pageBuilder.find('#section-title');
  let $sectionTitleLabel = $pageBuilder.find('#section-info label');
  
  let $addSectBtn = $pageBuilder.find('#add-sect-btn');
  let $addElBtn = $pageBuilder.find('#add-element-btn');
  
  // fields html
  const fieldOptions = {
    password: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Placeholder
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Password'
    },
    secretText: {
        html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Placeholder
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
        title: 'Secret Text'
   },
    textArea: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Text Area'
    },
    singleCheckbox: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Single Checkbox'
    },
    multipleCheckbox: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Multiple Checkbox'
    },
    selectBox: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Select Box'
    },
    mulitpleSelectBox: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Multiple Select Box'
    },
    radioButtons: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Radio Buttons'
    },
    numberField: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Number Field'
    },
    colorPicker: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Color Picker'
    },
    imageUpload: {
      html: `
        <label>
          Field Name
          <input type="text">
        </label>
        <label>
          Description
          <input type="text">
        </label>
      `,
      title: 'Image Upload'
    }
  }
  
  // init
  function init() {
    bindEvents();
    render();
  }
  
  // bind events
  function bindEvents() {
    $addSectBtn.on('click', addSection);
    $addCompBtn.on('click', addComponent);
    $sectionTitleInput.on('keypress', addSectionTitle);
    $pageBuilder.delegate('.toggle-btn', 'click', toggleModal);
    $pageBuilder.delegate('#add-element-btn', 'click', addElement);
    $pageBuilder.delegate('#add-field-btn', 'click', addField);
    $pageBuilder.delegate('.delete-element-btn', 'click', deleteElement);
  }
  
  // render
  function render() {
    // masonry grid
    $('.masonry').masonry({
      itemSelector: '.inner-modal-lg'
    });
  }
  
  // add section title
  function addSectionTitle(e) {
    // prevent enter from doing anything
    if (e.which === 13) {
      e.preventDefault();
      return;
    } else {
      let newTitle = $sectionTitleInput.val();
    
      $sectionTitleLabel.text(newTitle); 
    }
  }
  
  // add component
  function addComponent(e) {
    e.preventDefault();
    let $input = $pageBuilder.find('#component-input');
    
    let newComponent = $input.val();
    $pageBuilder.find('#section-info').append('<p>- ' + newComponent + '</p>');
    $input.val('');
  }
  
  // add section
  function addSection(e) {
    e.preventDefault();
    let $parent = $(this).closest('.modal');
    let title = $sectionTitleInput.val();
    let $components = $parent.find('#section-info p');
    
    if (!title) {
      console.log('no section title!');
      return;
    } else if ($components.length <= 0) {
      console.log('no components added!');
      return;
    } else {
      let beginLi = '<li class="inner-modal inner-modal-lg accordion-open">';
    
      let beginSpan = '<span class="titlebar titlebar-md">';
      let deleteBtn = '<button class="delete-element-btn">X</button>';
      let endSpan = '</span>';

      let beginLabel = '<label>Element';
      let input = '<input type="text" placeholder="background color" />';
      let btn = '<button id="add-element-btn">+</button>';
      let endLabel = '</label>';

      let innerLi = beginLabel + input + btn + endLabel;

      let elementUl = '<ul class="element-list"></ul>';
      let endLi = '</li>';
      
      let buildLi = function() {
        let compArr = [];

        $components.each(function() {
          let title = $(this).text().trim().replace('-', '');
          
          compArr.push(beginLi + beginSpan + title + endSpan + innerLi + endLi);
        });

        return compArr.join('');
      }

      let title = $sectionTitleInput.val();

      let template = 
      `<fieldset class="modal accordion-open">
        <span class="titlebar titlebar-lg">
          ${title}
          <button class="toggle-btn toggle-btn-lg"></button>
        </span>
        <ul class="inner-modal-container masonry">
          ${buildLi()}
        </ul>
      </fieldset>`;

      $sectionTitleInput.val('');
      $parent.find('#section-info label').text('');
      $parent.find('#section-info p').remove();
      $form.append(template);
      render();
    }
  }
  
  // add element
  function addElement(e) {
   e.preventDefault();
    
    let $parentComponent = $(this).closest('.inner-modal-lg');
    let $input = $parentComponent.find('input');
    let $newElement = $input.val();
    
    let beginLi = '<li class="inner-modal inner-modal-md accordion-open">';
    
    // titlebar
    let beginSpan = '<span class="titlebar titlebar-sm">';
    let deleteBtn = '<button class="delete-element-btn">X</button>';
    let endSpan = '</span>';
    
    let titleBar = beginSpan + $newElement + deleteBtn + endSpan;
    
    // input
    let beginLabel = '<label><select>';
    let endSelect = '</select>';
    let addBtn = '<button id="add-field-btn">+</button>';
    let endLabel = '</label>';
    
    let options = `
      <option value="password">password</option>
      <option value="secretText">secret text</option>
      <option value="textArea">text area</option>
      <option value="singleCheckbox">single checkbox</option>
      <option value="multipleCheckbox">multiple checkbox</option>
      <option value="radioButtons">radio buttons</option>
      <option value="numberField">number field</option>
      <option value="colorPicker">color picker</option>
      <option value="imageUpload">image upload</option>
    `;
    
    let input = beginLabel + options + endSelect + addBtn + endLabel;
    
    let endLi = '</li>';
    
    let template = beginLi + titleBar + input + endLi;
    
    $parentComponent.append(template);
    $input.val('');
    render();
  }
  
  function deleteElement(e) {
    console.log('delete element');
    e.preventDefault();
    
    $(this).closest('.inner-modal').remove();
  }
  
  function addField(e) {
    e.preventDefault();
    
    let $parentElement = $(this).closest('.inner-modal-md');
    let $input = $parentElement.find('select');
    let $newField = $input.val();
    
    let beginDiv = '<div class="inner-modal field-options accordion-open">';
    let beginSpan = '<span class="titlebar titlebar-xs">';
    let deleteBtn = '<button class="delete-element-btn">X</button>';
    let endSpan = '</span>';
    let endDiv = '</div>';
    
    let field = fieldOptions[$newField];
    
    let titlebar = beginSpan + field.title + deleteBtn + endSpan;
    
    let template = beginDiv+ titlebar + field.html + endDiv;
    
    $parentElement.append(template);
    $input.val('');
    render();
  }
  
  // set height
  function setHeight($el, id) {
    
    // get the height
    let elHeight = $el.outerHeight();
    
    if (id !== 'undefined') {
      if (modalHeights[id]) {
        modalHeights[id] = elHeight;
      } else {
         // set data attr of el so i can be referenced later
        $el.attr('data-uHeight', 'm_' + counter);

        // add unique key and height to modalHeights
        let uId = 'm_' + counter;
        modalHeights[uId] = elHeight;

        // increment height index
        counter++; 
      }
    }
  }
  
  // get height
  function getHeight($el) {
    
    let id = $el.attr('data-uHeight');
    
    let value = modalHeights[id]
    delete modalHeights[id];
    
    return value;
  }
  
  // toggle modals
  function toggleModal(e) {
    e.preventDefault();
    
    let $btn = $(this);
    let $modal = $(this).closest('*[class*="accordion-"]');
    
    if ($modal.hasClass('accordion-open')) {
      let $titlebar = $modal.find('.titlebar')
      let titleHeight = $titlebar.outerHeight() + 34;
      let uId = $modal.attr('data-uHeight');
      
      setHeight($modal, uId);
      
      $titlebar.siblings().slideUp(275);
      
      $modal.animate({
        height: titleHeight,
        minHeight: ''
      }, 300);
      
      $modal.removeClass('accordion-open');
      $modal.addClass('accordion-closed');
      
      $btn.css({
        transform: 'rotate(180deg)',
        top: '50%',
      });
      
    } else if ($modal.hasClass('accordion-closed')) {
      
      let $titlebar = $modal.find('.titlebar')
      let prevHeight = getHeight($modal);
      
      $modal.animate({
        height: '',
        minHeight: prevHeight
      }, 150, function() {
        $titlebar.siblings().slideDown();
      });
      
      $modal.removeClass('accordion-closed');
      $modal.addClass('accordion-open');
      
      $btn.css({
        transform: 'rotate(0deg)',
        top: '25%',
      });
    }
  }
  
  // api
  return {
    init: init
  }
  
})();

pageBuilder.init();
