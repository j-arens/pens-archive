// https://cdnjs.cloudflare.com/ajax/libs/react/15.3.1/react.min.js
// https://cdnjs.cloudflare.com/ajax/libs/react/15.3.1/react-dom.min.js

/**
* Form component
*/

const Form = React.createClass({
  
  getInitialState: function() {
    return {
      pageSettings: {
        ready: function() {
          return this.pageTitle.length && this.nameSpace.length ? true : false;
        },
        pageTitle: '',
        nameSpace: '',
        priority: '1',
        dashicon: 'home',
      },
      newSection: {
        ready: function() {
          return this.sectionTitle.length && this.components.length ? true : false;
        },
        enable: function() {
          return this.state.pageSettings.ready();
        }.bind(this),
        sectionTitle: '',
        position: '',
        components: [],
        tempComponent: '',
      },
      sections: [],
      components: [],
      elements: [],
      fields: [],
      idStore: [],
    }
  },
  
  _isValid: function(string) {
    const regex = /[a-zA-Z\d\s\-]/;
    return string === '' || regex.test(string);
  },
  
  _uniqueId: function(prefix) {
    // store all used nums
    let store = this.state.idStore;
    
    // create random num
    let id = Math.ceil((Math.random() * Math.random()) * 1256);
    
    // make sure random num isn't already used
    if (store.includes(id)) {
      while(store.includes(id)) {
        id = Math.ceil((Math.random() * Math.random()) * 1256);
      }
    } else {
      store.push(id);
      this.setState(this.state);
      return prefix + '_' + id;
    }
  },
  
  updateProp: function(obj) {
    if (this._isValid(obj.val)) {
      this.state[obj.type][obj.prop] = obj.val;
      this.setState(this.state);
    }
  },
  
  commitComponent: function(e) {
    e.preventDefault();
    const tempComponent = this.state.newSection.tempComponent;
    const components = this.state.newSection.components;
    components.push(tempComponent);
    this.state.newSection.tempComponent = '';
    this.setState(this.state);
  },
  
  appendSection: function(e) {
    e.preventDefault();
    
    const components = this.state.newSection.components;
    
    let section = {
      id: this._uniqueId('section'),
      name: this.state.newSection.sectionTitle,
      position: this.state.newSection.position,
    };
    
    components.map(function(component) {
      let comp = {
        parent: section.id,
        id: this._uniqueId('component'),
        name: component,
      };
      
      this.state.components.push(comp);
    }.bind(this));
    
    this.state.sections.push(section);
    this.setState(this.state);
  },
  
  updateField: function(obj) {
    if (this._isValid(obj.val)) {
      this.state.fields.map(function(field) {
        if (field.id === obj.parent) {
          field[obj.prop] = obj.val;
        }
      });
      this.setState(this.state);
      console.log(this.state);
    }
  },
  
  commit: function(obj) {
    obj.id = this._uniqueId(obj.prefix);
    this.state[obj.type].push(obj);
    this.setState(this.state);
  },
  
  buildScript: function(e) {
    e.preventDefault;
    const state = this.state;
  },
  
  getSections: function(state) {
    return state.sections;
  },
  
  getPageSettings: function(state) {
    return state.pageSettings;
  },
  
   render: function() {
     return (
       <form>
         <PageSettings 
          pageSettings={this.state.pageSettings}
          updateProp={this.updateProp} />
         <SectionBuilder 
          newSection={this.state.newSection}
          updateProp={this.updateProp}
          commitComponent={this.commitComponent}
          appendSection={this.appendSection} />
         {this.state.sections.map(function(section) {
           const sectionId = section.id;
           let childComponents = [];
           
           this.state.components.map(function(component) {
             if (component.parent === sectionId) {
               childComponents.push(component);
             }
           });
           
           return (
            <Section 
              section={section}
              components={childComponents}
              elements={this.state.elements}
              fields={this.state.fields}
              updateField={this.updateField}
              commit={this.commit} />
           );
         }.bind(this))}
         <button 
           id="build-btn"
           onClick={function(e) {this.buildScript(e)}}>Build Script</button>
       </form>
     );
   },
  
});

/**
* Page settings component
*/

