import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v1 as uuid } from 'uuid';
import { createTodoActionCreator, deleteTodoActionCreator, editTodoActionCreator, selectTodoActionCreator, toggleTodoActionCreator } from '../redux-og';
import { Todo, State } from '../type';
import './App.css';

const App = function() {
  // NOTE: 생성한 action을 useDispatch를 이용하여 발생시킬 수 있음.
  const dispatch = useDispatch();

  // NOTE: connect함수를 이용하지 않고 리덕스의 state를 조회할 수 있다.
  const todos = useSelector((state: State) => state.todos);

  const selectedTodoId = useSelector((state: State) => state.selectedTodo);
  const editedCount = useSelector((state: State) => state.counter);

  const [newTodoInput, setNewTodoInput] = useState<string>('');
  const [editTodoInput, setEditTodoInput] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const editInput = useRef<HTMLInputElement>(null);

  // NOTE: 객체를 반환
  const selectedTodo = (selectedTodoId && todos.find(todo => todo.id === selectedTodoId)) || null;
  console.log(selectedTodo, 'selectedTodo');
  const handleNewInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewTodoInput(e.target.value);
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEditTodoInput(e.target.value);
  };

  const handleCreateNewTodo = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!newTodoInput.length) return;
    dispatch(createTodoActionCreator({ desc: newTodoInput }));
    setNewTodoInput('');
  };

  const handleSelectTodo = (todoId: string) => (): void => {
    dispatch(selectTodoActionCreator({ id: todoId }));
  };

  const handleEdit = (): void => {
    if (!selectedTodo) return;

    setEditTodoInput(selectedTodo.desc);
    setIsEditMode(true);
  };

  useEffect(() => {
    if (isEditMode) {
      editInput?.current?.focus();
    }
  }, [isEditMode]);

  const handleUpdate = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!editTodoInput.length || !selectedTodoId) {
      handleCancelUpdate();
      return;
    }

    dispatch(editTodoActionCreator({ desc: editTodoInput, id: selectedTodoId }));
    setIsEditMode(false);
    setEditTodoInput('');
  };

  const handleCancelUpdate = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e?.preventDefault();
    setIsEditMode(false);
    setEditTodoInput('');
  };

  const handleToggle = (): void => {
    if (!selectedTodoId || !selectedTodo) return;
    dispatch(toggleTodoActionCreator({ id: selectedTodoId, isComplete: !selectedTodo.isComplete }));
  };

  const handleDelete = (): void => {
    if (!selectedTodoId) return;
    dispatch(deleteTodoActionCreator({ id: selectedTodoId }));
  };

  return (
    <div className="App">
      <div className="App__counter">Todos Updated Count: {editedCount}</div>
      <div className="App__header">
        <h1>Todo: Redux vs RTK Edition</h1>
        <form onSubmit={handleCreateNewTodo}>
          <label htmlFor="new-todo">Add new:</label>
          <input onChange={handleNewInputChange} id="new-todo" value={newTodoInput} />
          <button type="submit">Create</button>
        </form>
      </div>
      <div className="App__body">
        <ul className="App__list">
          <h2>My Todos:</h2>
          {todos.map((todo, i) => (
            <li className={`${todo.isComplete ? 'done' : ''} ${todo.id === selectedTodoId ? 'active' : ''}`} key={todo.id} onClick={handleSelectTodo(todo.id)}>
              <span className="list-number">{i + 1})</span> {todo.desc}
            </li>
          ))}
        </ul>
        <div className="App_todo-info">
          <h2>Selected Todo:</h2>
          {selectedTodo === null ? (
            <span className="empty-state">No Todo Selected</span>
          ) : !isEditMode ? (
            <>
              <span className={`todo-desc ${selectedTodo?.isComplete ? 'done' : ''}`}>{selectedTodo.desc}</span>
              <div className="todo-actions">
                <button onClick={handleEdit}>Edit</button>
                <button onClick={handleToggle}>Toggle</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdate}>
              <label htmlFor="edit-todo">Edit:</label>
              <input ref={editInput} onChange={handleEditInputChange} value={editTodoInput} />
              <button type="submit">Update</button>
              <button onClick={handleCancelUpdate}>Cancel</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
