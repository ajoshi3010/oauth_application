import React, { useState, useEffect, useContext, useReducer, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MyApp from './MyApp';
export default function LandingPage({AuthContext}) {
    return (
        <MyApp AuthContext={AuthContext}/>
    )
}
