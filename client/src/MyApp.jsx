import React, { useState, useEffect, useContext, useReducer, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Counter context
const CounterContext = React.createContext();

// Reducer function for managing counter state
const counterReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return { ...state,count: action.count };
    case 'INCREMENT':
      return { ...state,count: state.count + 1 };
    case 'DECREMENT':
      return { ...state,count: state.count - 1 };
    case 'SET2':
      return { ...state,mycount: action.mycount };
    case 'INCREMENT2':
      return { ...state,mycount: state.mycount + 1 };
    case 'DECREMENT2':
      return { ...state,mycount: state.mycount - 1 };
    default:
      return state;
  }
};

const Home = ({AuthContext}) => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext)
  const { state } = useContext(CounterContext);
  return (
    <div>
      <h1>Counter Value: {state.count}</h1>
      <h1>MyCounter Value: {state.mycount}</h1>
      <Link to="/counter">Counter</Link>
      <Link to="/mycounter">MyCounter</Link>
    </div>
  );
};

const Counter = ({AuthContext}) => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext)
  const { state, dispatch } = useContext(CounterContext);
  const navigate = useNavigate();
  console.log(user)
  const fetchCounter = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/counter', {
        params: {
            email: user.email
        }
    });
    console.log(response)
      dispatch({ type: 'SET', count: response.data.count });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  const incrementCounter = useCallback(async () => {
    try {
      await await axios.post('http://localhost:5000/api/counter/increment', {
        email: user.email
    });
      dispatch({ type: 'INCREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const decrementCounter = useCallback(async () => {
    try {
      await axios.post('http://localhost:5000/api/counter/decrement',{
        email:user.email
      });
      dispatch({ type: 'DECREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);
// console.log("counter component")
  return (
    <div>
      <h2>Counter</h2>
      <p>Count: {state.count}</p>
      <p>MyCount: {state.mycount}</p>
      <button onClick={incrementCounter}>Increment</button>
      <button onClick={decrementCounter}>Decrement</button>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
};
const MyCounter = ({AuthContext}) => {
  const { user, loggedIn, checkLoginState } = useContext(AuthContext)
  const { state, dispatch } = useContext(CounterContext);
  const navigate = useNavigate();

  const fetchCounter = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/counter2', {
        params: {
            email: user.email
        }
    });
      dispatch({ type: 'SET2', mycount: response.data.mycount });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  const incrementCounter = useCallback(async () => {
    try {
      await axios.post('http://localhost:5000/api/counter/increment2',{
        email:user.email
      });
      dispatch({ type: 'INCREMENT2' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const decrementCounter = useCallback(async () => {
    try {
      await axios.post('http://localhost:5000/api/counter/decrement2',{
        email:user.email
      });
      dispatch({ type: 'DECREMENT2' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  return (
    <div>
      <h2>MyCounter</h2>
      <p>MyCount: {state.mycount}</p>
      <p>Count: {state.count}</p>
      <button onClick={incrementCounter}>Increment</button>
      <button onClick={decrementCounter}>Decrement</button>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
};

const MyApp = ({AuthContext}) => {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 ,mycount:0});

  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {/* <Router> */}
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/counter">Counter</Link>
              </li>
              <li>
                <Link to="/mycounter">MyCounter</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<Home AuthContext={AuthContext}/>} />
            <Route path="/counter" element={<Counter AuthContext={AuthContext}/>} />
            <Route path="/mycounter" element={<MyCounter AuthContext={AuthContext}/>} />
          </Routes>
        </div>
      {/* </Router> */}
    </CounterContext.Provider>
  );
};

export default MyApp;
