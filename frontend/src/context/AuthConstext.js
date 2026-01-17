import { createContext, useReducer } from 'react';

const INITIAL_STATE = {
    user: (() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    })(),
    isFetching: false,
    error: null,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, isFetching: true, error: null };
        case 'LOGIN_SUCCESS':
            return { ...state, user: action.payload, isFetching: false };
        case 'LOGIN_FAILURE':
            return { ...state, isFetching: false, error: action.payload };
        case 'LOGOUT':
            localStorage.removeItem('user'); // Remove user from localStorage
            return { ...state, user: null, isFetching: false, error: null };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};