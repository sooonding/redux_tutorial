import { configureStore, createSlice, getDefaultMiddleware, PayloadAction } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import logger from 'redux-logger';
import { v1 as uuid } from 'uuid';
import { Todo } from './type';

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

/*
NOTE: createSlice는 action와 reducer를 간단하게 생성하게 할 수 있다.
그리고 immer를 지원하기 때문에 state를 "직접 변형할 수 있다."
*/

const todosSlice = createSlice({
  name: 'todos',
  // 초기 state의 값
  initialState: todosInitalState,
  // key는 액션 타입의 문자열, 함수는 액션이 dispatch 될 때 실행되는 reducer
  // 액션 타입은 슬라이스 이름을 접두어로 사용하여 "자동" 생성이 됩니다.(예: name이 "edit"면 바보/액션 이름)
  reducers: {
    //NOTE: PayloadAction은 액션의 payload 필드의 타입을 지정할 수 있게 해준다.
    create: {
      // 이에 상응하는 액션 타입을 가진 액션이 "디스패치"되면 리듀서가 실행된다.
      reducer: (state, { payload }: PayloadAction<{ id: string; desc: string; isComplete: boolean }>) => {
        state.push(payload);
      },
      // 리듀서가 실행되기 이전에 액션의 내용을 편집하기 위해 prepare를 이용!
      // TODO 왜 return을 쓰면 에러가 나는지 확인하기!
      prepare: (payload: { desc: string }) => ({
        payload: {
          id: uuid(),
          desc: payload.desc,
          isComplete: false,
        },
      }),
    },
    edit: (state, action: PayloadAction<{ id: string; desc: string }>) => {
      const { payload } = action;
      // NOTE: 1. findIndex로 찾는 방법
      // const index = state.findIndex(ele => ele.id === payload.id);
      // // 해당하는 아이디가 !있다면!(-1이 반환되면 없는거니까)
      // if (index !== -1) {
      //   state[index].desc = payload.desc;
      // }

      // NOTE: 2.find로 찾는 방법
      const findValue = state.find(el => el.id === payload.id);
      // 해당하는 값이 있으면 해당 객체의 desc를 받은 값으로 대체
      if (findValue) {
        findValue.desc = payload.desc;
      }
    },
    toggle: (state, action: PayloadAction<{ id: string; isComplete: boolean }>) => {
      const {
        payload: { id, isComplete },
      } = action;
      const toggleId = state.findIndex(el => el.id === id);
      if (toggleId !== -1) {
        state[toggleId].isComplete = isComplete;
      }
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { payload } = action;
      // NOTE: [badCase] 어짜피 state의 불변성을 지키지 않아도 되기 때문에 불변성을 유지하는 filter를 사용할 이유가 없다.
      // const filterArray = state.filter(el => el.id !== payload.id);
      // state = filterArray;

      // NOTE: 위와같이 findIndex로 찾아도 된다.
      const filterArr = state.findIndex(el => el.id === payload.id);
      if (filterArr !== -1) {
        //한개만 반환되어야 하니 splice로 잘라준다.
        state.splice(filterArr, 1);
      }
    },
  },
});

const selectedTodoSlice = createSlice({
  name: 'select',
  initialState: null as string | null,
  reducers: {
    select: (state, action: PayloadAction<{ id: string }>) => {
      return (state = action.payload.id);
    },
  },
});

const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {},
  /*
  NOTE: extraReducers는 createSlice가 생성한 액션타입 외에 "다른 액션 타입에" 응답 할 수 있도록 합니다.
  슬라이스 리듀서에서 맵핑된 "내부"액션 타입이 아니라 외부의 액션을 "참조"하려는 의도를 가지고 있습니다.
  */
  extraReducers: {
    /* 여기선 외부의 슬라이스에 참조된 타입을 가져오자 */
    [todosSlice.actions.create.type]: state => state + 1,
    [todosSlice.actions.edit.type]: state => state + 1,
    [todosSlice.actions.remove.type]: state => state + 1,
    [todosSlice.actions.toggle.type]: state => state + 1,
  },
});

// NOTE: 축약하기

// 해당 액션 네임의 밸류값은 그냥 리네임(네이밍만 변경)이다.
export const { create: createTodoActionCreator, edit: editTodoActionCreator, remove: removeTodoActionCreator, toggle: toggleTodoActionCreator } = todosSlice.actions;
export const { select: selectTodoActionCreator } = selectedTodoSlice.actions;

/* ANCHOR: case1: 리듀서를 합칠 땐 기존처럼 combineReducers를 이용하지 않는 방법도 있음  */
// const rootReducer = {
//   todos: todosSlice.reducer,
//   selectedTodo: selectedTodoSlice.reducer,
//   counter: counterSlice.reducer,
// };

/* ANCHOR: case2: 기존처럼 combineReducers를 이용   */
const rootReducer = combineReducers({
  todos: todosSlice.reducer,
  selectedTodo: selectedTodoSlice.reducer,
  counter: counterSlice.reducer,
});

/*
NOTE: configureStore는기존에 스토어를 구성하는 함수 
createStore를 추상화(그냥 간단하게 해당 기능 동일시)
getDefaultMiddleware : 사용자 정의, 커스텀 미들웨어를 추가
*/
const middleware = [...getDefaultMiddleware(), logger];
//export const store = configureStore({ reducer: rootReducer, middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger) });
export const store = configureStore({ reducer: rootReducer, middleware });
