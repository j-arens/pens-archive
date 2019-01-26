const Row: string = `
    <div class="row" data-grid="eyJjb2xzIjowfQ==">
        <div class="controlGroup rowControls">
            <div class="btnGroup">
                <button class="btn" data-action="ADD_COL">
                    +
                </button>
            </div>
        </div>
    </div>
`;

const Col: string = `
    <div class="col"></div>
`;

// type GridEntity = 'row' | 'col';

interface GridState {
    cols?: number;
    rows?: number;
}

const makeCopy = obj1 => obj2 => Object.assign({}, obj1, obj2);
const unserialize = (b64: string): GridState => JSON.parse(atob(b64));
const serialize = (state: GridState): string => btoa(JSON.stringify(state));

function deriveGrid(entityType: string, state: GridState): string {
    if (entityType === 'Row') {
        return `repeat(${state.rows}, ${state.rows > 1 ? (100 / state.rows).toFixed(2) : 100}%)`;
    }
    
    return `repeat(${state.cols}, ${state.cols > 1 ? (100 / state.cols).toFixed(2) : 100}%)`;
}

function appendGridEntity(entityType: string, gridEntity: string, parentEntity: HTMLElement, state: GridState): void {
    const rule = entityType === 'Row' ? 'Rows' : 'Columns';
    parentEntity.style[`gridTemplate${rule}`] = deriveGrid(entityType, state);
    parentEntity.insertAdjacentHTML('beforeend', gridEntity);
}

function incrementGridEntity(entityType: string, state: GridState): GridState {
    return makeCopy(state)({[entityType]: state[entityType] + 1});
}

function routeBlockEvent({ target }: mouseEvent): void {
    const action: string = target.dataset.action;
    
    if ( ! action) {
        return;
    }
    
    const parentEntity: HTMLElement = target.parentElement.parentElement.parentElement;
    const gridState: GridState = unserialize(parentEntity.dataset.grid);
    
    switch(action) {
        case 'ADD_ROW': {
            const newState = incrementGridEntity('rows', gridState);
            appendGridEntity('Row', Row, parentEntity, newState);
            parentEntity.dataset.grid = serialize(newState);
            break;
        };
        case 'ADD_COL': {
            const newState = incrementGridEntity('cols', gridState);
            appendGridEntity('Col', Col, parentEntity, newState);
            parentEntity.dataset.grid = serialize(newState);
            break;  
        };
        default: {
            break;
        };
    };
}

const block: HTMLElement = document.querySelector('.block');
block.addEventListener('click', routeBlockEvent);