function PageSettings(props) {
  return (
    <fieldset id="page-settings" className="modal modal-half accodion-open">
      <span className="titlebar titlebar-lg">Page Settings</span>
      <ul class="field-list">
        <li>
          <label>Page Title</label>
          <input 
            id="page-title" 
            type="text" 
            placeholder="dashboard menu title"
            value={props.pageSettings.pageTitle}
            onChange={function() {props.updateProp({
              type: 'pageSettings',
              prop: 'pageTitle',
              val: event.target.value,
            })}} />
        </li>
        <li>
          <label>Namespace</label>
          <input 
            id="namespace" 
            type="text" 
            placeholder="opt_page"
            value={props.pageSettings.nameSpace}
            onChange={function() {props.updateProp({
              type: 'pageSettings',
              prop: 'nameSpace',
              val: event.target.value,
            })}} />
        </li>
        <li>
          <label>Priority</label>
          <datalist id="range-ticks" >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </datalist>
          <input 
            id="page-priority" 
            type="range" 
            step="1" 
            min="0" 
            max="4" 
            list="range-ticks"
            value={props.pageSettings.priority}
            onChange={function() {props.updateProp({
              type: 'pageSettings',
              prop: 'priority',
              val: event.target.value,
            })}}/>
        </li>
        <li>
          <label>Dashicon</label>
          <select 
            className="icon-select"
            value={props.pageSettings.dashicon}
            onChange={function() {props.updateProp({
              type: 'pageSettings',
              prop: 'dashicon',
              val: event.target.value,
            })}}>
            <option value="hamburger">hamburger</option>
            <option value="globe">globe</option>
            <option value="pointer">pointer</option>
            <option value="page">page</option>
            <option value="largeBrush">large brush</option>
            <option value="wrench">wrench</option>
            <option value="dials">dials</option>
            <option value="key">key</option>
            <option value="home">home</option>
            <option value="cog">cog</option>
            <option value="small brush">small brush</option>
          </select>
        </li>
      </ul>
    </fieldset>
  );
}

PageSettings.propTypes = {
  pageSettings: React.PropTypes.object.isRequired,
  updateProp: React.PropTypes.func.updateProp,
}

/**
* Section builder component
*/

function SectionBuilder(props) {
  return (
    <fieldset className={"modal modal-half accordion-open " + (props.newSection.enable() ? '' : 'disabled')}>
      <span className="titlebar titlebar-lg">Section Builder</span>
      <ul className="field-list">
        <li>
          <label>Section Title</label>
          <input 
            id="section-title" 
            type="text" 
            placeholder="header"
            value={props.newSection.sectionTitle}
            onChange={function() {props.updateProp({
              type: 'newSection',
              prop: 'sectionTitle',
              val: event.target.value,
            })}} />
        </li>
        <li>
          <label>Position</label>
          <input 
            type="number" 
            min="0" 
            placeholder="1"
            value={props.newSection.position}
            onChange={function() {props.updateProp({
              type: 'newSection',
              prop: 'position',
              val: event.target.value,
            })}} />
        </li>
        <li>
          <label>Component</label>
          <input 
            id="component-input" 
            type="text" 
            placeholder="call to action 1"
            value={props.newSection.tempComponent}
            onChange={function() {props.updateProp({
              type: 'newSection',
              prop: 'tempComponent',
              val: event.target.value,
            })}} />
          <button 
            className={"add-comp-btn " + (props.newSection.tempComponent.length ? '' : 'disabled')} 
            onClick={function(e) {props.commitComponent(e)}}>+</button>   
        </li>
        <ComponentSummary 
          title={props.newSection.sectionTitle} 
          components={props.newSection.components} />
      </ul>
      <button 
        id="create-section" 
        className={(props.newSection.ready() ? '' : 'disabled')}
        onClick={function(e) {props.appendSection(e)}}>Create Section</button>
    </fieldset>
  );
}

SectionBuilder.propTypes = {
  newSection: React.PropTypes.object.isRequired,
  updateProp: React.PropTypes.func.updateProp,
  commitComponent: React.PropTypes.func.commitComponent,
  appendSection: React.PropTypes.func.appendSection,
};

