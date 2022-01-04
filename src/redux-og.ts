import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { v1 as uuid } from 'uuid';
import { Todo } from './type';

//NOTE: constans
const CREATE_TODO = 'CREATE_TODO';
const EDIT_TODO = 'EDIT_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const DELETE_TODO = 'DELETE_TODO';
const SELECT_TODO = 'SELECT_TODO';

//NOTE: Actios & Action type
interface CreateTodoActionType {
  type: typeof CREATE_TODO;
  payload: Todo;
}

export const createTodoActionCreator = ({ desc }: { desc: string }): CreateTodoActionType => {
  return {
    type: CREATE_TODO,
    payload: {
      id: uuid(),
      desc,
      isComplete: false,
    },
  };
};

interface EditTodoActionType {
  type: typeof EDIT_TODO;
  payload: { id: string; desc: string };
}

export const editTodoActionCreator = (data: { desc: string; id: string }): EditTodoActionType => {
  const { id, desc } = data;
  return {
    type: EDIT_TODO,
    payload: {
      id: id,
      desc: desc,
    },
  };
};

interface ToggleTodoActionType {
  type: typeof TOGGLE_TODO;
  payload: { id: string; isComplete: boolean };
}

export const toggleTodoActionCreator = ({ id, isComplete }: { id: string; isComplete: boolean }): ToggleTodoActionType => {
  return {
    type: TOGGLE_TODO,
    payload: {
      id: id,
      isComplete: isComplete,
    },
  };
};

interface DeleteTodoActionType {
  type: typeof DELETE_TODO;
  payload: {
    id: string;
  };
}

export const deleteTodoActionCreator = ({ id }: { id: string }): DeleteTodoActionType => {
  return {
    type: DELETE_TODO,
    payload: { id: id },
  };
};

interface SelectTodoActionType {
  type: typeof SELECT_TODO;
  payload: { id: string };
}

export const selectTodoActionCreator = ({ id }: { id: string }): SelectTodoActionType => {
  return {
    type: SELECT_TODO,
    payload: { id },
  };
};

// Reducers

const todosInitalState: Todo[] = [
  {
    id: uuid(),
    desc: 'Learn React',
    isComplete: true,
  },
  {
    id: uuid(),
    desc: 'Learn Redux',
    isComplete: true,
  },
  {
    id: uuid(),
    desc: 'Learn Redux-ToolKit',
    isComplete: false,
  },
];

type TodoActionTypes = CreateTodoActionType | DeleteTodoActionType | ToggleTodoActionType | EditTodoActionType;

const todosReducer = (state: Todo[] = todosInitalState, action: TodoActionTypes) => {
  switch (action.type) {
    case CREATE_TODO: {
      const { payload } = action;
      return [...state, payload];
    }
    case EDIT_TODO: {
      const { payload } = action;
      return state.map(el => (el.id === payload.id ? { ...el, desc: payload.desc } : el));
    }
    case TOGGLE_TODO: {
      const { payload } = action;
      return state.map(todo => (todo.id === payload.id ? { ...todo, isComplete: payload.isComplete } : todo));
    }
    case DELETE_TODO: {
      const { payload } = action;
      return state.filter(el => el.id !== payload.id);
    }
    default: {
      return state;
    }
  }
};

type SelectedTodoActionTypes = SelectTodoActionType;

const selectedTodoReducer = (state: string | null = null, action: SelectedTodoActionTypes) => {
  switch (action.type) {
    case SELECT_TODO: {
      const {
        payload: { id },
      } = action;
      return id;
    }
    default: {
      return state;
    }
  }
};

const counterReducer = (state: number = 0, action: TodoActionTypes) => {
  switch (action.type) {
    case CREATE_TODO: {
      return state++;
    }
    case EDIT_TODO: {
      return state++;
    }
    case TOGGLE_TODO: {
      return state++;
    }
    case DELETE_TODO: {
      return state++;
    }
    default: {
      return state;
    }
  }
};

// NOTE: combineReducers로 리듀스들을 합쳐놓는다.
const reducers = combineReducers({
  todos: todosReducer,
  selectedTodo: selectedTodoReducer,
  counter: counterReducer,
});

/* NOTE:
- createStore를 이용하여 리듀서들을 담는다.
- compose란 순차적으로 함수를 적용해 나가는 역할, 미들웨어를 사용할 때 적용하면 좋다.
*/

export const store = createStore(reducers, composeWithDevTools(applyMiddleware(thunk, logger)));