/**
* Components summary
*/

function ComponentSummary(props) {
  return (
    <li id="section-info">
      <label>{props.title}</label>
      {props.components.map(function(component) {
        return (
          <p>- {component}</p>
        );
      })}
    </li>
  );
}

ComponentSummary.propTypes = {
  title: React.PropTypes.string.isRequired,
  components: React.PropTypes.array.isRequired,
};

/**
* Section component
*/

const Section = React.createClass({
  
  propTypes: {
    section: React.PropTypes.object.isRequired,
    components: React.PropTypes.array.isRequried,
    elements: React.PropTypes.array.isRequired,
    fields: React.PropTypes.array.isRequired,
    updateField: React.PropTypes.func.updateField,
    commit: React.PropTypes.func.commit,
  },

   render: function() {
     return (
       <fieldset id={this.props.section.id} className="modal accordion-open section">
         <span className="titlebar titlebar-lg">{this.props.section.name}
          <button className="toggle-btn toggle-btn-lg"></button>
         </span>
         <ul className="inner-modal-container masonry">
           {this.props.components.map(function(component) {
             return (
              <Component 
                component={component}
                elements={this.props.elements}
                fields={this.props.fields}
                updateField={this.props.updateField}
                commit={this.props.commit} />
             );
           }.bind(this))}
         </ul>
       </fieldset>
     );
   }
  
});

/**
* Component component
*/

const Component = React.createClass({
  
  propTypes: {
    component: React.PropTypes.object.isRequired,
    elements: React.PropTypes.array.isRequired,
    fields: React.PropTypes.array.isRequired,
    updateField: React.PropTypes.func.updateField,
    commit: React.PropTypes.func.commit,
  },
  
  getInitialState: function() {
    return {
      newElement: {
        elementName: '',
      },
    }
  },
  
  _isValid: function(string) {
    const regex = /[a-zA-Z\d\s\-]/;
    return string === '' || regex.test(string);
  },
  
  updateProp: function(obj) {
    if (this._isValid(obj.val)) {
      this.state[obj.type][obj.prop] = obj.val;
      this.setState(this.state);
    }
  },
  
  commitElement: function(e) {
    e.preventDefault();
    
    if (this._isValid(this.state.newElement.elementName)) {
      let element = {
        type: 'elements',
        prefix: 'element',
        name: this.state.newElement.elementName,
        parent: this.props.component.id,
      };
      
      this.state.newElement.elementName = '';
      this.setState(this.state);
      
      this.props.commit(element);
    }
  },
  
  render: function() {
    return (
      <li className="inner-modal inner-modal-lg accordion-open component">
        <span className="titlebar titlebar-md">{this.props.component.name}</span>
        <label>
        Element
        <input 
          type="text" 
          placeholder="background color"
          value={this.state.newElement.elementName}
          onChange={function() {this.updateProp({
              type: 'newElement',
              prop: 'elementName',
              val: event.target.value,
            })}.bind(this)}/>
        <button 
          id="add-element-btn"
          onClick={function(e) {this.commitElement(e)}.bind(this)}>+</button>
        </label>
        <ul className="element-list">
          {this.props.elements.map(function(element) {
            
            const componentId = this.props.component.id;
            
            if (element.parent === componentId) {
              return (
                <Element 
                  element={element}
                  fields={this.props.fields}
                  updateField={this.props.updateField}
                  commit={this.props.commit}/>
              );
            }
          }.bind(this))}
        </ul>
      </li>
    );
  }
  
});

/**
* Element component
*/

const Element = React.createClass({
  
  propTypes: {
    element: React.PropTypes.object.isRequired,
    fields: React.PropTypes.array.isRequired,
    updateField: React.PropTypes.func.updateField,
    commit: React.PropTypes.func.commit,
  },
  
  getInitialState: function() {
    return {
      newField: {
        fieldType: '',
      },
    }
  },
  
  _isValid: function(string) {
    const regex = /[a-zA-Z\d\s\-]/;
    return string === '' || regex.test(string);
  },
  
  updateProp: function(obj) {
    if (this._isValid(obj.val)) {
      this.state[obj.type][obj.prop] = obj.val;
      this.setState(this.state);
    }
  },
  
  commitField: function(e) {
    e.preventDefault();
    
    let field = {
      type: 'fields',
      prefix: 'field',
      fieldType: this.state.newField.fieldType,
      parent: this.props.element.id,
    };
    
    this.props.commit(field);
  },
  
  render: function() {
    return (
      <li className="inner-modal inner-modal-md accordion-open part">
        <span className="titlebar titlebar-sm">{this.props.element.name}</span>
        <label>
        <select onChange={function() {this.updateProp({
              type: 'newField',
              prop: 'fieldType',
              val: event.target.value,
            })}.bind(this)}>
          <option value="">Field Type...</option>
          <option value="Password">password</option>
          <option value="SecretText">secret text</option>
          <option value="TextArea">text area</option>
          <option value="SingleCheckbox">single checkbox</option>
          <option value="MultipleCheckbox">multiple checkbox</option>
          <option value="RadioButtons">radio buttons</option>
          <option value="NumberField">number field</option>
          <option value="ColorPicker">color picker</option>
          <option value="ImageUpload">image upload</option>
        </select>
        <button 
          id="add-field-btn"
          className={this.state.newField.fieldType.length ? '' : 'disabled'}
          onClick={function(e) {this.commitField(e)}.bind(this)} >+</button>
      </label>
        {this.props.fields.map(function(field) {
          const elementId = this.props.element.id;
          
          if (field.parent === elementId) {
            return (
              <Field 
                field={field}
                updateField={this.props.updateField} />
            );
          }
        }.bind(this))}
      </li>
    );
  }
  
});

/**
* Field Component
*/

const Field = React.createClass({
  
  propTypes: {
    field: React.PropTypes.object.isRequired,
    updateField: React.PropTypes.func.updateField,
  },
  
  render: function() {
    const FieldType = window[this.props.field.fieldType];
    return (
      <div className="inner-modal field-options accordion-open">
        <span className="titlebar titlebar-xs">{this.props.field.fieldType.replace(/([A-Z])/g, ' $1').trim()}
        <button 
          // onClick={function(e) {props.delField(e, props.keys)}}
          className="delete-element-btn">X</button>
        </span>
        <FieldType 
          parent={this.props.field.id}
          updateField={this.props.updateField} />
      </div>
    );
  }
  
});

/**
* Field types
*/

function Password(props) {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Placeholder  
        <input 
          className="field-placeholder" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'placeholder',
            val: event.target.value,
          })}} />   
      </label>
      <label>
        Description  
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} />  
      </label> 
    </div>
  );
}

Password.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

function SecretText(props) {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Placeholder
        <input 
          className="field-placeholder" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'placeholder',
            val: event.target.value,
          })}} />
      </label>    
      <label>
        Description
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} />
      </label>
    </div>
  );
}

SecretText.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

function TextArea(props) {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Description
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} />
      </label>
    </div>
  );
}

TextArea.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

function SingleCheckbox(props) {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name" 
          type="text" 
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Description
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} /> 
      </label>
    </div>
  );
}

SingleCheckbox.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

function MultipleCheckbox(props) {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Description
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} />
      </label>
    </div>
  );
}

MultipleCheckbox.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

function RadioButtons(props) {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Description
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} />
        </label>
    </div>
  );
}

RadioButtons.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

function NumberField(props) {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Description
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} />
      </label>
    </div>
  );
}

NumberField.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

function ColorPicker(props) {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name"
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Description
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} />
      </label>
    </div>
  );
}

ColorPicker.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

function ImageUpload() {
  return (
    <div>
      <label>
        Field Name
        <input 
          className="field-name" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'name',
            val: event.target.value,
          })}} />
      </label>
      <label>
        Description
        <input 
          className="field-descrip" 
          type="text"
          onChange={function() {props.updateField({
            parent: props.parent,
            prop: 'desc',
            val: event.target.value,
          })}} />
      </label>
    </div>
  );
}

ImageUpload.propTypes = {
  parent: React.PropTypes.string.isRequired,
  updateField: React.PropTypes.func.updateField,
}

/**
* Render
*/

ReactDOM.render(<Form />, document.getElementById('page-builder'));
